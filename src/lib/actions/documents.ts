'use server';
import { and, desc, eq, sql } from 'drizzle-orm';
import {
  type NewDocumentParams, type DocumentParams,
  insertDocumentSchema, documents as documentsTable,
} from '@/lib/db/schema/documents';
import { db } from '@/lib/db';
import { generateEmbeddings } from '@/lib/rag/embedding';
import { embeddings as embeddingsTable } from '@/lib/db/schema/embeddings';
import { workspaces as workspacesTable } from '@/lib/db/schema/workspaces';
import { addRelation, deleteRelation } from '@/lib/fga/fga';
import { auth0 } from '@/lib/auth0';
import { ensureDefaultWorkspace } from '@/lib/workspaces/helpers';
import { nanoid } from '@/utils/nano-id';
import {
  type DocumentActor, requireDocumentActor, parseDocumentId, parseDocumentRecipients,
  documentReadScope, documentOwnerScope,
} from '@/lib/document-access';

async function currentActor() {
  return requireDocumentActor((await auth0.getSession())?.user);
}

async function ownedDocument(documentId: string, actor: DocumentActor) {
  const [document] = await db
    .select({
      id: documentsTable.id,
      userEmail: documentsTable.userEmail,
      sharedWith: documentsTable.sharedWith,
    })
    .from(documentsTable)
    .where(documentOwnerScope(documentId, actor))
    .limit(1);
  if (!document) throw new Error('Document not found.');
  return document;
}

export const createDocument = async (input: NewDocumentParams, text: string) => {
  const actor = await currentActor();
  const { content, fileName, fileType, sharedWith, workspaceId } = insertDocumentSchema.parse(input);
  if (!Buffer.isBuffer(content) || typeof text !== 'string' || !text.trim()) {
    throw new Error('Document content is required.');
  }
  const recipients = parseDocumentRecipients(sharedWith ?? []);
  let finalWorkspaceId: string | null;
  if (workspaceId) {
    const [workspace] = await db.select({ id: workspacesTable.id }).from(workspacesTable)
      .where(and(eq(workspacesTable.id, workspaceId), eq(workspacesTable.userId, actor.userId))).limit(1);
    if (!workspace) throw new Error('Workspace not found.');
    finalWorkspaceId = workspace.id;
  } else {
    finalWorkspaceId = (await ensureDefaultWorkspace(actor.userId, actor.email))?.id ?? null;
  }
  const documentId = nanoid();
  const embeddings = await generateEmbeddings(text);
  await db.transaction(async (transaction) => {
    await transaction.insert(documentsTable).values({
      id: documentId, content, fileName, fileType,
      userId: actor.userId, userEmail: actor.email,
      sharedWith: recipients, workspaceId: finalWorkspaceId,
    });
    if (embeddings.length) {
      await transaction.insert(embeddingsTable).values(embeddings.map((embedding) => ({
        fileName, documentId, ...embedding,
      })));
    }
    // Remote grants are not part of the SQL transaction. SQL reads also enforce the committed ACL.
    await addRelation(actor.email, documentId);
    for (const recipient of recipients) await addRelation(recipient, documentId, 'viewer');
  });
  return true;
};

export async function getDocumentsForUser(): Promise<Omit<DocumentParams, 'content'>[]> {
  const actor = await currentActor();
  const documents = await db.select({
    id: documentsTable.id, fileName: documentsTable.fileName, fileType: documentsTable.fileType,
    createdAt: documentsTable.createdAt, updatedAt: documentsTable.updatedAt,
    sharedWith: documentsTable.sharedWith, userId: documentsTable.userId,
    userEmail: documentsTable.userEmail, workspaceId: documentsTable.workspaceId,
  }).from(documentsTable).where(documentReadScope(actor)).orderBy(desc(documentsTable.createdAt));
  return documents.map((document) => document.userId === actor.userId
    ? document
    : { ...document, sharedWith: [actor.email] });
}

export async function getDocumentContent(documentId: string): Promise<Buffer | null> {
  const actor = await currentActor();
  const id = parseDocumentId(documentId);
  const [document] = await db.select({ content: documentsTable.content }).from(documentsTable)
    .where(and(eq(documentsTable.id, id), documentReadScope(actor))).limit(1);
  return document ? Buffer.from(document.content) : null;
}

export async function shareDocument(documentId: string, sharedWith: string[]) {
  const actor = await currentActor();
  const id = parseDocumentId(documentId);
  const recipients = parseDocumentRecipients(sharedWith);
  if (!recipients.length) throw new Error('At least one recipient is required.');
  const document = await ownedDocument(id, actor);
  for (const recipient of recipients) await addRelation(recipient, id, 'viewer');
  if (recipients.every((recipient) => document.sharedWith?.includes(recipient))) return;
  // Merge inside the update, not a read/modify/write snapshot that can lose a concurrent share.
  const merged = sql<string[]>`ARRAY(
    SELECT DISTINCT recipient
    FROM unnest(coalesce(${documentsTable.sharedWith}, ARRAY[]::varchar[]) ||
      ${sql.param(recipients, documentsTable.sharedWith)}::varchar[]) AS recipient
    ORDER BY recipient
  )`;
  const changed = await db.update(documentsTable)
    .set({ sharedWith: merged, updatedAt: new Date() })
    .where(documentOwnerScope(id, actor)).returning({ id: documentsTable.id });
  if (!changed.length) throw new Error('Document not found.');
}

export async function deleteDocument(documentId: string) {
  const actor = await currentActor();
  const id = parseDocumentId(documentId);
  const document = await ownedDocument(id, actor);
  const deleted = await db.delete(documentsTable).where(documentOwnerScope(id, actor))
    .returning({ id: documentsTable.id });
  if (!deleted.length) throw new Error('Document not found.');
  // Revoke application reads first. Remote cleanup is separate, not a cross-service transaction.
  let accessCleanupComplete = true;
  try { await deleteRelation(document.userEmail, id); } catch { accessCleanupComplete = false; }
  for (const recipient of new Set(document.sharedWith ?? [])) {
    try { await deleteRelation(recipient, id, 'viewer'); } catch { accessCleanupComplete = false; }
  }
  return { deleted: true, accessCleanupComplete };
}

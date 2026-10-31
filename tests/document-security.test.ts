import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { eq } from 'drizzle-orm';

const h = vi.hoisted(() => ({
  database: null as unknown as ReturnType<typeof drizzle>,
  user: null as unknown,
  sequence: 0,
  dbCalls: vi.fn(),
  grant: vi.fn(),
  revoke: vi.fn(),
  embed: vi.fn(),
  embedMany: vi.fn(),
  defaultWorkspace: vi.fn(),
  filter: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: new Proxy({}, {
    get(_target, property) {
      const value = Reflect.get(h.database, property);
      return typeof value === 'function' ? (...args: unknown[]) => {
        h.dbCalls(property);
        return value.apply(h.database, args);
      } : value;
    },
  }),
}));
vi.mock('@/lib/auth0', () => ({ auth0: { getSession: async () => h.user ? { user: h.user } : null } }));
vi.mock('@/lib/fga/fga', () => ({ addRelation: h.grant, deleteRelation: h.revoke }));
vi.mock('@/lib/workspaces/helpers', () => ({ ensureDefaultWorkspace: h.defaultWorkspace }));
vi.mock('@/utils/nano-id', () => ({ nanoid: () => `fixture-${++h.sequence}` }));
vi.mock('@ai-sdk/mistral', () => ({ mistral: { textEmbedding: () => ({ modelId: 'offline-fixture' }) } }));
vi.mock('ai', () => ({ embed: h.embed, embedMany: h.embedMany, tool: (definition: unknown) => definition }));
vi.mock('@auth0/ai', () => ({ FGAFilter: { create: () => ({ filter: h.filter }) } }));

import {
  createDocument, deleteDocument, getDocumentContent, getDocumentsForUser, shareDocument,
} from '@/lib/actions/documents';
import { documents } from '@/lib/db/schema/documents';
import { embeddings } from '@/lib/db/schema/embeddings';
import { DocumentAuthenticationError } from '@/lib/document-access';
import { findRelevantContent } from '@/lib/rag/embedding';
import { getContextDocumentsTool } from '@/lib/tools/context-docs';

const alice = { sub: 'auth0|alice-fixture', email: 'alice@example.invalid', email_verified: true };
const bob = { sub: 'auth0|bob-fixture', email: 'bob@example.invalid', email_verified: true };
const carol = { sub: 'auth0|carol-fixture', email: 'carol@example.invalid', email_verified: true };
let pg: PGlite;

function input() {
  return {
    content: Buffer.from('offline fixture bytes'),
    fileName: 'created-fixture.txt',
    fileType: 'text/plain',
    sharedWith: [] as string[],
    workspaceId: null as string | null,
  };
}

async function row(id: string) {
  return (await h.database.select().from(documents).where(eq(documents.id, id)))[0];
}

beforeAll(async () => {
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('External requests are forbidden in offline tests.'); }));
  pg = new PGlite();
  h.database = drizzle(pg);
  // Minimal PostgreSQL fixtures. Constant distance tests ACLs, not vector quality or a deployed schema.
  await pg.exec(`
    CREATE TABLE workspaces (id varchar(191) PRIMARY KEY, user_id varchar(191) NOT NULL);
    CREATE TABLE documents (
      id varchar(191) PRIMARY KEY, content bytea NOT NULL, file_name varchar(300) NOT NULL,
      file_type varchar(100) NOT NULL, created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now(), user_id varchar(191) NOT NULL,
      user_email varchar(191) NOT NULL, workspace_id varchar(191), shared_with varchar(300)[]
    );
    CREATE TABLE embeddings (
      id varchar(191) PRIMARY KEY, document_id varchar(191) REFERENCES documents(id) ON DELETE CASCADE,
      content text NOT NULL, file_name varchar(300) NOT NULL, embedding text NOT NULL
    );
    CREATE FUNCTION fixture_distance(text,text) RETURNS float8
      LANGUAGE SQL IMMUTABLE AS 'SELECT 0.1::float8';
    CREATE OPERATOR <=> (LEFTARG=text, RIGHTARG=text, FUNCTION=fixture_distance);
  `);
});

beforeEach(async () => {
  h.user = alice;
  h.sequence = 0;
  h.grant.mockReset().mockResolvedValue(undefined);
  h.revoke.mockReset().mockResolvedValue(undefined);
  h.embed.mockReset().mockResolvedValue({ embedding: [1, 0] });
  h.embedMany.mockReset().mockResolvedValue({ embeddings: [] });
  h.defaultWorkspace.mockReset().mockResolvedValue({ id: 'alice-workspace' });
  h.filter.mockReset().mockImplementation(async (candidates) => candidates);
  await pg.exec('DELETE FROM embeddings; DELETE FROM documents; DELETE FROM workspaces;');
  await pg.query('INSERT INTO workspaces VALUES ($1,$2),($3,$4)', [
    'alice-workspace', alice.sub, 'bob-workspace', bob.sub,
  ]);
  const fixtures = [
    { id: 'owner-doc', user: alice, shares: [], text: 'OWNER FIXTURE' },
    { id: 'shared-doc', user: alice, shares: [bob.email, carol.email], text: 'SHARED FIXTURE' },
    { id: 'foreign-doc', user: carol, shares: ['*'], text: 'FOREIGN FIXTURE' },
    { id: 'bob-doc', user: bob, shares: [], text: 'BOB FIXTURE' },
    { id: 'null-shares', user: alice, shares: null, text: 'NULL FIXTURE' },
  ];
  for (const fixture of fixtures) {
    await h.database.insert(documents).values({
      id: fixture.id, content: Buffer.from(fixture.text), fileName: `${fixture.id}.txt`,
      fileType: 'text/plain', userId: fixture.user.sub, userEmail: fixture.user.email,
      workspaceId: null, sharedWith: fixture.shares,
    });
    await h.database.insert(embeddings).values({
      id: `${fixture.id}-embedding`, documentId: fixture.id,
      content: fixture.text, fileName: `${fixture.id}.txt`, embedding: [1, 0],
    });
  }
  h.dbCalls.mockClear();
});

afterAll(async () => {
  await pg?.close();
  vi.unstubAllGlobals();
});

describe('document boundaries with real offline SQL', () => {
  const anonymousCalls = [
    ['list', () => getDocumentsForUser()],
    ['download', () => getDocumentContent('shared-doc')],
    ['share', () => shareDocument('shared-doc', ['reader@example.invalid'])],
    ['delete', () => deleteDocument('shared-doc')],
    ['create', () => createDocument(input(), 'fixture text')],
    ['retrieval', () => findRelevantContent('fixture query')],
  ] as const;
  it.each(anonymousCalls)('rejects anonymous %s before side effects', async (_label, action) => {
    h.user = null;
    await expect(action()).rejects.toBeInstanceOf(DocumentAuthenticationError);
    expect(h.dbCalls).not.toHaveBeenCalled();
    expect(h.grant).not.toHaveBeenCalled();
    expect(h.revoke).not.toHaveBeenCalled();
    expect(h.embed).not.toHaveBeenCalled();
    expect(h.embedMany).not.toHaveBeenCalled();
    expect(h.defaultWorkspace).not.toHaveBeenCalled();
  });

  it('refuses malformed session identities before querying', async () => {
    h.user = { sub: alice.sub };
    await expect(getDocumentsForUser()).rejects.toBeInstanceOf(DocumentAuthenticationError);
    expect(h.dbCalls).not.toHaveBeenCalled();
  });

  it('allows owner and verified viewer downloads but not unrelated or unverified viewers', async () => {
    expect((await getDocumentContent('owner-doc'))?.toString()).toBe('OWNER FIXTURE');
    h.user = bob;
    expect((await getDocumentContent('shared-doc'))?.toString()).toBe('SHARED FIXTURE');
    expect(await getDocumentContent('owner-doc')).toBeNull();
    expect(await getDocumentContent('foreign-doc')).toBeNull();
    h.user = { ...bob, email_verified: false };
    expect(await getDocumentContent('shared-doc')).toBeNull();
    expect((await getDocumentContent('bob-doc'))?.toString()).toBe('BOB FIXTURE');
  });

  it('returns only visible metadata and hides other recipients from a viewer', async () => {
    h.user = bob;
    const list = await getDocumentsForUser();
    expect(list.map((document) => document.id).sort()).toEqual(['bob-doc', 'shared-doc']);
    expect(list.find((document) => document.id === 'shared-doc')?.sharedWith).toEqual([bob.email]);
    expect(list.every((document) => !('content' in document))).toBe(true);
  });

  it.each(['share', 'delete'] as const)('blocks viewer %s without remote changes', async (operation) => {
    h.user = bob;
    const before = await row('shared-doc');
    await expect(operation === 'share'
      ? shareDocument('shared-doc', ['reader@example.invalid'])
      : deleteDocument('shared-doc')).rejects.toThrow('Document not found.');
    expect(await row('shared-doc')).toEqual(before);
    expect(h.grant).not.toHaveBeenCalled();
    expect(h.revoke).not.toHaveBeenCalled();
  });

  it.each(['*', 'user:*', '', 'not-an-email', 'reader@example.invalid\r\nBcc: other@example.invalid'])(
    'rejects invalid share recipient %j before SQL or FGA', async (recipient) => {
      await expect(shareDocument('owner-doc', [recipient])).rejects.toBeDefined();
      expect(h.dbCalls).not.toHaveBeenCalled();
      expect(h.grant).not.toHaveBeenCalled();
    },
  );

  it('normalizes and deduplicates a share into a nullable legacy array', async () => {
    await shareDocument('null-shares', [' reader@example.invalid ', 'reader@example.invalid']);
    expect((await row('null-shares')).sharedWith).toEqual(['reader@example.invalid']);
    expect(h.grant).toHaveBeenCalledExactlyOnceWith('reader@example.invalid', 'null-shares', 'viewer');
  });

  it('preserves concurrent additive shares with the SQL merge', async () => {
    await Promise.all([
      shareDocument('null-shares', ['first@example.invalid']),
      shareDocument('null-shares', ['second@example.invalid']),
    ]);
    expect((await row('null-shares')).sharedWith?.sort()).toEqual([
      'first@example.invalid', 'second@example.invalid',
    ]);
  });

  it('does not persist a share when remote grant fails', async () => {
    h.grant.mockRejectedValueOnce(new Error('offline grant failure'));
    await expect(shareDocument('owner-doc', ['reader@example.invalid'])).rejects.toThrow();
    expect((await row('owner-doc')).sharedWith).toEqual([]);
  });

  it('rechecks ownership in the final share mutation', async () => {
    h.grant.mockImplementationOnce(async () => {
      await h.database.update(documents).set({ userId: carol.sub }).where(eq(documents.id, 'owner-doc'));
    });
    await expect(shareDocument('owner-doc', ['reader@example.invalid'])).rejects.toThrow('Document not found.');
    expect((await row('owner-doc')).sharedWith).toEqual([]);
  });

  it('rejects a foreign workspace before model and remote permission calls', async () => {
    await expect(createDocument({ ...input(), workspaceId: 'bob-workspace' }, 'fixture text'))
      .rejects.toThrow('Workspace not found.');
    expect(h.grant).not.toHaveBeenCalled();
    expect(h.embedMany).not.toHaveBeenCalled();
    expect(h.defaultWorkspace).not.toHaveBeenCalled();
  });

  it('sets the owner and initial viewers even when there are no embeddings', async () => {
    const params = Object.assign(input(), {
      userId: carol.sub, userEmail: carol.email, sharedWith: [bob.email],
    });
    await expect(createDocument(params, 'fixture text')).resolves.toBe(true);
    const created = await row('fixture-1');
    expect(created.userId).toBe(alice.sub);
    expect(created.userEmail).toBe(alice.email);
    expect(Buffer.from(created.content)).toEqual(params.content);
    expect(h.grant).toHaveBeenCalledWith(alice.email, created.id);
    expect(h.grant).toHaveBeenCalledWith(bob.email, created.id, 'viewer');
  });

  it('rolls back a newly created SQL document on a failed remote grant', async () => {
    h.grant.mockRejectedValueOnce(new Error('offline grant failure'));
    await expect(createDocument(input(), 'fixture text')).rejects.toThrow();
    expect(await row('fixture-1')).toBeUndefined();
  });

  it('allows an explicitly owned workspace without creating a default', async () => {
    await createDocument({ ...input(), workspaceId: 'alice-workspace' }, 'fixture text');
    expect((await row('fixture-1')).workspaceId).toBe('alice-workspace');
    expect(h.defaultWorkspace).not.toHaveBeenCalled();
  });

  it('deletes with a stable subject and cleans the stored owner email after an email change', async () => {
    h.user = { ...alice, email: 'changed@example.invalid' };
    await expect(deleteDocument('null-shares')).resolves.toEqual({ deleted: true, accessCleanupComplete: true });
    expect(await row('null-shares')).toBeUndefined();
    expect(h.revoke).toHaveBeenCalledExactlyOnceWith(alice.email, 'null-shares');
  });

  it('reports remote cleanup failure after revoking SQL access', async () => {
    h.revoke.mockRejectedValueOnce(new Error('offline cleanup failure'));
    await expect(deleteDocument('shared-doc')).resolves.toEqual({ deleted: true, accessCleanupComplete: false });
    expect(await row('shared-doc')).toBeUndefined();
    h.user = bob;
    expect(await getDocumentContent('shared-doc')).toBeNull();
    expect(h.revoke).toHaveBeenCalledWith(bob.email, 'shared-doc', 'viewer');
  });

  it('filters retrieval through SQL even when the FGA filter permits every candidate', async () => {
    h.user = bob;
    await h.database.insert(embeddings).values({
      id: 'orphan-embedding', documentId: null, content: 'ORPHAN FIXTURE',
      fileName: 'orphan.txt', embedding: [1, 0],
    });
    const result = await getContextDocumentsTool.execute!(
      { question: 'fixture query' }, { toolCallId: 'offline-fixture', messages: [] },
    );
    const serialized = JSON.stringify(result);
    expect(serialized).toContain('SHARED FIXTURE');
    expect(serialized).toContain('BOB FIXTURE');
    expect(serialized).not.toContain('OWNER FIXTURE');
    expect(serialized).not.toContain('FOREIGN FIXTURE');
    expect(serialized).not.toContain('ORPHAN FIXTURE');
    expect(h.filter).toHaveBeenCalled();
  });
});

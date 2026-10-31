import { and, arrayContains, eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { documents } from '@/lib/db/schema/documents';

const actorSchema = z.object({
  sub: z.string().min(1).max(191).refine((value) => value.trim().length > 0),
  email: z.string().trim().email().max(191),
  email_verified: z.boolean().optional(),
});
const documentIdSchema = z.string().min(1).max(191);
const recipientsSchema = z.array(z.string().trim().email().max(254)).max(100);

export class DocumentAuthenticationError extends Error {
  constructor() {
    super('Sign in with an email-bearing account to access documents.');
    this.name = 'DocumentAuthenticationError';
  }
}

export type DocumentActor = {
  userId: string;
  email: string;
  emailVerified: boolean;
};

export function requireDocumentActor(user: unknown): DocumentActor {
  const result = actorSchema.safeParse(user);
  if (!result.success) throw new DocumentAuthenticationError();
  return {
    userId: result.data.sub,
    email: result.data.email,
    emailVerified: result.data.email_verified === true,
  };
}

export function parseDocumentId(value: unknown) {
  return documentIdSchema.parse(value);
}

export function parseDocumentRecipients(value: unknown) {
  return [...new Set(recipientsSchema.parse(value))];
}

export function documentReadScope(actor: DocumentActor) {
  const owner = eq(documents.userId, actor.userId);
  // A matching, verified email can read an explicit share; workspace membership is not a grant.
  return actor.emailVerified
    ? or(owner, arrayContains(documents.sharedWith, [actor.email]))!
    : owner;
}

export function documentOwnerScope(documentId: string, actor: DocumentActor) {
  return and(eq(documents.id, documentId), eq(documents.userId, actor.userId))!;
}

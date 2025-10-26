'use server';
import { eq, desc, and } from 'drizzle-orm';

import {
  NewPlaybookParams,
  insertPlaybookSchema,
  playbooks as playbooksTable,
  PlaybookParams,
} from '@/lib/db/schema/playbooks';
import { db } from '@/lib/db';
import { auth0 } from '@/lib/auth0';

export const createPlaybook = async (input: NewPlaybookParams) => {
  const session = await auth0.getSession();
  const user = session?.user!;
  const playbookData = insertPlaybookSchema.parse(input);

  const [playbook] = await db
    .insert(playbooksTable)
    .values({
      ...playbookData,
      userId: user.sub,
      userEmail: user.email!,
    })
    .returning();

  return playbook;
};

export async function getPlaybooksForUser(workspaceId?: string): Promise<PlaybookParams[]> {
  const session = await auth0.getSession();
  const user = session?.user!;

  try {
    const conditions = workspaceId
      ? and(eq(playbooksTable.userId, user.sub), eq(playbooksTable.workspaceId, workspaceId))
      : eq(playbooksTable.userId, user.sub);

    const userPlaybooks = await db
      .select()
      .from(playbooksTable)
      .where(conditions)
      .orderBy(desc(playbooksTable.createdAt));

    return userPlaybooks;
  } catch (error) {
    console.error('Error fetching playbooks for user:', error);
    return [];
  }
}

export async function getPlaybook(playbookId: string): Promise<PlaybookParams | null> {
  try {
    const playbook = await db.select().from(playbooksTable).where(eq(playbooksTable.id, playbookId));

    return playbook[0] ?? null;
  } catch (error) {
    console.error('Error fetching playbook:', error);
    return null;
  }
}

export async function updatePlaybook(playbookId: string, updates: Partial<NewPlaybookParams>) {
  await db
    .update(playbooksTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(playbooksTable.id, playbookId));

  return true;
}

export async function deletePlaybook(playbookId: string) {
  await db.delete(playbooksTable).where(eq(playbooksTable.id, playbookId));
  return true;
}

export async function togglePlaybookActive(playbookId: string, isActive: boolean) {
  await db
    .update(playbooksTable)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(playbooksTable.id, playbookId));

  return true;
}

export async function incrementPlaybookRunCount(playbookId: string) {
  const playbook = await getPlaybook(playbookId);
  if (!playbook) return;

  await db
    .update(playbooksTable)
    .set({
      runCount: (playbook.runCount || 0) + 1,
      lastRunAt: new Date(),
    })
    .where(eq(playbooksTable.id, playbookId));
}

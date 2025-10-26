'use server';
import { eq, desc, and } from 'drizzle-orm';

import {
  NewWorkspaceParams,
  insertWorkspaceSchema,
  workspaces as workspacesTable,
  WorkspaceParams,
} from '@/lib/db/schema/workspaces';
import { db } from '@/lib/db';
import { auth0 } from '@/lib/auth0';
import { fgaClient } from '@/lib/fga/fga';

export const createWorkspace = async (input: NewWorkspaceParams) => {
  const session = await auth0.getSession();
  const user = session?.user!;
  const workspaceData = insertWorkspaceSchema.parse(input);

  const [workspace] = await db
    .insert(workspacesTable)
    .values({
      ...workspaceData,
      userId: user.sub,
      userEmail: user.email!,
    })
    .returning();

  await fgaClient.write({
    writes: [{ user: `user:${user.email}`, relation: 'owner', object: `workspace:${workspace.id}` }],
  });

  return workspace;
};

export async function getWorkspacesForUser(): Promise<WorkspaceParams[]> {
  const session = await auth0.getSession();
  const user = session?.user!;

  try {
    const userWorkspaces = await db
      .select()
      .from(workspacesTable)
      .where(eq(workspacesTable.userId, user.sub))
      .orderBy(desc(workspacesTable.createdAt));

    return userWorkspaces;
  } catch (error) {
    console.error('Error fetching workspaces for user:', error);
    return [];
  }
}

export async function getWorkspace(workspaceId: string): Promise<WorkspaceParams | null> {
  try {
    const workspace = await db
      .select()
      .from(workspacesTable)
      .where(eq(workspacesTable.id, workspaceId));

    return workspace[0] ?? null;
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return null;
  }
}

export async function updateWorkspace(workspaceId: string, updates: Partial<NewWorkspaceParams>) {
  const session = await auth0.getSession();
  const user = session?.user!;

  await db
    .update(workspacesTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(workspacesTable.id, workspaceId));

  return true;
}

export async function deleteWorkspace(workspaceId: string) {
  const session = await auth0.getSession();
  const user = session?.user!;

  await fgaClient.write({
    deletes: [{ user: `user:${user.email}`, relation: 'owner', object: `workspace:${workspaceId}` }],
  });

  await db.delete(workspacesTable).where(eq(workspacesTable.id, workspaceId));

  return true;
}

export async function setDefaultWorkspace(workspaceId: string) {
  const session = await auth0.getSession();
  const user = session?.user!;

  await db.update(workspacesTable).set({ isDefault: false }).where(eq(workspacesTable.userId, user.sub));

  await db
    .update(workspacesTable)
    .set({ isDefault: true })
    .where(eq(workspacesTable.id, workspaceId));

  return true;
}

export async function getDefaultWorkspace(): Promise<WorkspaceParams | null> {
  const session = await auth0.getSession();
  const user = session?.user!;

  const workspace = await db
    .select()
    .from(workspacesTable)
    .where(and(eq(workspacesTable.userId, user.sub), eq(workspacesTable.isDefault, true)))
    .limit(1);

  return workspace[0] ?? null;
}

import { eq, and } from 'drizzle-orm';

import { db } from '@/lib/db';
import { workspaces } from '@/lib/db/schema/workspaces';
import { fgaClient } from '@/lib/fga/fga';

export async function findDefaultWorkspace(userId: string) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.userId, userId), eq(workspaces.isDefault, true)))
    .limit(1);

  return workspace ?? null;
}

export async function ensureDefaultWorkspace(userId: string, userEmail: string) {
  const existing = await findDefaultWorkspace(userId);
  if (existing) {
    return existing;
  }

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: 'Personal',
      description: 'Default workspace for your personal context',
      icon: 'sparkles',
      color: 'purple',
      isDefault: true,
      userId,
      userEmail,
    })
    .returning();

  await fgaClient.write({
    writes: [{ user: `user:${userEmail}`, relation: 'owner', object: `workspace:${workspace.id}` }],
  });

  return workspace;
}

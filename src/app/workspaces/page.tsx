import Link from 'next/link';
import { PlusCircle, Settings, Users } from 'lucide-react';

import { getWorkspacesForUser } from '@/lib/actions/workspaces';
import { auth0 } from '@/lib/auth0';
import { cn } from '@/utils/cn';

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-600',
  purple: 'bg-purple-500/10 text-purple-600',
  green: 'bg-green-500/10 text-green-600',
  orange: 'bg-orange-500/10 text-orange-600',
  slate: 'bg-slate-500/10 text-slate-600',
};

export default async function WorkspacesPage() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">Workspaces</h1>
        <p className="text-muted-foreground">Please sign in with Auth0 to manage your workspaces.</p>
      </div>
    );
  }

  const workspaces = await getWorkspacesForUser();

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">Workspaces</h1>
          <p className="text-muted-foreground">
            Organize your life into secure contexts powered by Auth0 Fine-Grained Authorization.
          </p>
        </div>
        <Link
          href="/workspaces/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" /> New workspace
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="border rounded-lg bg-card p-6 shadow-sm card-hover">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-full',
                      COLOR_CLASSES[workspace.color || 'blue'] || COLOR_CLASSES.blue,
                    )}
                  >
                    <span className="text-lg font-semibold capitalize">{workspace.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{workspace.name}</h2>
                    <p className="text-sm text-muted-foreground">{workspace.description || 'No description provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                  {workspace.isDefault && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">Default</span>
                  )}
                </div>
              </div>
              <Link
                href={`/workspaces/${workspace.id}`}
                className="rounded-md border px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Manage
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
              <div className="rounded-md bg-muted/50 p-3">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-4 w-4" /> Members
                </p>
                <p className="text-lg font-semibold">1</p>
                <p className="text-xs text-muted-foreground">Invite teammates soon</p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Settings className="h-4 w-4" /> Policies
                </p>
                <p className="text-lg font-semibold">FGA enforced</p>
                <p className="text-xs text-muted-foreground">Granular access to docs & tools</p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ActivityBadge /> Automations
                </p>
                <p className="text-lg font-semibold">Coming soon</p>
                <p className="text-xs text-muted-foreground">Playbooks to orchestrate routines</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workspaces.length === 0 && (
        <div className="mt-12 rounded-lg border bg-muted/50 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first workspace to separate your work, personal, or family contexts with strong Auth0 governance.
          </p>
          <Link href="/workspaces/new" className="text-sm text-primary hover:underline">
            Create workspace →
          </Link>
        </div>
      )}
    </div>
  );
}

const ActivityBadge = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

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
          <h1 className="font-space-mono text-4xl font-bold mb-2 text-console">WORKSPACES</h1>
          <p className="font-ibm-plex-mono text-console/70">
            Organize your life into secure contexts powered by Auth0 Fine-Grained Authorization.
          </p>
        </div>
        <Link
          href="/workspaces/new"
          className="terminal-border inline-flex items-center gap-2 bg-console text-pale px-4 py-2 font-ibm-plex-mono text-sm font-bold tracking-wider hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <PlusCircle className="h-4 w-4" /> New workspace
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="border-2 border-console bg-pale p-6 hover:bg-mint transition-colors">
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
                    <h2 className="font-ibm-plex-mono text-xl font-bold text-console">{workspace.name}</h2>
                    <p className="font-ibm-plex-mono text-xs text-console/70">{workspace.description || 'No description provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 font-ibm-plex-mono text-xs text-console/70">
                  <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                  {workspace.isDefault && (
                    <span className="border border-accent-orange bg-accent-orange/10 px-2 py-1 text-accent-orange font-bold">DEFAULT</span>
                  )}
                </div>
              </div>
              <Link
                href={`/workspaces/${workspace.id}`}
                className="border-2 border-console px-3 py-1 font-ibm-plex-mono text-xs font-bold text-console hover:bg-console hover:text-pale transition-colors"
              >
                Manage
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-mint border border-console p-3">
                <p className="flex items-center gap-2 font-ibm-plex-mono text-xs text-console/70 tracking-wider">
                  <Users className="h-4 w-4" /> Members
                </p>
                <p className="font-space-mono text-lg font-bold text-console">1</p>
                <p className="font-ibm-plex-mono text-xs text-console/70">Invite teammates soon</p>
              </div>
              <div className="bg-mint border border-console p-3">
                <p className="flex items-center gap-2 font-ibm-plex-mono text-xs text-console/70 tracking-wider">
                  <Settings className="h-4 w-4" /> Policies
                </p>
                <p className="font-space-mono text-lg font-bold text-console">FGA enforced</p>
                <p className="font-ibm-plex-mono text-xs text-console/70">Granular access to docs & tools</p>
              </div>
              <div className="bg-mint border border-console p-3">
                <p className="flex items-center gap-2 font-ibm-plex-mono text-xs text-console/70 tracking-wider">
                  <ActivityBadge /> Automations
                </p>
                <p className="font-space-mono text-lg font-bold text-console">Coming soon</p>
                <p className="font-ibm-plex-mono text-xs text-console/70">Playbooks to orchestrate routines</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workspaces.length === 0 && (
        <div className="mt-12 border-2 border-console bg-pale p-8 text-center">
          <h3 className="font-ibm-plex-mono text-lg font-bold mb-2 text-console">NO WORKSPACES YET</h3>
          <p className="font-ibm-plex-mono text-xs text-console/70 mb-4">
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

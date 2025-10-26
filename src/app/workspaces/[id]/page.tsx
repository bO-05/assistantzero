import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Settings, Trash2, Users, Star, Calendar } from 'lucide-react';

import { getWorkspace, deleteWorkspace, setDefaultWorkspace } from '@/lib/actions/workspaces';
import { auth0 } from '@/lib/auth0';
import { cn } from '@/utils/cn';

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-600 border-blue-600',
  purple: 'bg-purple-500/10 text-purple-600 border-purple-600',
  green: 'bg-green-500/10 text-green-600 border-green-600',
  orange: 'bg-orange-500/10 text-orange-600 border-orange-600',
  slate: 'bg-slate-500/10 text-slate-600 border-slate-600',
};

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    redirect('/');
  }

  const workspace = await getWorkspace(id);

  if (!workspace) {
    notFound();
  }

  // Check if user owns this workspace
  if (workspace.userId !== user.sub) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">You don&apos;t have permission to view this workspace.</p>
        <Link href="/workspaces" className="text-primary hover:underline">
          ← Back to workspaces
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <Link
        href="/workspaces"
        className="inline-flex items-center gap-2 mb-6 font-ibm-plex-mono text-console hover:text-console/70 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workspaces
      </Link>

      <div className="border-2 border-console bg-pale p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'inline-flex h-16 w-16 items-center justify-center rounded-full border-2',
                COLOR_CLASSES[workspace.color || 'blue'] || COLOR_CLASSES.blue,
              )}
            >
              <span className="text-2xl font-bold capitalize">{workspace.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="font-space-mono text-3xl font-bold text-console mb-1">{workspace.name}</h1>
              <p className="font-ibm-plex-mono text-sm text-console/70">{workspace.description || 'No description'}</p>
            </div>
          </div>

          {workspace.isDefault && (
            <span className="border-2 border-accent-orange bg-accent-orange/10 px-3 py-1 text-accent-orange font-ibm-plex-mono text-xs font-bold">
              DEFAULT
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-mint border-2 border-console p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-console" />
              <span className="font-ibm-plex-mono text-xs text-console/70 font-bold">CREATED</span>
            </div>
            <p className="font-space-mono text-lg font-bold text-console">
              {new Date(workspace.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="bg-mint border-2 border-console p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-console" />
              <span className="font-ibm-plex-mono text-xs text-console/70 font-bold">MEMBERS</span>
            </div>
            <p className="font-space-mono text-lg font-bold text-console">1 (You)</p>
            <p className="font-ibm-plex-mono text-xs text-console/70 mt-1">Team collaboration coming soon</p>
          </div>

          <div className="bg-mint border-2 border-console p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-console" />
              <span className="font-ibm-plex-mono text-xs text-console/70 font-bold">FGA POLICIES</span>
            </div>
            <p className="font-space-mono text-lg font-bold text-console">Active</p>
            <p className="font-ibm-plex-mono text-xs text-console/70 mt-1">Fine-grained authorization enforced</p>
          </div>
        </div>

        <div className="border-t-2 border-console pt-6">
          <h2 className="font-ibm-plex-mono text-lg font-bold text-console mb-4">WORKSPACE ACTIONS</h2>
          
          <div className="flex flex-col gap-3">
            {!workspace.isDefault && (
              <form action={async () => {
                'use server';
                await setDefaultWorkspace(id);
                redirect('/workspaces/' + id);
              }}>
                <button
                  type="submit"
                  className="w-full border-2 border-console bg-pale hover:bg-mint px-4 py-3 font-ibm-plex-mono text-sm font-bold text-console transition-colors flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Set as default workspace
                </button>
              </form>
            )}

            <Link
              href={`/workspaces/${id}/settings`}
              className="w-full border-2 border-console bg-pale hover:bg-mint px-4 py-3 font-ibm-plex-mono text-sm font-bold text-console transition-colors flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit workspace settings
            </Link>

            {!workspace.isDefault && (
              <form action={async () => {
                'use server';
                await deleteWorkspace(id);
                redirect('/workspaces');
              }}>
                <button
                  type="submit"
                  className="w-full border-2 border-red-600 bg-red-50 hover:bg-red-100 px-4 py-3 font-ibm-plex-mono text-sm font-bold text-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete workspace
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-2 border-console bg-mint p-6">
        <h3 className="font-ibm-plex-mono text-sm font-bold text-console mb-2">📘 ABOUT WORKSPACES</h3>
        <p className="font-ibm-plex-mono text-xs text-console/70">
          Workspaces help you organize different contexts (work, personal, family) with separate documents, tools access, and audit logs.
          All actions are protected by Auth0 Fine-Grained Authorization (FGA) for enterprise-grade security.
        </p>
      </div>
    </div>
  );
}

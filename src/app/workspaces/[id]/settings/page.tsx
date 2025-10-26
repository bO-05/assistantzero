import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

import { getWorkspace, updateWorkspace } from '@/lib/actions/workspaces';
import { auth0 } from '@/lib/auth0';

const COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'slate', label: 'Slate', class: 'bg-slate-500' },
];

export default async function WorkspaceSettingsPage({ params }: { params: Promise<{ id: string }> }) {
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
        <p className="text-muted-foreground mb-4">You don&apos;t have permission to edit this workspace.</p>
        <Link href="/workspaces" className="text-primary hover:underline">
          ← Back to workspaces
        </Link>
      </div>
    );
  }

  async function handleUpdate(formData: FormData) {
    'use server';
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const color = formData.get('color') as string;

    if (!name || name.trim().length === 0) {
      return;
    }

    await updateWorkspace(id, {
      name: name.trim(),
      description: description?.trim() || null,
      color: color || 'blue',
    });

    redirect(`/workspaces/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link
        href={`/workspaces/${id}`}
        className="inline-flex items-center gap-2 mb-6 font-ibm-plex-mono text-console hover:text-console/70 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workspace
      </Link>

      <div className="border-2 border-console bg-pale p-8">
        <h1 className="font-space-mono text-3xl font-bold text-console mb-6">Workspace Settings</h1>

        <form action={handleUpdate} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block font-ibm-plex-mono text-sm font-bold text-console mb-2">
              Workspace Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={workspace.name}
              maxLength={50}
              className="w-full border-2 border-console bg-white px-4 py-2 font-ibm-plex-mono text-console focus:outline-none focus:ring-2 focus:ring-console"
              placeholder="e.g., Work, Personal, Family"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block font-ibm-plex-mono text-sm font-bold text-console mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={workspace.description || ''}
              maxLength={200}
              className="w-full border-2 border-console bg-white px-4 py-2 font-ibm-plex-mono text-console focus:outline-none focus:ring-2 focus:ring-console resize-none"
              placeholder="Optional description of this workspace"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block font-ibm-plex-mono text-sm font-bold text-console mb-3">Color Theme</label>
            <div className="flex gap-3">
              {COLORS.map((colorOption) => (
                <label key={colorOption.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={colorOption.value}
                    defaultChecked={workspace.color === colorOption.value}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-12 h-12 ${colorOption.class} border-2 border-console peer-checked:ring-4 peer-checked:ring-console peer-checked:ring-offset-2 transition-all`}
                    title={colorOption.label}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-mint border-2 border-console p-4">
            <p className="font-ibm-plex-mono text-xs text-console/70">
              <strong>Note:</strong> Changes to workspace settings will apply immediately. Documents and audit logs remain associated with this workspace.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="border-2 border-console bg-console text-pale px-6 py-3 font-ibm-plex-mono text-sm font-bold hover:bg-console/90 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <Link
              href={`/workspaces/${id}`}
              className="border-2 border-console bg-pale text-console px-6 py-3 font-ibm-plex-mono text-sm font-bold hover:bg-mint transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

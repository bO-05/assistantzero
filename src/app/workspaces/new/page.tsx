import Link from 'next/link';

import { auth0 } from '@/lib/auth0';

export default async function NewWorkspacePage() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">Create a workspace</h1>
        <p className="text-muted-foreground">Please sign in with Auth0 to create and manage workspaces.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Create a workspace</h1>
      <p className="text-muted-foreground mb-6">
        A guided experience for creating secure workspaces is coming soon. In the meantime, workspaces are generated
        automatically when you start a conversation, and you can manage existing contexts from the Workspaces dashboard.
      </p>
      <div className="rounded-lg border bg-muted/50 p-6">
        <h2 className="text-lg font-semibold mb-2">Why workspaces?</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
          <li>Keep work, personal, and family data isolated with Auth0 FGA enforcement.</li>
          <li>Scope documents, playbooks, and automations to specific contexts.</li>
          <li>Share access with teammates without exposing private content.</li>
        </ul>
      </div>
      <div className="mt-8">
        <Link href="/workspaces" className="text-sm text-primary hover:underline">
          ← Back to workspaces
        </Link>
      </div>
    </div>
  );
}

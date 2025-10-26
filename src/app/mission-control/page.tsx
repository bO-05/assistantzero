import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';

import { getAuditLogsForUser } from '@/lib/actions/audit';
import { auth0 } from '@/lib/auth0';

export default async function MissionControlPage() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h1 className="text-3xl font-semibold mb-2">Mission Control</h1>
        <p className="text-muted-foreground">Please sign in with Auth0 to view the audit trail for your AI agent.</p>
      </div>
    );
  }

  const logs = await getAuditLogsForUser();

  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.status === 'success').length,
    pending: logs.filter((l) => l.status === 'pending').length,
    failure: logs.filter((l) => l.status === 'failure').length,
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mission Control</h1>
        <p className="text-muted-foreground">
          Comprehensive audit trail of all agent actions with Auth0 context and security posture
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Actions</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-3xl font-bold text-green-600">{stats.success}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failure}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold">Recent Activity Timeline</h2>
        </div>

        <div className="divide-y">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity yet. Start a conversation to see audit logs here.</p>
            </div>
          ) : (
            logs.slice(0, 50).map((log) => (
              <div key={log.id} className="p-6 hover:bg-muted/50 transition-all duration-200 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {log.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {log.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                    {log.status === 'failure' && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                      {log.toolName && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {log.toolName}
                        </span>
                      )}
                      {log.agentRole && (
                        <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">
                          {log.agentRole}
                        </span>
                      )}
                      {log.riskScore && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            log.riskScore === 'high'
                              ? 'bg-red-500/10 text-red-600'
                              : log.riskScore === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-600'
                                : 'bg-green-500/10 text-green-600'
                          }`}
                        >
                          Risk: {log.riskScore}
                        </span>
                      )}
                      {log.requiresApproval && (
                        <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Requires Approval
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">
                      {new Date(log.createdAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })}
                      {log.durationMs && <span className="ml-2">• Duration: {log.durationMs}ms</span>}
                    </div>

                    {log.inputs && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                          View inputs
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-x-auto">
                          {JSON.stringify(log.inputs, null, 2)}
                        </pre>
                      </details>
                    )}

                    {log.outputs && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                          View outputs
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-x-auto">
                          {JSON.stringify(log.outputs, null, 2)}
                        </pre>
                      </details>
                    )}

                    {log.errorMessage && (
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600">
                        <p className="font-semibold mb-1">Error:</p>
                        <p>{log.errorMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-muted/50 border rounded-lg">
        <h3 className="font-semibold mb-2">About Mission Control</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This dashboard provides comprehensive provenance and auditability for all AI agent actions. Every tool call is
          logged with full Auth0 context, risk assessment, and approval status - critical for enterprise trust and
          compliance.
        </p>
        <div className="flex gap-4">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to Chat
          </Link>
          <Link href="/documents" className="text-sm text-primary hover:underline">
            View Documents →
          </Link>
        </div>
      </div>
    </div>
  );
}

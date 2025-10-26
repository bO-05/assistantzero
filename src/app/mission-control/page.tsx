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
        <h1 className="font-space-mono text-4xl font-bold mb-2 text-console">MISSION CONTROL</h1>
        <p className="font-ibm-plex-mono text-console/70">
          Comprehensive audit trail of all agent actions with Auth0 context and security posture
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-pale border-2 border-console p-6 hover:bg-mint transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-ibm-plex-mono text-xs text-console/70 tracking-wider">TOTAL ACTIONS</p>
              <p className="font-space-mono text-3xl font-bold text-console">{stats.total}</p>
            </div>
            <Activity className="h-8 w-8 text-console" />
          </div>
        </div>

        <div className="bg-pale border-2 border-console p-6 hover:bg-mint transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-ibm-plex-mono text-xs text-console/70 tracking-wider">SUCCESSFUL</p>
              <p className="font-space-mono text-3xl font-bold text-console">{stats.success}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-console" />
          </div>
        </div>

        <div className="bg-pale border-2 border-console p-6 hover:bg-mint transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-ibm-plex-mono text-xs text-console/70 tracking-wider">PENDING</p>
              <p className="font-space-mono text-3xl font-bold text-console">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-console" />
          </div>
        </div>

        <div className="bg-pale border-2 border-console p-6 hover:bg-mint transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-ibm-plex-mono text-xs text-console/70 tracking-wider">FAILED</p>
              <p className="font-space-mono text-3xl font-bold text-console">{stats.failure}</p>
            </div>
            <XCircle className="h-8 w-8 text-console" />
          </div>
        </div>
      </div>

      <div className="bg-pale border-2 border-console">
        <div className="p-6 border-b-2 border-console">
          <h2 className="font-space-mono text-2xl font-bold text-console">RECENT ACTIVITY TIMELINE</h2>
        </div>

        <div className="divide-y-2 divide-console">
          {logs.length === 0 ? (
            <div className="p-8 text-center font-ibm-plex-mono text-console/70">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-ibm-plex-mono">No activity yet. Start a conversation to see audit logs here.</p>
            </div>
          ) : (
            logs.slice(0, 50).map((log) => (
              <div key={log.id} className="p-6 hover:bg-mint transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {log.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {log.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                    {log.status === 'failure' && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-ibm-plex-mono font-bold text-console">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
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

                    <div className="font-ibm-plex-mono text-xs text-console/70 mb-2">
                      {new Date(log.createdAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })}
                      {log.durationMs && <span className="ml-2">• Duration: {log.durationMs}ms</span>}
                    </div>

                    {log.inputs && (
                      <details className="mt-2">
                        <summary className="font-ibm-plex-mono text-xs cursor-pointer text-console/70 hover:text-console">
                          View inputs
                        </summary>
                        <pre className="mt-2 font-ibm-plex-mono text-xs bg-pale border-2 border-console p-3 overflow-x-auto">
                          {JSON.stringify(log.inputs, null, 2)}
                        </pre>
                      </details>
                    )}

                    {log.outputs && (
                      <details className="mt-2">
                        <summary className="font-ibm-plex-mono text-xs cursor-pointer text-console/70 hover:text-console">
                          View outputs
                        </summary>
                        <pre className="mt-2 font-ibm-plex-mono text-xs bg-pale border-2 border-console p-3 overflow-x-auto">
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

      <div className="mt-8 p-6 bg-pale border-2 border-console">
        <h3 className="font-ibm-plex-mono font-bold mb-2 text-console">ABOUT MISSION CONTROL</h3>
        <p className="font-ibm-plex-mono text-xs text-console/70 mb-4">
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

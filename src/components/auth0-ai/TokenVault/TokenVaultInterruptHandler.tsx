import { useId } from 'react';
import { TokenVaultInterrupt } from '@auth0/ai/interrupts';
import type { Auth0InterruptionUI } from '@auth0/ai-vercel';

import { TokenVaultConsentRedirect } from '@/components/auth0-ai/TokenVault/redirect';

type PossibleInterrupt = Auth0InterruptionUI | Record<string, unknown>;

interface TokenVaultInterruptHandlerProps {
  interrupt: PossibleInterrupt | undefined | null;
  onFinish?: () => void;
}

export function TokenVaultInterruptHandler({ interrupt, onFinish }: TokenVaultInterruptHandlerProps) {
  const id = useId();
  
  // Debug logging
  console.log('TokenVaultInterruptHandler - interrupt:', interrupt);
  console.log('TokenVaultInterruptHandler - isInterrupt:', TokenVaultInterrupt.isInterrupt(interrupt));
  
  if (!interrupt || !TokenVaultInterrupt.isInterrupt(interrupt)) {
    return null;
  }

  console.log('Rendering TokenVaultConsent (redirect mode) for:', interrupt);

  return (
    <div key={id} className="border-2 border-accent-orange bg-pale p-6 mb-4 max-w-[768px] mx-auto">
      <div className="mb-4">
        <h3 className="font-ibm-plex-mono font-bold text-lg text-console mb-2">
          🔐 Google Authorization Required
        </h3>
        <p className="font-ibm-plex-mono text-sm text-console/80 mb-4">
          {interrupt.message || 'To access Gmail and Calendar features, you need to connect your Google account.'}
        </p>
        <div className="bg-mint border-2 border-console p-4 mb-4">
          <p className="font-ibm-plex-mono text-xs text-console/70 mb-2">
            <strong>⚠️ Important:</strong> You logged in with username/password, but Gmail/Calendar tools require Google OAuth.
          </p>
          <p className="font-ibm-plex-mono text-xs text-console/70">
            Clicking below will redirect you to Google to authorize access. After authorization, your Google account will be linked to your current account.
          </p>
        </div>
      </div>
      <TokenVaultConsentRedirect
        interrupt={interrupt}
        connectWidget={{
          title: '🔐 Google Authorization Required',
          description: 'Link your Google account to enable Gmail and Calendar features',
          action: { label: 'Connect Google Account' },
        }}
        onFinish={onFinish}
      />
    </div>
  );
}

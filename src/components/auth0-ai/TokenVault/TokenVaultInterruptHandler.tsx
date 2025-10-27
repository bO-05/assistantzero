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
    <div key={id} className="whitespace-pre-wrap border-2 border-accent-orange bg-pale p-6 mb-4">
      <TokenVaultConsentRedirect
        interrupt={interrupt}
        connectWidget={{
          title: '🔐 Google Authorization Required',
          description: interrupt.message || 'You need to connect your Google account to access Gmail/Calendar.',
          action: { label: 'Connect Google Account' },
        }}
        onFinish={onFinish}
      />
    </div>
  );
}

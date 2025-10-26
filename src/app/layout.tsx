import './globals.css';
import { Space_Mono, IBM_Plex_Mono } from 'next/font/google';
import Image from 'next/image';
import { Github } from 'lucide-react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Analytics } from '@vercel/analytics/next';

import { ActiveLink } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { auth0 } from '@/lib/auth0';
import UserButton from '@/components/auth0/user-button';

const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' });
const ibmPlexMono = IBM_Plex_Mono({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-ibm-plex-mono' });

const TITLE = 'Assistant0';
const DESCRIPTION = 'A smart AI assistant that helps you manage your digital life with enterprise-grade security powered by Auth0.';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{TITLE}</title>
        <link rel="shortcut icon" type="image/svg+xml" href="/images/favicon.png" />
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={`${ibmPlexMono.variable} ${spaceMono.variable} ${ibmPlexMono.className}`}>
        <NuqsAdapter>
          <div className="bg-mint grid grid-rows-[auto,1fr] h-[100dvh]">
            <div className="grid grid-cols-[1fr,auto] gap-2 p-4 bg-console/90 backdrop-blur-xl border-b-2 border-console sticky top-0 z-50">
              <div className="flex gap-4 flex-col md:flex-row md:items-center">
                <a
                  href="https://assistant0agent.vercel.app/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex items-center gap-2 px-4"
                >
                  <Image src="/images/auth0-logo.svg" alt="Auth0 AI Logo" className="h-8" width={143} height={32} />
                </a>
                <span className={`${spaceMono.className} text-white text-2xl`}>Assistant0</span>
                <nav className="flex gap-1 flex-col md:flex-row">
                  <ActiveLink href="/">Chat</ActiveLink>
                  <ActiveLink href="/documents">Documents</ActiveLink>
                  <ActiveLink href="/mission-control">Mission Control</ActiveLink>
                  <ActiveLink href="/workspaces">Workspaces</ActiveLink>
                </nav>
              </div>
              <div className="flex justify-center">
                {session && (
                  <div className="flex items-center gap-2 px-4 text-white">
                    <UserButton user={session?.user!} />
                  </div>
                )}
                <Button asChild variant="header" size="default">
                  <a href="https://github.com/bO-05/assistantzero" target="_blank">
                    <Github className="size-3" />
                    <span>Open in GitHub</span>
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative grid overflow-auto">
              <div className="absolute inset-0">{children}</div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="border-t-2 border-console bg-pale py-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="font-ibm-plex-mono text-xs text-console/70">
                © 2025 Assistant0. Built with Auth0 for AI Agents Challenge.
              </p>
              <div className="flex gap-4 font-ibm-plex-mono text-xs">
                <a href="/privacy" className="text-console hover:text-console/70 transition-colors">
                  Privacy Policy
                </a>
                <span className="text-console/30">|</span>
                <a href="/terms" className="text-console hover:text-console/70 transition-colors">
                  Terms of Service
                </a>
                <span className="text-console/30">|</span>
                <a href="https://github.com/bO-05/assistantzero" target="_blank" rel="noopener noreferrer" className="text-console hover:text-console/70 transition-colors">
                  GitHub
                </a>
              </div>
            </div>
          </footer>

          <Toaster richColors />
          <Analytics />
        </NuqsAdapter>
      </body>
    </html>
  );
}

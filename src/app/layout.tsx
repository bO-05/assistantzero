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

const TITLE = 'Auth0 Assistant0: An Auth0 + LangChain + Next.js Template';
const DESCRIPTION = 'Starter template showing how to use Auth0 in LangChain + Next.js projects.';

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
                  href="https://a0.to/ai-event"
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
                    <UserButton user={session?.user!} logoutUrl="/auth/logout" />
                  </div>
                )}
                <Button asChild variant="header" size="default">
                  <a href="https://github.com/bO-05/assistant0" target="_blank">
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
          <Toaster richColors />
          <Analytics />
        </NuqsAdapter>
      </body>
    </html>
  );
}

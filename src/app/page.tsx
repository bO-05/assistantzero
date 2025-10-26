import { LogIn, UserPlus, Terminal, Zap, Lock, Cpu } from 'lucide-react';
import { ChatWindow } from '@/components/chat-window';
import { GuideInfoBox } from '@/components/guide/GuideInfoBox';
import { auth0 } from '@/lib/auth0';

export default async function Home() {
  const session = await auth0.getSession();

  // If logged in, show the chat interface
  if (session) {
    const InfoCard = (
      <GuideInfoBox>
        <ul>
          <li className="text-l">
            🤝
            <span className="ml-2">
              This template showcases a simple chatbot using Vercel&apos;s{' '}
              <a className="text-blue-500" href="https://sdk.vercel.ai/docs" target="_blank">
                AI SDK
              </a>{' '}
              in a{' '}
              <a className="text-blue-500" href="https://nextjs.org/" target="_blank">
                Next.js
              </a>{' '}
              project.
            </span>
          </li>
          <li className="hidden text-l md:block">
            💻
            <span className="ml-2">
              You can find the prompt and model logic for this use-case in <code>app/api/chat/route.ts</code>.
            </span>
          </li>
          <li className="hidden text-l md:block">
            🎨
            <span className="ml-2">
              The main frontend logic is found in <code>app/page.tsx</code>.
            </span>
          </li>
          <li className="text-l">
            👇
            <span className="ml-2">
              Try asking e.g. <code>What can you help me with?</code> below!
            </span>
          </li>
        </ul>
      </GuideInfoBox>
    );

    return (
      <ChatWindow
        endpoint="api/chat"
        emoji="🤖"
        placeholder={`Hello ${session?.user?.name}, I'm your personal assistant. How can I help you today?`}
        emptyStateComponent={InfoCard}
      />
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-[#d4e8dc]">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-24">
            {/* Left Column - Hero Content */}
            <div>
              {/* Version Badge */}
              <div className="inline-block mb-6 border-2 border-[#0a0a0a] px-3 py-1 bg-[#e8f4ed]">
                <span className="font-space-mono text-xs font-bold tracking-wider text-[#0a0a0a]">
                  VERSION 1.0.0
                </span>
              </div>

              {/* Hero Title */}
              <h1 className="font-space-mono font-bold text-6xl lg:text-7xl leading-none tracking-tight text-[#0a0a0a] mb-8">
                AI ASSISTANT
                <br />
                <span className="relative inline-block">
                  SYSTEM
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#ff5722]"></div>
                </span>
              </h1>

              {/* Hero Description */}
              <p className="text-lg font-ibm-plex-mono text-[#0a0a0a]/80 leading-relaxed max-w-md mb-8">
                A smart AI assistant that helps you manage your digital life with enterprise-grade security powered by Auth0.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                <a
                  href="/api/auth/login"
                  className="terminal-border bg-[#0a0a0a] text-[#e8f4ed] px-8 py-3 font-ibm-plex-mono font-bold text-sm tracking-wider hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  LOGIN
                </a>

                <a
                  href="/api/auth/login?screen_hint=signup"
                  className="terminal-border bg-[#e8f4ed] text-[#0a0a0a] px-8 py-3 font-ibm-plex-mono font-bold text-sm tracking-wider hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  REGISTER
                </a>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#ff5722] animate-pulse"></div>
                <span className="font-ibm-plex-mono text-xs tracking-wider text-[#0a0a0a]/70">
                  SYSTEM OPERATIONAL
                </span>
              </div>
            </div>

            {/* Right Column - Decorative Panel (Desktop Only) */}
            <div className="relative hidden lg:block">
              <div className="border-2 border-[#0a0a0a] bg-[#e8f4ed] p-8 pixel-corners relative overflow-hidden">
                {/* Checkered pattern overlay */}
                <div className="checkered-pattern opacity-10 absolute inset-0"></div>

                {/* Content */}
                <div className="relative space-y-6">
                  {/* Status Items */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 font-ibm-plex-mono text-sm">
                      <div className="w-2 h-2 bg-[#ff5722]"></div>
                      <span className="text-[#0a0a0a]">CLASSIFICATION: OPEN SOURCE</span>
                    </div>
                    <div className="flex items-center gap-3 font-ibm-plex-mono text-sm">
                      <div className="w-2 h-2 bg-[#0a0a0a]"></div>
                      <span className="text-[#0a0a0a]">STATUS: FIELD TESTED</span>
                    </div>
                    <div className="flex items-center gap-3 font-ibm-plex-mono text-sm">
                      <div className="w-2 h-2 bg-[#0a0a0a]"></div>
                      <span className="text-[#0a0a0a]">ACCESS: AUTHENTICATION REQUIRED</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t-2 border-[#0a0a0a] pt-6"></div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-3xl font-ibm-plex-mono font-bold text-[#0a0a0a]">24/7</div>
                      <div className="text-xs font-ibm-plex-mono text-[#0a0a0a]/70 tracking-wider">AVAILABILITY</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-ibm-plex-mono font-bold text-[#0a0a0a]">&lt;1s</div>
                      <div className="text-xs font-ibm-plex-mono text-[#0a0a0a]/70 tracking-wider">RESPONSE TIME</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent corner decoration */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#ff5722]"></div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {/* Feature Card 1 */}
            <div className="border-2 border-[#0a0a0a] bg-[#e8f4ed] p-6 hover:bg-[#d4e8dc] transition-colors">
              <Zap className="w-8 h-8 mb-4 text-[#0a0a0a]" aria-hidden="true" />
              <h3 className="font-ibm-plex-mono font-bold text-lg mb-2 text-[#0a0a0a]">
                HIGH PERFORMANCE
              </h3>
              <p className="font-ibm-plex-mono text-xs text-[#0a0a0a]/70 leading-relaxed">
                Optimized response times and processing
              </p>
            </div>            

            {/* Feature Card 2 */}
            <div className="border-2 border-[#0a0a0a] bg-[#e8f4ed] p-6 hover:bg-[#d4e8dc] transition-colors">
              <Lock className="w-8 h-8 mb-4 text-[#0a0a0a]" aria-hidden="true" />
              <h3 className="font-ibm-plex-mono font-bold text-lg mb-2 text-[#0a0a0a]">
                SECURE
              </h3>
              <p className="font-ibm-plex-mono text-xs text-[#0a0a0a]/70 leading-relaxed">
                Enterprise-grade security and encryption
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="border-2 border-[#0a0a0a] bg-[#e8f4ed] p-6 hover:bg-[#d4e8dc] transition-colors">
              <Cpu className="w-8 h-8 mb-4 text-[#0a0a0a]" aria-hidden="true" />
              <h3 className="font-ibm-plex-mono font-bold text-lg mb-2 text-[#0a0a0a]">
                AI POWERED
              </h3>
              <p className="font-ibm-plex-mono text-xs text-[#0a0a0a]/70 leading-relaxed">
                Mistral language models and reasoning
              </p>
            </div>

          </div>

          {/* CTA Section */}
          <div className="border-2 border-[#0a0a0a] bg-[#0a0a0a] p-12 text-center relative overflow-hidden">
            <div className="halftone-gradient opacity-5 absolute inset-0"></div>
            <div className="relative">
              <h2 className="font-space-mono font-bold text-4xl mb-4 text-[#d4e8dc]">
                READY TO BEGIN?
              </h2>
              <p className="font-ibm-plex-mono text-[#d4e8dc]/80 mb-8 max-w-2xl mx-auto">
                Sign in to access your AI assistant and unlock the full potential of human-machine collaboration.
              </p>
              <a
                href="/api/auth/login"
                className="inline-flex bg-[#d4e8dc] text-[#0a0a0a] px-10 py-4 font-ibm-plex-mono font-bold text-sm tracking-wider hover:bg-[#e8f4ed] transition-colors border-2 border-[#d4e8dc] items-center gap-2"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                ACCESS SYSTEM
              </a>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="mt-12 text-center">
            <p className="font-ibm-plex-mono text-xs text-[#0a0a0a]/50 tracking-wider">
              DOCUMENT TYPE: SYSTEM SPECIFICATION / AUTH0 v1.0.0 / FIELD MANUAL
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

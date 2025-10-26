import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-mint py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 font-ibm-plex-mono text-console hover:text-console/70 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="border-2 border-console bg-pale p-8">
          <h1 className="font-space-mono text-4xl font-bold text-console mb-2">Terms of Service</h1>
          <p className="font-ibm-plex-mono text-sm text-console/70 mb-8">
            Last Updated: October 27, 2025
          </p>

          <div className="space-y-6 font-ibm-plex-mono text-console">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Agreement to Terms</h2>
              <p className="text-sm leading-relaxed">
                By accessing or using Assistant0 (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Description of Service</h2>
              <p className="text-sm leading-relaxed mb-2">
                Assistant0 is an AI-powered personal assistant that:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>Provides conversational AI interactions using Mistral AI</li>
                <li>Integrates with third-party services (Gmail, Google Calendar) via Auth0 Token Vault</li>
                <li>Enables document upload and semantic search with AI embeddings</li>
                <li>Maintains comprehensive audit logs of all AI agent actions</li>
                <li>Provides workspace isolation using Auth0 Fine-Grained Authorization</li>
                <li>Performs risk assessment on sensitive operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. User Accounts</h2>
              
              <h3 className="text-lg font-bold mt-4 mb-2">3.1 Account Creation</h3>
              <p className="text-sm leading-relaxed mb-2">
                To use the Service, you must create an account via Auth0. You agree to:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>

              <h3 className="text-lg font-bold mt-4 mb-2">3.2 Account Eligibility</h3>
              <p className="text-sm leading-relaxed">
                You must be at least 13 years old to use the Service. By using the Service, you represent that you meet this age requirement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Third-Party Integrations</h2>
              <p className="text-sm leading-relaxed mb-2">
                The Service integrates with third-party services via Auth0 Token Vault:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>You explicitly authorize each integration (Gmail, Google Calendar, etc.)</li>
                <li>You can revoke access to any integration at any time</li>
                <li>You are responsible for compliance with third-party service terms</li>
                <li>We are not responsible for third-party service availability or actions</li>
                <li>OAuth tokens are securely managed via Auth0 Token Vault</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Acceptable Use</h2>
              <p className="text-sm leading-relaxed mb-2">
                You agree NOT to use the Service to:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property or privacy rights</li>
                <li>Distribute malware, spam, or harmful content</li>
                <li>Attempt to gain unauthorized access to systems or accounts</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Use the Service for automated or bulk operations without permission</li>
                <li>Impersonate others or provide false information</li>
                <li>Harass, abuse, or harm others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. AI-Generated Content</h2>
              
              <h3 className="text-lg font-bold mt-4 mb-2">6.1 Nature of AI</h3>
              <p className="text-sm leading-relaxed">
                The Service uses AI models that may produce inaccurate, incomplete, or inappropriate responses. You acknowledge that AI-generated content should be reviewed and verified before use.
              </p>

              <h3 className="text-lg font-bold mt-4 mb-2">6.2 Your Responsibility</h3>
              <p className="text-sm leading-relaxed mb-2">
                You are solely responsible for:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>Reviewing AI-generated content before acting on it</li>
                <li>Verifying information provided by the AI assistant</li>
                <li>Decisions made based on AI recommendations</li>
                <li>Content you create using the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. User Content</h2>
              
              <h3 className="text-lg font-bold mt-4 mb-2">7.1 Your Rights</h3>
              <p className="text-sm leading-relaxed">
                You retain all rights to content you upload (documents, messages, etc.). By uploading content, you grant us a license to process, store, and display it as necessary to provide the Service.
              </p>

              <h3 className="text-lg font-bold mt-4 mb-2">7.2 Prohibited Content</h3>
              <p className="text-sm leading-relaxed mb-2">
                You may not upload content that:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>Contains malware, viruses, or harmful code</li>
                <li>Violates intellectual property rights</li>
                <li>Contains illegal or regulated materials</li>
                <li>Is defamatory, obscene, or hateful</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. Data and Privacy</h2>
              <p className="text-sm leading-relaxed">
                Your use of the Service is subject to our <Link href="/privacy" className="text-blue-600 hover:underline font-bold">Privacy Policy</Link>. We implement enterprise-grade security using Auth0 for authentication, authorization, and secure API access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">9. Service Availability</h2>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>We provide the Service on an &quot;as is&quot; and &quot;as available&quot; basis</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We may modify, suspend, or discontinue the Service at any time</li>
                <li>We may perform maintenance that temporarily interrupts service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">10. Intellectual Property</h2>
              <p className="text-sm leading-relaxed mb-2">
                The Service, including its design, code, and content (excluding user content), is owned by us and protected by intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>Copy, modify, or create derivative works</li>
                <li>Sell, rent, or sublicense the Service</li>
                <li>Remove or alter proprietary notices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">11. Disclaimer of Warranties</h2>
              <div className="bg-mint border-2 border-console p-4 text-sm">
                <p className="leading-relaxed uppercase">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, SECURE, OR UNINTERRUPTED.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">12. Limitation of Liability</h2>
              <div className="bg-mint border-2 border-console p-4 text-sm">
                <p className="leading-relaxed uppercase">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED $100 OR THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS, WHICHEVER IS GREATER.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">13. Indemnification</h2>
              <p className="text-sm leading-relaxed">
                You agree to indemnify and hold us harmless from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or violation of any rights of others.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">14. Termination</h2>
              <p className="text-sm leading-relaxed mb-2">
                We may terminate or suspend your account:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>For violation of these Terms</li>
                <li>For fraudulent or illegal activity</li>
                <li>At our discretion with or without notice</li>
              </ul>
              <p className="text-sm leading-relaxed mt-2">
                You may terminate your account at any time by contacting us. Upon termination, your right to use the Service ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">15. Governing Law</h2>
              <p className="text-sm leading-relaxed">
                These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles. You agree to submit to the exclusive jurisdiction of courts located in [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">16. Changes to Terms</h2>
              <p className="text-sm leading-relaxed">
                We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms with a new &quot;Last Updated&quot; date. Your continued use after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">17. Severability</h2>
              <p className="text-sm leading-relaxed">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">18. Entire Agreement</h2>
              <p className="text-sm leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">19. Contact</h2>
              <p className="text-sm leading-relaxed mb-2">
                Questions about these Terms? Contact us:
              </p>
              <div className="bg-mint border-2 border-console p-4 text-sm">
                <p><strong>Email:</strong> legal@assistant0agent.com</p>
                <p><strong>GitHub:</strong> <a href="https://github.com/bO-05/assistantzero" className="text-blue-600 hover:underline">github.com/bO-05/assistantzero</a></p>
              </div>
            </section>

            <section className="bg-mint border-2 border-console p-4 mt-8">
              <h3 className="text-lg font-bold mb-2">⚖️ Fair Use</h3>
              <p className="text-sm leading-relaxed">
                Assistant0 is a demonstration project built for the Auth0 AI Agents Challenge. While we implement enterprise-grade security with Auth0, this service is provided for educational and demonstration purposes. Use responsibly and at your own risk.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

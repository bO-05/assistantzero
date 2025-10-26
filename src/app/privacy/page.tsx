import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <h1 className="font-space-mono text-4xl font-bold text-console mb-2">Privacy Policy</h1>
          <p className="font-ibm-plex-mono text-sm text-console/70 mb-8">
            Last Updated: October 27, 2025
          </p>

          <div className="space-y-6 font-ibm-plex-mono text-console">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Introduction</h2>
              <p className="text-sm leading-relaxed">
                Assistant0 (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered personal assistant application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-bold mt-4 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li><strong>Account Information:</strong> Email address, name, and profile information via Auth0 authentication</li>
                <li><strong>Documents:</strong> Files you upload (PDFs, text documents) for AI-powered analysis</li>
                <li><strong>Conversations:</strong> Chat messages and interactions with the AI assistant</li>
                <li><strong>Workspace Data:</strong> Workspace names, descriptions, and organizational preferences</li>
              </ul>

              <h3 className="text-lg font-bold mt-4 mb-2">2.2 Information We Collect Automatically</h3>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li><strong>Usage Data:</strong> Actions performed, tools used, timestamps, and interaction patterns</li>
                <li><strong>Audit Logs:</strong> Comprehensive logs of AI agent actions for security and compliance</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and session data</li>
              </ul>

              <h3 className="text-lg font-bold mt-4 mb-2">2.3 Third-Party Services</h3>
              <p className="text-sm leading-relaxed">
                With your explicit consent, we may access:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4 mt-2">
                <li><strong>Gmail:</strong> Read and compose emails on your behalf</li>
                <li><strong>Google Calendar:</strong> Read calendar events and schedules</li>
                <li>These integrations use Auth0 Token Vault and require your explicit authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>To provide and maintain the AI assistant service</li>
                <li>To process your requests and enable tool integrations (Gmail, Calendar, etc.)</li>
                <li>To generate embeddings and enable semantic search of your documents</li>
                <li>To maintain audit logs for security, debugging, and compliance</li>
                <li>To enforce access controls and workspace isolation via Auth0 FGA</li>
                <li>To improve and optimize our AI models and services</li>
                <li>To detect, prevent, and address security issues or fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Data Processing and AI Services</h2>
              <p className="text-sm leading-relaxed mb-2">
                We use the following third-party AI and cloud services:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li><strong>Mistral AI:</strong> Processes conversations and generates document embeddings</li>
                <li><strong>Vercel:</strong> Hosts the application infrastructure</li>
                <li><strong>Neon:</strong> Stores your data in a secure PostgreSQL database</li>
                <li><strong>Auth0:</strong> Manages authentication and authorization</li>
                <li><strong>Exa AI:</strong> Powers semantic web search capabilities</li>
              </ul>
              <p className="text-sm leading-relaxed mt-2">
                These services process your data according to their respective privacy policies and our data processing agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Data Security</h2>
              <p className="text-sm leading-relaxed mb-2">
                We implement industry-standard security measures:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Authentication:</strong> Secure authentication via Auth0 with MFA support</li>
                <li><strong>Authorization:</strong> Fine-grained access control using Auth0 FGA</li>
                <li><strong>Token Management:</strong> OAuth tokens secured via Auth0 Token Vault</li>
                <li><strong>Audit Logging:</strong> Comprehensive logging of all actions for security monitoring</li>
                <li><strong>Workspace Isolation:</strong> Data segregation between workspaces via FGA policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Data Retention</h2>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>Your account data is retained while your account is active</li>
                <li>Documents and embeddings are retained until you delete them</li>
                <li>Audit logs are retained for security and compliance purposes</li>
                <li>Conversation history may be retained for service improvement</li>
                <li>You may request deletion of your data at any time (see Your Rights below)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. Your Rights</h2>
              <p className="text-sm leading-relaxed mb-2">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Export:</strong> Receive your data in a portable format</li>
                <li><strong>Revoke Consent:</strong> Disconnect third-party integrations at any time</li>
                <li><strong>Object:</strong> Object to certain data processing activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. Third-Party Links</h2>
              <p className="text-sm leading-relaxed">
                Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">9. Children&apos;s Privacy</h2>
              <p className="text-sm leading-relaxed">
                Our service is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">10. International Data Transfers</h2>
              <p className="text-sm leading-relaxed">
                Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">11. Changes to This Policy</h2>
              <p className="text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the &quot;Last Updated&quot; date. Your continued use of the service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">12. Contact Us</h2>
              <p className="text-sm leading-relaxed mb-2">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-mint border-2 border-console p-4 text-sm">
                <p><strong>Email:</strong> privacy@assistant0agent.com</p>
                <p><strong>GitHub:</strong> <a href="https://github.com/bO-05/assistantzero" className="text-blue-600 hover:underline">github.com/bO-05/assistantzero</a></p>
              </div>
            </section>

            <section className="bg-mint border-2 border-console p-4 mt-8">
              <h3 className="text-lg font-bold mb-2">🔐 Security First</h3>
              <p className="text-sm leading-relaxed">
                Assistant0 is built with enterprise-grade security using Auth0 for authentication, authorization, and secure API access. Your data is protected by industry-leading security practices and fine-grained access controls.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

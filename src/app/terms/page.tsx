import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Terms of Service</h1>

        <div className="prose prose-sm max-w-none">
          <p className="text-[var(--text-secondary)] mb-6">
            Last updated: January 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">1. Acceptance of Terms</h2>
            <p className="text-[var(--text-secondary)]">
              By accessing or using Talist ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">2. Description of Service</h2>
            <p className="text-[var(--text-secondary)]">
              Talist is an AI-powered candidate sourcing platform that helps recruiters and hiring teams find potential candidates by searching publicly available information across the web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">3. User Accounts</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">4. Acceptable Use</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Harass, spam, or contact candidates inappropriately</li>
              <li>Attempt to circumvent usage limits or access controls</li>
              <li>Resell or redistribute data obtained through the Service</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">5. Intellectual Property</h2>
            <p className="text-[var(--text-secondary)]">
              The Service and its original content, features, and functionality are owned by Talist and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">6. Limitation of Liability</h2>
            <p className="text-[var(--text-secondary)]">
              The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">7. Changes to Terms</h2>
            <p className="text-[var(--text-secondary)]">
              We reserve the right to modify these terms at any time. We will provide notice of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">8. Contact</h2>
            <p className="text-[var(--text-secondary)]">
              For questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@talist.ai" className="text-[var(--primary)] hover:underline">
                legal@talist.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

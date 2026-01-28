import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Privacy Policy</h1>

        <div className="prose prose-sm max-w-none">
          <p className="text-[var(--text-secondary)] mb-6">
            Last updated: January 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">1. Information We Collect</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              When you use Talist, we collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2">
              <li>Account information (email, name) when you sign up</li>
              <li>Search queries and preferences</li>
              <li>Saved candidate lists and notes</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">2. How We Use Your Information</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your searches and deliver relevant results</li>
              <li>Send you updates and notifications (with your consent)</li>
              <li>Protect against fraud and abuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">3. Data Sharing</h2>
            <p className="text-[var(--text-secondary)]">
              We do not sell your personal information. We may share data with service providers who assist in operating our platform, but only as necessary to provide our services. All third parties are bound by confidentiality agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">4. Data Security</h2>
            <p className="text-[var(--text-secondary)]">
              We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and regular security audits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">5. Your Rights</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">6. Contact Us</h2>
            <p className="text-[var(--text-secondary)]">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@talist.ai" className="text-[var(--primary)] hover:underline">
                privacy@talist.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

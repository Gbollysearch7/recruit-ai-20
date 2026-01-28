import Link from 'next/link';
import { ArrowLeft, Target, Users, Zap, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-light)] bg-[var(--bg-primary)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            About Talist
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            We're on a mission to make talent discovery effortless for recruiters and hiring teams worldwide.
          </p>
        </div>

        {/* Story */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Our Story</h2>
          <div className="prose max-w-none">
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              Talist was born from a simple frustration: traditional recruiting tools don't understand
              what you're actually looking for. Keyword searches miss great candidates, and Boolean
              strings require a PhD to master.
            </p>
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              We built Talist to change that. Using cutting-edge AI powered by Exa's Websets technology,
              we created a platform that understands the meaning behind your search—not just the words.
              Describe your ideal candidate in plain English, and let our AI do the heavy lifting.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Today, Talist helps thousands of recruiters find exceptional talent faster than ever before.
              We're just getting started.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: Zap,
                title: 'Speed Matters',
                description: 'Every hour you spend searching is an hour you could spend connecting. We obsess over making you faster.',
              },
              {
                icon: Target,
                title: 'Precision First',
                description: 'A hundred mediocre matches are worse than ten perfect ones. Quality over quantity, always.',
              },
              {
                icon: Users,
                title: 'Human-Centric AI',
                description: 'AI should amplify human judgment, not replace it. You make the decisions; we surface the possibilities.',
              },
              {
                icon: Globe,
                title: 'Open Web',
                description: 'Great talent is everywhere. We search beyond walled gardens to find candidates others miss.',
              },
            ].map((value, i) => (
              <div key={i} className="p-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)]">
                <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center text-[var(--primary)] mb-4">
                  <value.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{value.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Built by Gbolly</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Talist is an independent project built with passion for making recruiting better.
            We're a small team with big ambitions, dedicated to creating tools that actually help
            people find great talent.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Ready to find your next great hire?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Start searching for free. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="btn btn-primary">
              Get started free
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Contact us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

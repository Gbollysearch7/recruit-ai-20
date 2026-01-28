'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Cpu,
  Code,
  X
} from 'lucide-react';

// Custom SVG icons for a more distinctive, professional look
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M13 2L4.09 12.63a1 1 0 00.77 1.62H11v6.75a.5.5 0 00.9.3L20.91 10.37a1 1 0 00-.77-1.62H13V2.25a.5.5 0 00-.9-.3L13 2z" fill="currentColor" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <circle cx="10" cy="10" r="7" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    <path d="M10 7v6M7 10h6" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

const IconPrecision = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

const IconRealtime = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 12h2l2-4 2 8 2-4h2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconProfiles = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    <circle cx="17" cy="11" r="3" />
    <path d="M21 21v-1.5a3 3 0 00-3-3h-1" />
  </svg>
);

const IconVerified = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M12 2l2.4 2.4h3.4v3.4L20 10v4l-2.2 2.2v3.4h-3.4L12 22l-2.4-2.4H6.2v-3.4L4 14v-4l2.2-2.2V4.4h3.4L12 2z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z" />
  </svg>
);

const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function LandingPage() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-auto selection:bg-[var(--primary)] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-light)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white p-1.5">
              <IconTarget />
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">talist.ai</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How it works</a>
            <a href="#pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn btn-primary"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-emerald-400 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full text-xs font-medium text-[var(--primary)] mb-8 animate-fade-in-up">
              <span className="w-3.5 h-3.5"><IconZap /></span>
              <span>Powered by Exa AI Websets</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Find the perfect candidates,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-emerald-500">effortlessly</span>
            </h1>

            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Stop relying on keywords. Describe your ideal candidate in plain English, and our AI will scour the entire web to find and verify the best matches.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <Link
                href="/search"
                className="btn btn-primary h-12 px-8 text-base shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/30 hover:-translate-y-0.5 transition-all"
              >
                Start Searching Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center gap-2 px-8 py-3 bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium rounded-lg border border-[var(--border-light)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)] transition-all"
              >
                <span className="w-4 h-4"><IconPlay /></span>
                Watch Demo
              </button>
            </div>

            <p className="text-xs text-[var(--text-tertiary)] mt-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              No credit card required • 10 free searches per month
            </p>
          </div>

          {/* Product Preview */}
          <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)]/20 to-emerald-500/20 blur opacity-20 rounded-xl" />
            <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] shadow-2xl overflow-hidden relative">
              {/* Header */}
              <div className="border-b border-[var(--border-light)] px-4 py-3 flex items-center gap-2 bg-[var(--bg-surface)]/50 backdrop-blur-sm">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="mx-auto w-1/3 h-6 bg-[var(--bg-primary)]/50 rounded flex items-center justify-center text-[10px] text-[var(--text-tertiary)] font-mono">
                  talist.ai/search
                </div>
              </div>

              {/* Interface Mock */}
              <div className="p-8 grid gap-8">
                {/* Search Bar */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-1 rounded-lg flex items-center gap-2 shadow-sm max-w-2xl mx-auto w-full">
                  <div className="flex-1 px-3 py-2 text-sm text-[var(--text-tertiary)] italic">
                    Find full-stack engineers in SF with AI startup experience...
                  </div>
                  <button className="px-6 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-md shadow-sm">
                    Search
                  </button>
                </div>

                {/* Results */}
                <div className="border border-[var(--border-light)] rounded-lg overflow-hidden bg-[var(--bg-primary)]/50">
                  <div className="grid grid-cols-[2fr,1.5fr,1.5fr,1fr] gap-4 px-6 py-3 border-b border-[var(--border-light)] bg-[var(--bg-surface)] text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                    <div>Candidate</div>
                    <div>Role</div>
                    <div>Company</div>
                    <div>Location</div>
                  </div>
                  {[
                    { name: 'Sarah Chen', role: 'Senior Full-Stack Engineer', company: 'OpenAI', location: 'San Francisco' },
                    { name: 'Marcus Johnson', role: 'Staff Engineer', company: 'Anthropic', location: 'San Francisco' },
                    { name: 'Emily Rodriguez', role: 'Engineering Lead', company: 'Scale AI', location: 'Bay Area' },
                  ].map((c, i) => (
                    <div key={i} className="grid grid-cols-[2fr,1.5fr,1.5fr,1fr] gap-4 px-6 py-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-surface)] transition-colors items-center last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{c.name}</span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">{c.role}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{c.company}</div>
                      <div className="text-sm text-[var(--text-tertiary)]">{c.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-[var(--border-light)] bg-[var(--bg-surface)]/30">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-8">Trusted by forward-thinking teams</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Stripe', 'Linear', 'Vercel', 'Notion', 'Figma', 'Supabase'].map((brand) => (
              <span key={brand} className="text-xl font-bold text-[var(--text-secondary)]">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-4">
              Everything you need to find top talent
            </h2>
            <p className="text-[var(--text-secondary)]">
              Replace your outdated sourcing tools with AI that actually understands what you're looking for.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { Icon: IconSearch, title: 'Semantic Search', desc: 'Search by meaning, not just keywords. "Senior implementation engineer" matches "Deployment Specialist".' },
              { Icon: IconPrecision, title: 'Precision Filtering', desc: 'Filter by years of experience, specific companies, tech stack, location, and more with pinpoint accuracy.' },
              { Icon: IconRealtime, title: 'Real-time Websets', desc: 'Our AI crawls the live web. Find candidates who updated their portfolio yesterday, not just LinkedIn users.' },
              { Icon: IconProfiles, title: 'Rich Profiles', desc: 'Automatically aggregate data from GitHub, LinkedIn, personal sites, and portfolios into one view.' },
              { Icon: IconVerified, title: 'Verified Data', desc: 'Every fact is cross-referenced to ensure you only see accurate, up-to-date candidate information.' },
              { Icon: IconGlobe, title: 'Global Sourcing', desc: 'Reach beyond your network. Find hidden talent in developer communities, forums, and niche platforms.' },
            ].map((f, i) => (
              <div key={i} className="group p-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] hover:border-[var(--primary)]/50 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center text-[var(--primary)] mb-4 group-hover:scale-110 transition-transform p-2.5">
                  <f.Icon />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[var(--bg-elevated)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--primary)]/5 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-6">
                From search to outreach in minutes
              </h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Describe your need', desc: 'Tell our AI exactly who you need, using natural language. No complex boolean strings required.' },
                  { step: '02', title: 'Review Matches', desc: 'Get a curated list of candidates verified against your criteria. See why they match.' },
                  { step: '03', title: 'Connect directly', desc: 'Get personal emails, social profiles, and portfolios. Reach out with context.' },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full border border-[var(--primary)] text-[var(--primary)] flex items-center justify-center font-bold font-mono">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{s.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-emerald-600 rounded-2xl blur-2xl opacity-20" />
              <div className="bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl p-6 shadow-2xl relative">
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-surface)] transition-colors border border-transparent hover:border-[var(--border-light)]">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-24 bg-[var(--bg-surface)] rounded animate-pulse" />
                        <div className="h-2 w-32 bg-[var(--bg-surface)] rounded animate-pulse" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-[var(--text-secondary)]">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] hover:border-[var(--border-default)] transition-colors">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Free</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Perfect for trying out Talist</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-[var(--text-primary)]">$0</span>
                <span className="text-[var(--text-tertiary)]">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['10 searches per month', 'Basic candidate profiles', 'Email support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Check className="w-4 h-4 text-[var(--primary)]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/search" className="btn btn-secondary w-full justify-center">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-6 bg-[var(--bg-elevated)] rounded-xl border-2 border-[var(--primary)] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Pro</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">For growing teams</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-[var(--text-primary)]">$49</span>
                <span className="text-[var(--text-tertiary)]">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['100 searches per month', 'Rich candidate profiles', 'Export to CSV/ATS', 'Priority support', 'Team collaboration'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Check className="w-4 h-4 text-[var(--primary)]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/search" className="btn btn-primary w-full justify-center">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] hover:border-[var(--border-default)] transition-colors">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Enterprise</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">For large organizations</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-[var(--text-primary)]">Custom</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['Unlimited searches', 'API access', 'Custom integrations', 'Dedicated support', 'SSO & security'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Check className="w-4 h-4 text-[var(--primary)]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="btn btn-secondary w-full justify-center">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/20 to-emerald-500/20 blur-3xl opacity-30 rounded-full" />

          <div className="relative z-10 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-2xl p-12 shadow-2xl hover:border-[var(--primary)]/30 transition-colors">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-6">
              Ready to find your next hire?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Join thousands of recruiters who are hiring faster and smarter with Talist.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/search"
                className="btn btn-primary h-12 px-8 text-base w-full sm:w-auto"
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-secondary h-12 px-8 text-base w-full sm:w-auto"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--border-light)] bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--primary)] rounded flex items-center justify-center text-white p-1">
              <IconTarget />
            </div>
            <span className="font-bold text-[var(--text-primary)]">talist.ai</span>
          </div>
          <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
            Built by <span className="text-[var(--text-primary)] font-medium">Gbolly</span> with <Cpu className="w-3 h-3 inline mx-0.5" /> and <Code className="w-3 h-3 inline mx-0.5" />
          </div>
          <div className="flex gap-6 text-sm text-[var(--text-secondary)]">
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
            <a href="https://twitter.com/talistai" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
              <span className="w-3.5 h-3.5"><IconTwitter /></span>
              Twitter
            </a>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDemoModal(false)}
          />
          <div className="relative bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Product Demo</h3>
              <button
                onClick={() => setShowDemoModal(false)}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-[var(--bg-primary)] flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)] mx-auto mb-4">
                  <span className="w-8 h-8"><IconPlay /></span>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">Demo video coming soon</p>
                <Link
                  href="/search"
                  className="btn btn-primary"
                  onClick={() => setShowDemoModal(false)}
                >
                  Try it yourself
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

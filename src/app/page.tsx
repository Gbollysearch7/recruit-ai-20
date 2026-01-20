import Link from 'next/link';
import {
  Search,
  Users,
  Zap,
  Target,
  BarChart3,
  Shield,
  ArrowRight,
  Check,
  Star,
  Play,
  Sparkles,
  Globe,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--border-light)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shadow-sm">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold text-[var(--text-primary)] tracking-tight">Recruit.ai</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-all shadow-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-light)] border border-[var(--accent)]/10 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-xs font-medium text-[var(--accent)]">Powered by Exa AI</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-6">
              Find the perfect candidates,{' '}
              <span className="text-[var(--accent)]">effortlessly</span>
            </h1>

            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl mx-auto">
              Describe your ideal candidate in plain English. Our AI searches the entire web
              to find people who match your exact criteria—skills, experience, location, and more.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--accent)] text-white font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-all hover:-translate-y-0.5 shadow-lg shadow-[var(--accent)]/25"
              >
                Start Searching
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--bg-primary)] text-[var(--text-secondary)] font-medium rounded-xl border border-[var(--border-default)] hover:border-[var(--border-focus)] hover:text-[var(--text-primary)] transition-all">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Product Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent z-10 pointer-events-none h-full" />
            <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] shadow-[var(--shadow-xl)] overflow-hidden">
              <div className="border-b border-[var(--border-light)] px-4 py-3 flex items-center gap-2 bg-[var(--bg-secondary)]">
                <div className="w-3 h-3 rounded-full bg-[var(--error)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                <div className="ml-4 flex-1 max-w-md">
                  <div className="h-5 bg-[var(--bg-tertiary)] rounded text-xs flex items-center px-3 text-[var(--text-muted)]">
                    recruit.ai/search
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-tertiary)]">
                    Full-stack engineers in SF with AI startup experience...
                  </div>
                  <div className="px-5 py-3.5 bg-[var(--accent)] text-white text-sm font-medium rounded-xl flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search
                  </div>
                </div>

                {/* Mock Table */}
                <div className="border border-[var(--border-light)] rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
                      <tr>
                        <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider px-5 py-3">Name</th>
                        <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider px-5 py-3">Position</th>
                        <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider px-5 py-3 hidden md:table-cell">Company</th>
                        <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {[
                        { name: 'Sarah Chen', position: 'Senior Full-Stack Engineer', company: 'OpenAI', location: 'San Francisco, CA' },
                        { name: 'Marcus Johnson', position: 'Staff Engineer', company: 'Anthropic', location: 'San Francisco, CA' },
                        { name: 'Emily Rodriguez', position: 'Engineering Lead', company: 'Scale AI', location: 'San Francisco, CA' },
                      ].map((candidate, i) => (
                        <tr key={i} className="hover:bg-[var(--bg-secondary)] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-white text-xs font-medium shadow-sm">
                                {candidate.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-sm font-medium text-[var(--text-primary)]">{candidate.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">{candidate.position}</td>
                          <td className="px-5 py-4 text-sm text-[var(--text-secondary)] hidden md:table-cell">{candidate.company}</td>
                          <td className="px-5 py-4 text-sm text-[var(--text-tertiary)] hidden lg:table-cell">{candidate.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-16 border-y border-[var(--border-light)] bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-[var(--text-muted)] mb-10">Trusted by recruiting teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8 opacity-40">
            {['Stripe', 'Notion', 'Linear', 'Vercel', 'Supabase'].map((company) => (
              <span key={company} className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight mb-4">
              Recruiting, reimagined
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Stop sifting through LinkedIn. Let AI find candidates who actually match what you're looking for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Search,
                title: 'Natural Language Search',
                description: 'Describe candidates like you would to a colleague. Our AI understands context, not just keywords.'
              },
              {
                icon: Target,
                title: 'Precision Matching',
                description: 'Every result is verified against your criteria. No more irrelevant profiles cluttering your pipeline.'
              },
              {
                icon: Zap,
                title: 'Real-time Results',
                description: 'Watch candidates appear as our AI scans the web. Results in minutes, not days.'
              },
              {
                icon: Layers,
                title: 'Rich Candidate Data',
                description: 'Get comprehensive profiles with work history, skills, social links, and more—automatically enriched.'
              },
              {
                icon: Shield,
                title: 'Privacy First',
                description: 'We only surface publicly available information. Compliant with data protection regulations.'
              },
              {
                icon: Globe,
                title: 'Global Reach',
                description: 'Search across the entire web, not just one platform. Find hidden talent everywhere.'
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-lg)] transition-all"
              >
                <div className="w-11 h-11 bg-[var(--accent-light)] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--accent)] transition-colors">
                  <feature.icon className="w-5 h-5 text-[var(--accent)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight mb-4">
              Three steps to your perfect hire
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              From search to hire in record time. Here's how it works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Describe your ideal candidate',
                description: 'Use natural language to specify skills, experience, location, and any other criteria that matter to you.'
              },
              {
                step: '02',
                title: 'AI searches the web',
                description: 'Our AI agent crawls the entire web, finding and verifying candidates that match your exact requirements.'
              },
              {
                step: '03',
                title: 'Review and connect',
                description: 'Browse enriched profiles, export to your ATS, or reach out directly. Your perfect candidate is waiting.'
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-[var(--border-light)] mb-4 tracking-tighter">{item.step}</div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">{item.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 right-0 translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-[var(--border-default)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight mb-4">
              Loved by hiring teams
            </h2>
            <p className="text-[var(--text-secondary)]">See what recruiters are saying about Recruit.ai</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "We cut our time-to-hire by 60%. The AI finds candidates we never would have discovered on LinkedIn.",
                author: 'Jessica Park',
                role: 'Head of Talent, TechCorp',
                rating: 5
              },
              {
                quote: "The natural language search is a game-changer. I just describe what I need and get perfect matches.",
                author: 'David Martinez',
                role: 'Recruiting Lead, StartupXYZ',
                rating: 5
              },
              {
                quote: "Finally, a recruiting tool that actually understands what we're looking for. Highly recommend.",
                author: 'Amanda Chen',
                role: 'VP People, ScaleUp Inc',
                rating: 5
              },
            ].map((testimonial, i) => (
              <div key={i} className="p-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)]">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[var(--warning)] text-[var(--warning)]" />
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{testimonial.author}</div>
                  <div className="text-sm text-[var(--text-tertiary)]">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-[var(--text-secondary)]">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$0',
                period: 'forever',
                description: 'Perfect for trying out Recruit.ai',
                features: ['10 searches per month', 'Basic candidate data', 'Email support'],
                cta: 'Get Started',
                featured: false
              },
              {
                name: 'Pro',
                price: '$99',
                period: 'per month',
                description: 'For growing teams hiring regularly',
                features: ['Unlimited searches', 'Enriched candidate profiles', 'Team collaboration', 'ATS integrations', 'Priority support'],
                cta: 'Start Free Trial',
                featured: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'contact us',
                description: 'For large organizations',
                features: ['Everything in Pro', 'Custom integrations', 'Dedicated account manager', 'SLA guarantees', 'SSO & advanced security'],
                cta: 'Contact Sales',
                featured: false
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl border ${
                  plan.featured
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white scale-[1.02] shadow-xl shadow-[var(--accent)]/20'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-light)]'
                }`}
              >
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-2 ${plan.featured ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.featured ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.featured ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${plan.featured ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.featured ? 'text-white/80' : 'text-[var(--accent)]'}`} />
                      <span className={plan.featured ? 'text-white' : 'text-[var(--text-secondary)]'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/search"
                  className={`block w-full py-2.5 text-center text-sm font-semibold rounded-lg transition-colors ${
                    plan.featured
                      ? 'bg-white text-[var(--accent)] hover:bg-white/90'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-default)]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[var(--accent)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            Ready to transform your recruiting?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of teams using Recruit.ai to find exceptional talent faster than ever.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[var(--accent)] font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            Get Started for Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-[var(--text-primary)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Recruit.ai</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI-powered recruiting for modern teams. Find exceptional talent faster than ever.
              </p>
            </div>

            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Integrations', 'API']
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact']
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Security']
              },
            ].map((column, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white mb-4">{column.title}</h4>
                <ul className="space-y-2.5">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; 2026 Recruit.ai. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Built with Next.js and Exa Websets API
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

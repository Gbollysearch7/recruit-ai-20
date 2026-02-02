'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-auto">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-light)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-[var(--primary)] text-xl">filter_center_focus</span>
            <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">Recruit AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How it works</a>
            <a href="#use-cases" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Use Cases</a>
            <a href="#pricing" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && (
              isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
                >
                  Sign in
                </Link>
              )
            )}
            <Link
              href="/search"
              className="btn btn-primary"
            >
              {isAuthenticated ? 'New Search' : 'Get Started'}
              <span className="material-icons-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--primary-light)] border border-[var(--primary)]/10 rounded text-[10px] font-medium text-[var(--primary)] mb-5">
              <span className="material-icons-outlined text-xs">auto_awesome</span>
              Powered by Exa AI Websets
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight mb-4">
              Find the perfect candidates,{' '}
              <span className="text-[var(--primary)]">effortlessly</span>
            </h1>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xl mx-auto">
              Describe your ideal candidate in plain English. Our AI searches the entire web
              to find people who match your exact criteria—skills, experience, location, and more.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D4B3E] text-xs font-medium rounded-md hover:bg-[#1f352c] transition-colors"
                style={{ color: '#ffffff' }}
              >
                Start Searching Free
                <span className="material-icons-outlined text-sm">arrow_forward</span>
              </Link>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs font-medium rounded border border-[var(--border-light)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)] transition-colors">
                <span className="material-icons-outlined text-sm">play_circle</span>
                Watch Demo
              </button>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] mt-4">
              No credit card required • 10 free searches per month
            </p>
          </div>

          {/* Product Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent z-10 pointer-events-none h-full" />
            <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] shadow-[var(--shadow-md)] overflow-hidden">
              <div className="border-b border-[var(--border-light)] px-3 py-2 flex items-center gap-1.5 bg-[var(--bg-surface)]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <div className="ml-3 flex-1 max-w-md">
                  <div className="h-5 bg-[var(--bg-primary)] rounded text-[10px] flex items-center px-2.5 text-[var(--text-muted)]">
                    recruit-ai.com/search
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded px-3 py-2 text-xs text-[var(--text-tertiary)]">
                    Full-stack engineers in SF with AI startup experience...
                  </div>
                  <button className="px-4 py-2 bg-[var(--primary)] text-white text-xs font-medium rounded flex items-center gap-1.5">
                    <span className="material-icons-outlined text-sm">search</span>
                    Search
                  </button>
                </div>

                {/* Mock Table */}
                <div className="border border-[var(--border-light)] rounded overflow-hidden">
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th className="hidden md:table-cell">Company</th>
                        <th className="hidden lg:table-cell">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Sarah Chen', position: 'Senior Full-Stack Engineer', company: 'OpenAI', location: 'San Francisco, CA' },
                        { name: 'Marcus Johnson', position: 'Staff Engineer', company: 'Anthropic', location: 'San Francisco, CA' },
                        { name: 'Emily Rodriguez', position: 'Engineering Lead', company: 'Scale AI', location: 'San Francisco, CA' },
                      ].map((candidate, i) => (
                        <tr key={i}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="avatar">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`} alt="" />
                              </div>
                              <span className="font-medium">{candidate.name}</span>
                            </div>
                          </td>
                          <td className="text-[var(--text-secondary)]">{candidate.position}</td>
                          <td className="text-[var(--text-secondary)] hidden md:table-cell">{candidate.company}</td>
                          <td className="text-[var(--text-tertiary)] hidden lg:table-cell">{candidate.location}</td>
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

      {/* Stats Section */}
      <section className="py-12 border-y border-[var(--border-light)] bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Candidates found', icon: 'group' },
              { value: '60%', label: 'Faster time-to-hire', icon: 'speed' },
              { value: '95%', label: 'Match accuracy', icon: 'verified' },
              { value: '500+', label: 'Happy recruiters', icon: 'thumb_up' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary-light)] mb-3">
                  <span className="material-icons-outlined text-lg text-[var(--primary)]">{stat.icon}</span>
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{stat.value}</div>
                <div className="text-xs text-[var(--text-tertiary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-8">Trusted by recruiting teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
            {['Stripe', 'Notion', 'Linear', 'Vercel', 'Supabase', 'Figma'].map((company) => (
              <span key={company} className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
              Recruiting, reimagined
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              Stop sifting through LinkedIn. Let AI find candidates who actually match what you're looking for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: 'search', title: 'Natural Language Search', description: 'Describe candidates like you would to a colleague. Our AI understands context, not just keywords.' },
              { icon: 'track_changes', title: 'Precision Matching', description: 'Every result is verified against your criteria. No more irrelevant profiles cluttering your pipeline.' },
              { icon: 'bolt', title: 'Real-time Results', description: 'Watch candidates appear as our AI scans the web. Results in minutes, not days.' },
              { icon: 'layers', title: 'Rich Candidate Data', description: 'Get comprehensive profiles with work history, skills, social links, and more—automatically enriched.' },
              { icon: 'shield', title: 'Privacy First', description: 'We only surface publicly available information. Compliant with data protection regulations.' },
              { icon: 'public', title: 'Global Reach', description: 'Search across the entire web, not just one platform. Find hidden talent everywhere.' },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-5 bg-[var(--bg-elevated)] rounded border border-[var(--border-light)] hover:border-[var(--primary)]/30 transition-colors"
              >
                <div className="w-9 h-9 bg-[var(--primary-light)] rounded flex items-center justify-center mb-3 group-hover:bg-[var(--primary)] transition-colors">
                  <span className="material-icons-outlined text-lg text-[var(--primary)] group-hover:text-white transition-colors">{feature.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">{feature.title}</h3>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
              Three steps to your perfect hire
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              From search to hire in record time. Here's how it works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Describe your ideal candidate', description: 'Use natural language to specify skills, experience, location, and any other criteria that matter to you.' },
              { step: '02', title: 'AI searches the web', description: 'Our AI agent crawls the entire web, finding and verifying candidates that match your exact requirements.' },
              { step: '03', title: 'Review and connect', description: 'Browse enriched profiles, export to your ATS, or reach out directly. Your perfect candidate is waiting.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-bold text-[var(--border-light)] mb-3 tracking-tighter">{item.step}</div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2">
                    <span className="material-icons-outlined text-xl text-[var(--border-default)]">arrow_forward</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
              Built for every hiring need
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              Whether you're hiring one engineer or scaling a whole team, Recruit AI adapts to your workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Technical Recruiting',
                description: 'Find engineers, data scientists, and developers with specific tech stacks. Search by programming languages, frameworks, or open source contributions.',
                example: '"Senior React developers with TypeScript experience who have contributed to open source projects"',
                icon: 'code'
              },
              {
                title: 'Executive Search',
                description: 'Identify leadership talent with the right combination of industry experience, company stage, and track record.',
                example: '"VP of Engineering with experience scaling teams from 20 to 100+ at B2B SaaS companies"',
                icon: 'business_center'
              },
              {
                title: 'Diversity Hiring',
                description: 'Build diverse pipelines by searching across underrepresented networks, ERGs, and professional communities.',
                example: '"Women in Tech community leaders with product management experience in fintech"',
                icon: 'diversity_3'
              },
              {
                title: 'Niche Roles',
                description: 'Find specialized talent that traditional job boards miss—from AI researchers to blockchain developers.',
                example: '"Machine learning engineers with experience in reinforcement learning and robotics"',
                icon: 'psychology'
              },
            ].map((useCase, i) => (
              <div key={i} className="p-6 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[var(--primary-light)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-outlined text-xl text-[var(--primary)]">{useCase.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{useCase.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">{useCase.description}</p>
                    <div className="bg-[var(--bg-surface)] rounded px-3 py-2 border-l-2 border-[var(--primary)]">
                      <p className="text-[10px] text-[var(--text-tertiary)] italic">{useCase.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-6 bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
              Works with your stack
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              Export candidates directly to your ATS or CRM. Seamless integrations with the tools you already use.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
            {[
              { name: 'Greenhouse', icon: '🌿' },
              { name: 'Lever', icon: '⚡' },
              { name: 'Ashby', icon: '🎯' },
              { name: 'Workday', icon: '📊' },
              { name: 'BambooHR', icon: '🎋' },
              { name: 'Zapier', icon: '⚡' },
              { name: 'Slack', icon: '💬' },
              { name: 'Google Sheets', icon: '📗' },
            ].map((integration, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)]">
                <span className="text-lg">{integration.icon}</span>
                <span className="text-xs font-medium text-[var(--text-primary)]">{integration.name}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--text-tertiary)] mt-8">
            Don't see your ATS? <a href="#" className="text-[var(--primary)] hover:underline">Request an integration</a>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
              Loved by hiring teams
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">See what recruiters are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { quote: "We cut our time-to-hire by 60%. The AI finds candidates we never would have discovered on LinkedIn.", author: 'Jessica Park', role: 'Head of Talent, TechCorp', avatar: 'JP' },
              { quote: "The natural language search is a game-changer. I just describe what I need and get perfect matches.", author: 'David Martinez', role: 'Recruiting Lead, StartupXYZ', avatar: 'DM' },
              { quote: "Finally, a recruiting tool that actually understands what we're looking for. Highly recommend.", author: 'Amanda Chen', role: 'VP People, ScaleUp Inc', avatar: 'AC' },
            ].map((testimonial, i) => (
              <div key={i} className="p-5 bg-[var(--bg-elevated)] rounded border border-[var(--border-light)]">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="material-icons text-sm text-amber-400">star</span>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[10px] font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{testimonial.author}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-[var(--bg-surface)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
              Frequently asked questions
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">Common questions about our platform</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the platform find candidates?',
                a: 'We use Exa AI\'s Websets technology to search the entire public web—including professional profiles, company pages, GitHub, personal websites, and more. Our AI understands natural language queries and verifies each candidate against your specific criteria.'
              },
              {
                q: 'Is the data GDPR compliant?',
                a: 'Yes. We only surface publicly available information that candidates have chosen to share online. We don\'t scrape private data or use any information that isn\'t already public. Our platform is fully compliant with GDPR and other data protection regulations.'
              },
              {
                q: 'How accurate is the matching?',
                a: 'Our AI achieves 95%+ accuracy on criteria matching. Each candidate is verified against your requirements before being added to your results. You can also set up custom criteria to ensure precision matching for your specific needs.'
              },
              {
                q: 'Can I export candidates to my ATS?',
                a: 'Absolutely. We integrate with major ATS platforms including Greenhouse, Lever, Ashby, and Workday. You can also export to CSV or connect via our API for custom integrations.'
              },
              {
                q: 'What makes this different from LinkedIn Recruiter?',
                a: 'Unlike LinkedIn, we search the entire web—not just one platform. This means we find candidates who may not be active on LinkedIn but have strong online presence elsewhere. Our natural language search is also more intuitive than boolean filters.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Our Starter plan includes 10 free searches per month forever. No credit card required. Upgrade to Pro for unlimited searches and additional features when you\'re ready.'
              },
            ].map((faq, i) => (
              <div key={i} className="p-4 bg-[var(--bg-elevated)] rounded border border-[var(--border-light)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{faq.q}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Starter', price: '$0', period: 'forever', description: 'Perfect for getting started', features: ['10 searches per month', 'Basic candidate data', 'CSV export', 'Email support'], cta: 'Get Started', featured: false },
              { name: 'Pro', price: '$99', period: 'per month', description: 'For growing teams hiring regularly', features: ['Unlimited searches', 'Enriched profiles', 'Team collaboration', 'ATS integrations', 'Custom criteria', 'Priority support'], cta: 'Start Free Trial', featured: true },
              { name: 'Enterprise', price: 'Custom', period: 'contact us', description: 'For large organizations', features: ['Everything in Pro', 'Custom integrations', 'Dedicated manager', 'SLA guarantees', 'SSO & security', 'Volume discounts'], cta: 'Contact Sales', featured: false },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-5 rounded border ${
                  plan.featured
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-light)]'
                }`}
              >
                {plan.featured && (
                  <div className="text-[9px] uppercase tracking-wider font-semibold text-white/80 mb-2">Most Popular</div>
                )}
                <div className="mb-5">
                  <h3 className={`text-sm font-semibold mb-1.5 ${plan.featured ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${plan.featured ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-[10px] ${plan.featured ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1.5 ${plan.featured ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-[11px]">
                      <span className={`material-icons-outlined text-sm ${plan.featured ? 'text-white/80' : 'text-[var(--primary)]'}`}>check</span>
                      <span className={plan.featured ? 'text-white' : 'text-[var(--text-secondary)]'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/search"
                  className={`block w-full py-2 text-center text-xs font-medium rounded transition-colors ${
                    plan.featured
                      ? 'bg-white text-[var(--primary)] hover:bg-white/90'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-light)]'
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
      <section className="py-16 px-6 bg-[var(--primary)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-3">
            Ready to transform your recruiting?
          </h2>
          <p className="text-white/80 text-sm mb-6 max-w-xl mx-auto">
            Join hundreds of teams using Recruit AI to find exceptional talent faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[var(--primary)] text-xs font-medium rounded hover:bg-white/90 transition-colors"
            >
              Get Started for Free
              <span className="material-icons-outlined text-sm">arrow_forward</span>
            </Link>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white/90 text-xs font-medium hover:text-white transition-colors"
            >
              <span className="material-icons-outlined text-sm">calendar_today</span>
              Book a Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[var(--text-primary)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-icons-outlined text-[var(--primary)] text-lg">filter_center_focus</span>
                <span className="text-sm font-semibold text-white">Recruit AI</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                AI-powered recruiting for modern teams. Find exceptional talent faster than ever using natural language search powered by Exa AI.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="material-icons-outlined text-lg">language</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="material-icons text-lg">code</span>
                </a>
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
            ].map((column, i) => (
              <div key={i}>
                <h4 className="text-xs font-semibold text-white mb-3">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-[11px] text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-gray-500">
              © 2026 Recruit AI. All rights reserved.
            </p>
            <p className="text-[10px] text-gray-500">
              Built with Next.js and <a href="https://exa.ai" className="text-gray-400 hover:text-white">Exa AI</a> Websets API
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { AppLayout } from '@/components/AppLayout';
import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageCircle,
  FileText,
  Zap,
  Users,
  Settings,
  ExternalLink
} from 'lucide-react';

const faqs = [
  {
    question: 'How does the AI search work?',
    answer: 'Our AI uses semantic search powered by Exa Websets to understand the meaning behind your search query, not just keywords. Describe your ideal candidate in plain English, and the AI will find matching profiles across the web.'
  },
  {
    question: 'What sources does Talist search?',
    answer: 'Talist searches across the entire public web including personal websites, GitHub profiles, LinkedIn (public data), portfolios, blog posts, and professional communities.'
  },
  {
    question: 'How accurate are the search results?',
    answer: 'Our AI verifies each result against your criteria and cross-references data from multiple sources. You\'ll see a match score and the specific reasons why each candidate was selected.'
  },
  {
    question: 'Can I export my candidate lists?',
    answer: 'Yes! Pro and Enterprise users can export candidate data to CSV format for easy integration with your ATS or other tools.'
  },
  {
    question: 'How many searches can I do?',
    answer: 'Free accounts get 10 searches per month. Pro accounts get 100 searches per month. Enterprise accounts have unlimited searches.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption and never share your search data or candidate lists with third parties. Your data belongs to you.'
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Help & Support</h1>
          <p className="text-[var(--text-secondary)]">
            Find answers to common questions or get in touch with our team.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]"
          />
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Zap, label: 'Getting Started', href: '#faqs' },
            { icon: FileText, label: 'Documentation', href: '#faqs' },
            { icon: Mail, label: 'Contact Support', href: 'mailto:support@talist.ai' },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="flex items-center gap-3 p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] hover:border-[var(--primary)]/50 transition-colors"
            >
              <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center text-[var(--primary)]">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
            </a>
          ))}
        </div>

        {/* FAQs */}
        <section id="faqs" className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div
                key={i}
                className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">{faq.question}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {filteredFaqs.length === 0 && (
            <p className="text-center text-[var(--text-tertiary)] py-8">
              No results found for "{searchQuery}"
            </p>
          )}
        </section>

        {/* Contact */}
        <section className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-6 text-center">
          <MessageCircle className="w-10 h-10 text-[var(--primary)] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Still need help?</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Our support team is here to assist you.
          </p>
          <a
            href="mailto:support@talist.ai"
            className="btn btn-primary inline-flex"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </section>
      </div>
    </AppLayout>
  );
}

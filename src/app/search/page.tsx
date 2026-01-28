'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SearchForm } from '@/components/SearchForm';
import { SearchHistory } from '@/components/SearchHistory';
import { useSearches } from '@/lib/hooks/useSearches';
import { useAuth } from '@/lib/hooks/useAuth';
import { useActivity } from '@/lib/hooks/useActivity';
import { useToast } from '@/components/Toast';
import { CreateEnrichmentParameters } from '@/types/exa';
import { useState } from 'react';
import { LogIn, Lock } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { isAuthenticated, isLoading, isConfigured, signInWithGoogle } = useAuth();
  const { createSearch } = useSearches();
  const { logSearchCreated } = useActivity();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!isConfigured) {
      addToast('Authentication is not configured. Please set up Supabase.', 'error');
      return;
    }
    try {
      await signInWithGoogle();
    } catch {
      addToast('Failed to sign in. Please try again.', 'error');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Sign in to start searching
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md mb-8">
            Create an account or sign in to access our AI-powered candidate search.
            Your searches and candidate lists will be saved to your account.
          </p>
          <button
            onClick={handleSignIn}
            className="btn btn-primary h-12 px-8 text-base"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Free accounts get 10 searches per month
          </p>
        </div>
      </AppLayout>
    );
  }

  const handleSearch = async (
    query: string,
    count: number,
    criteria: string[],
    enrichments: CreateEnrichmentParameters[]
  ) => {
    setIsSubmitting(true);

    try {
      // 1. Log activity
      logSearchCreated(query, count);

      // 2. Create the search via API
      // Use a longer timeout for creation as AI processing can take time
      const res = await fetch('/api/websets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          count,
          criteria,
          enrichments,
          timeout: 60000, // 60s timeout for creation (Expert Fix)
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to start search');
      }

      const webset = await res.json();

      // 3. Save reference to Supabase immediately (for history)
      if (isAuthenticated && webset.id) {
        await createSearch({
          name: query,
          query: query,
          count: count,
          criteria: criteria,
          enrichments: enrichments.map(e => ({ description: e.description, format: e.format || 'text' })),
          exaWebsetId: webset.id,
        });
      }

      // 4. Redirect to details page immediately
      if (webset.id) {
        router.push(`/searches/${webset.id}`);
      } else {
        throw new Error('No search ID returned');
      }

    } catch (error) {
      console.error('Search error:', error);
      addToast('Failed to start search. Please try again.', 'error');
      setIsSubmitting(false); // Only reset on error
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 py-8 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--primary-light)] border border-[var(--primary)]/10 rounded-full mb-2">
            <span className="material-icons-outlined text-xs text-[var(--primary)]">auto_awesome</span>
            <span className="text-[10px] font-medium text-[var(--primary)] uppercase tracking-wide">AI-Powered Headhunter</span>
          </div>

          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Find your next hire in seconds
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            Describe your ideal candidate in plain English. Our AI searches the entire web to find people who match your exact criteria.
          </p>
        </div>

        {/* Search Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-light)] p-6 shadow-[var(--shadow-md)] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
              <SearchForm
                onSearch={handleSearch}
                isLoading={isSubmitting}
              />
            </div>
          </div>

          {/* Recent History Inline */}
          <div className="mt-4 flex justify-center">
            <SearchHistory
              onRepeatSearch={(query, count, criteria) => {
                handleSearch(query, count, criteria, []);
              }}
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 pt-8">
          {[
            {
              icon: 'psychology',
              title: 'Natural Understanding',
              description: 'Our AI understands context, not just keywords. It knows "Vue expert" implies JavaScript mastery.'
            },
            {
              icon: 'verified',
              title: 'Real-time Verification',
              description: 'Every profile is verified against live data sources to ensure accuracy and availability.'
            },
            {
              icon: 'stream',
              title: 'Live Streaming',
              description: 'Watch candidates appear in real-time as the AI discovers them across the web.'
            }
          ].map((feature, i) => (
            <div key={i} className="text-center space-y-2 p-4 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors duration-300">
              <div className="w-10 h-10 mx-auto rounded-lg bg-[var(--bg-surface)] flex items-center justify-center mb-3 text-[var(--primary)]">
                <span className="material-icons-outlined text-xl">{feature.icon}</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{feature.title}</h3>
              <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}


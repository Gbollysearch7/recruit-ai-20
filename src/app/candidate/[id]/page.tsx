'use client';

import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { CandidateDetailPanel } from '@/components/CandidateDetailPanel';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import Link from 'next/link';

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  return (
    <AppLayout>
      <div className="space-y-4 animate-page-in">
        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span className="material-icons-outlined text-sm">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Main Content */}
        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
          <CandidateDetailPanel candidateId={candidateId} isPanel={false} />
        </div>
      </div>
    </AppLayout>
  );
}

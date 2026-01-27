'use client';

import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--error-bg)] flex items-center justify-center">
          <span className="material-icons-outlined text-3xl text-[var(--error)]">error_outline</span>
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Authentication Error
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          There was a problem signing you in. This could be because the authentication
          link has expired or there was an issue with your account.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="btn btn-primary w-full flex items-center justify-center"
          >
            <span className="material-icons-outlined text-sm mr-2">home</span>
            Back to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary w-full flex items-center justify-center"
          >
            <span className="material-icons-outlined text-sm mr-2">refresh</span>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

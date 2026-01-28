'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'talist-cookie-consent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      necessary: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] shadow-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Icon */}
          <div className="hidden sm:flex w-10 h-10 bg-[var(--primary)]/10 rounded-lg items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-[var(--primary)]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
              We use cookies
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              We use cookies to improve your experience, analyze site traffic, and for authentication.
              By clicking "Accept all", you consent to our use of cookies.{' '}
              <Link href="/privacy" className="text-[var(--primary)] hover:underline">
                Learn more
              </Link>
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="btn btn-primary justify-center"
              >
                Accept all
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="btn btn-secondary justify-center"
              >
                Necessary only
              </button>
              <Link
                href="/privacy#cookies"
                className="btn btn-ghost justify-center text-[var(--text-secondary)]"
              >
                Cookie settings
              </Link>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleAcceptNecessary}
            className="absolute top-3 right-3 sm:static p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

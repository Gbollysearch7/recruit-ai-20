'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/search');
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="material-icons-outlined text-[var(--primary)] text-xl">filter_center_focus</span>
            <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">Recruit AI</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-6 shadow-[var(--shadow-sm)]">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--success-bg)] flex items-center justify-center">
                <span className="material-icons-outlined text-2xl text-[var(--success)]">check_circle</span>
              </div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Password updated</h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Your password has been reset. Redirecting you now...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                  <span className="material-icons-outlined text-lg text-[var(--primary)]">lock_reset</span>
                </div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                  Set new password
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Enter your new password below.
                </p>
              </div>

              {error && (
                <div className="mb-4 px-3 py-2 rounded-md bg-[var(--error-bg)] border border-[var(--error)]/20 text-xs text-[var(--error-text)] flex items-start gap-2">
                  <span className="material-icons-outlined text-sm mt-0.5">error</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="password" className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      className="w-full px-3 py-2 pr-9 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-md text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <span className="material-icons-outlined text-sm">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-md text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-[var(--primary)] text-white text-xs font-medium rounded-md hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="material-icons-outlined text-sm animate-spin">refresh</span>
                      Updating password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <span className="material-icons-outlined text-2xl text-[var(--text-muted)] animate-spin">refresh</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/search';
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, isAuthenticated, isLoading: authLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && !authLoading) {
    router.push(redirect);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        router.push(redirect);
      } else if (mode === 'signup') {
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
        await signUpWithEmail(email, password, fullName);
        setMessage('Check your email for a confirmation link to complete your registration.');
        setMode('signin');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setMessage('If an account exists with that email, you will receive a password reset link.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(msg);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setMessage('');
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
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {mode === 'signin'
                ? 'Sign in to continue to Recruit AI'
                : mode === 'signup'
                ? 'Start finding your ideal candidates'
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-[var(--error-bg)] border border-[var(--error)]/20 text-xs text-[var(--error-text)] flex items-start gap-2">
              <span className="material-icons-outlined text-sm mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-4 px-3 py-2 rounded-md bg-[var(--success-bg)] border border-[var(--success)]/20 text-xs text-[var(--success-text)] flex items-start gap-2">
              <span className="material-icons-outlined text-sm mt-0.5">check_circle</span>
              <span>{message}</span>
            </div>
          )}

          {/* Google OAuth (not shown in forgot mode) */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-md text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[var(--border-light)]" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-[var(--border-light)]" />
              </div>
            </>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-md text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-colors"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-md text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-colors"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="text-[11px] font-medium text-[var(--text-secondary)]">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[10px] text-[var(--primary)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                    required
                    minLength={mode === 'signup' ? 6 : undefined}
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
            )}

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-md text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-[var(--primary)] text-white text-xs font-medium rounded-md hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-icons-outlined text-sm animate-spin">refresh</span>
                  {mode === 'signin' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending reset link...'}
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                </>
              )}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-4 text-center text-xs text-[var(--text-secondary)]">
            {mode === 'signin' && (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-[var(--primary)] hover:underline font-medium">
                  Sign up
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button onClick={() => switchMode('signin')} className="text-[var(--primary)] hover:underline font-medium">
                  Sign in
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <>
                Remember your password?{' '}
                <button onClick={() => switchMode('signin')} className="text-[var(--primary)] hover:underline font-medium">
                  Back to sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[var(--text-muted)] mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

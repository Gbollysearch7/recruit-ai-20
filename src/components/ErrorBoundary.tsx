'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In production, you would send this to an error tracking service
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--error-bg)] flex items-center justify-center">
              <span className="material-icons-outlined text-3xl text-[var(--error)]">error_outline</span>
            </div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              <span className="material-icons-outlined text-sm mr-2">refresh</span>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

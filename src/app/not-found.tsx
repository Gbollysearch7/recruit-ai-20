import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* 404 graphic */}
        <div className="mb-8">
          <h1 className="text-[120px] font-bold text-[var(--primary)]/20 leading-none">404</h1>
        </div>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          Page not found
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn btn-primary w-full sm:w-auto justify-center"
          >
            Go to homepage
          </Link>
          <Link
            href="/help"
            className="btn btn-secondary w-full sm:w-auto justify-center"
          >
            Get help
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-light)]">
          <p className="text-sm text-[var(--text-tertiary)] mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/search" className="text-[var(--primary)] hover:underline">Search</Link>
            <Link href="/dashboard" className="text-[var(--primary)] hover:underline">Dashboard</Link>
            <Link href="/contact" className="text-[var(--primary)] hover:underline">Contact us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

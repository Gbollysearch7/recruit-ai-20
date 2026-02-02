'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

// Auto-generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  const pathMap: Record<string, { label: string; icon?: string }> = {
    dashboard: { label: 'Dashboard', icon: 'dashboard' },
    search: { label: 'Search', icon: 'search' },
    searches: { label: 'Saved Searches', icon: 'history' },
    lists: { label: 'My Lists', icon: 'folder' },
    settings: { label: 'Settings', icon: 'settings' },
    candidate: { label: 'Candidate', icon: 'person' },
  };

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Check if it's a known path or a dynamic segment (like [id])
    const pathInfo = pathMap[segment];
    if (pathInfo) {
      items.push({
        label: pathInfo.label,
        href: index < segments.length - 1 ? currentPath : undefined, // Don't link the current page
        icon: pathInfo.icon,
      });
    } else if (segment.length > 10) {
      // Likely an ID - truncate it
      items.push({
        label: segment.slice(0, 8) + '...',
        href: undefined,
      });
    } else {
      // Unknown segment, use as-is
      items.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: index < segments.length - 1 ? currentPath : undefined,
      });
    }
  });

  return items;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-4" aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
          >
            <span className="material-icons-outlined text-sm">home</span>
          </Link>
          <span className="material-icons-outlined text-sm opacity-50">chevron_right</span>
        </>
      )}

      {breadcrumbItems.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && (
            <span className="material-icons-outlined text-sm opacity-50">chevron_right</span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
            >
              {item.icon && (
                <span className="material-icons-outlined text-sm">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-[var(--text-secondary)] font-medium">
              {item.icon && (
                <span className="material-icons-outlined text-sm">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// Simpler inline breadcrumb for headers
export function InlineBreadcrumb({
  parent,
  parentHref,
  current
}: {
  parent: string;
  parentHref: string;
  current: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Link
        href={parentHref}
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        {parent}
      </Link>
      <span className="material-icons-outlined text-xs text-[var(--text-muted)] opacity-50">
        chevron_right
      </span>
      <span className="text-[var(--text-secondary)] font-medium truncate max-w-[200px]">
        {current}
      </span>
    </div>
  );
}

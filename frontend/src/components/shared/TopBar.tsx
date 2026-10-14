import { useLocation } from 'react-router';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

// ─── Breadcrumb Mapping ────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  '/': 'Overview',
  '/resumes': 'Resumes',
  '/jobs': 'Jobs',
  '/analysis': 'Analysis Studio',
  '/improvement': 'Recommendations',
  '/settings': 'Settings',
};

function getBreadcrumbs(pathname: string): { label: string; path: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; path: string }[] = [
    { label: 'VECTOR', path: '/' },
  ];

  if (pathname === '/') {
    crumbs.push({ label: 'Overview', path: '/' });
    return crumbs;
  }

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = ROUTE_LABELS[currentPath] || decodeURIComponent(segment);
    crumbs.push({ label, path: currentPath });
  }

  return crumbs;
}

// ─── TopBar Props ──────────────────────────────────────────────────
export interface TopBarProps {
  className?: string;
}

// ─── TopBar Component ──────────────────────────────────────────────
export function TopBar({ className }: TopBarProps) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header
      className={cn(
        'h-14 flex items-center justify-between px-6 border-b border-border-default bg-bg-primary shrink-0',
        className
      )}
    >
      {/* Left: Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={`${crumb.path}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight size={12} className="text-text-muted" />
            )}
            <span
              className={cn(
                index === breadcrumbs.length - 1
                  ? 'text-text-primary font-medium'
                  : 'text-text-muted'
              )}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-default text-text-muted text-sm hover:border-border-hover hover:text-text-secondary transition-colors duration-fast"
          aria-label="Search"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline ml-4 text-[10px] text-text-muted bg-bg-hover px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors duration-fast"
          aria-label="Notifications"
        >
          <Bell size={16} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-primary" />
        </button>
      </div>
    </header>
  );
}

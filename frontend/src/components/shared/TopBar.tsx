import { useLocation } from 'react-router';
import { ChevronRight } from 'lucide-react';
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

    </header>
  );
}

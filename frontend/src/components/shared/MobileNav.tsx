import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  FlaskConical,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';

interface MobileNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const MOBILE_NAV: MobileNavItem[] = [
  { label: 'Overview', path: ROUTES.HOME, icon: LayoutDashboard },
  { label: 'Resumes', path: ROUTES.RESUMES, icon: FileText },
  { label: 'Jobs', path: ROUTES.JOBS, icon: Briefcase },
  { label: 'Analysis', path: ROUTES.ANALYSIS, icon: FlaskConical },
  { label: 'Improve', path: ROUTES.IMPROVEMENT, icon: Sparkles },
];

export interface MobileNavProps {
  className?: string;
}

/**
 * Bottom navigation bar for mobile viewports (< 768px).
 * Mirrors the primary nav items from the sidebar.
 */
export function MobileNav({ className }: MobileNavProps) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around',
        'h-16 bg-bg-primary border-t border-border-default',
        'md:hidden', // Only visible on mobile
        className
      )}
      aria-label="Mobile navigation"
    >
      {MOBILE_NAV.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors duration-fast',
              isActive ? 'text-accent-primary' : 'text-text-muted'
            )}
            aria-label={item.label}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

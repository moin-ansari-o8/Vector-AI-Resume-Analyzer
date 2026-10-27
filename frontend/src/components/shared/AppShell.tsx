import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Sidebar } from '@/components/shared/Sidebar';
import { TopBar } from '@/components/shared/TopBar';
import { MobileNav } from '@/components/shared/MobileNav';
import { AIChat } from '@/components/chat/AIChat';
import { cn } from '@/utils/cn';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAppStore } from '@/stores/useAppStore';

export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AppShell composes Sidebar + TopBar + content area + MobileNav.
 * Handles responsive behavior per plan.md Section 9.3:
 *
 *   Desktop (≥1280px)  → Full 240px sidebar
 *   Tablet (768–1279)  → Collapsed 64px icon rail
 *   Mobile (<768px)    → No sidebar, bottom nav bar
 */
export function AppShell({ children, className }: AppShellProps) {
  const location = useLocation();
  const breakpoint = useBreakpoint();
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  // Auto-collapse sidebar on tablet breakpoint
  useEffect(() => {
    if (breakpoint === 'tablet') {
      setSidebarCollapsed(true);
    } else if (breakpoint === 'desktop') {
      setSidebarCollapsed(false);
    }
  }, [breakpoint, setSidebarCollapsed]);

  const isMobile = breakpoint === 'mobile';
  const isImprovementPage =
    location.pathname.startsWith('/improvement') ||
    location.pathname.startsWith('/resumes/');

  return (
    <div className={cn('flex h-screen w-full overflow-hidden bg-bg-primary', className)}>
      {/* Sidebar — hidden on mobile */}
      {!isMobile && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            isMobile && 'pb-16' // Padding for mobile bottom nav
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <MobileNav />}

      {/* Global floating AI chat - hidden on improvement page since it has its own dedicated workspace chat */}
      {!isImprovementPage && <AIChat />}
    </div>
  );
}

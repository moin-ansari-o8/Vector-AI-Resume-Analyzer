import { Outlet } from 'react-router';
import { AppShell } from '@/components/shared/AppShell';

/**
 * DashboardLayout — wraps all dashboard pages with the AppShell
 * (Sidebar + TopBar + content area).
 *
 * Used as a layout route in AppRouter.tsx.
 */
export function DashboardLayout() {
  return (
    <AppShell>
      <div className="p-4 sm:p-8">
        <Outlet />
      </div>
    </AppShell>
  );
}

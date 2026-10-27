import { NavLink, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  FlaskConical,
  Sparkles,
  Settings,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import { useAppStore } from '@/stores/useAppStore';

// ─── Nav Item Data ───────────────────────────────────────────────────
interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', path: ROUTES.HOME, icon: LayoutDashboard },
  { label: 'Resumes', path: ROUTES.RESUMES, icon: FileText },
  { label: 'Jobs', path: ROUTES.JOBS, icon: Briefcase },
  { label: 'Analysis Studio', path: ROUTES.ANALYSIS, icon: FlaskConical },
  { label: 'Recommendations', path: ROUTES.IMPROVEMENT, icon: Sparkles },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
];

// ─── Sidebar Props ───────────────────────────────────────────────────
export interface SidebarProps {
  className?: string;
}

// ─── Sidebar Component ──────────────────────────────────────────────
export function Sidebar({ className }: SidebarProps) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col h-full bg-bg-primary border-r border-border-default select-none overflow-hidden shrink-0',
        className
      )}
    >
      {/* ── Logo & Collapse Toggle ───────────────────────────────── */}
      <div className="flex items-center h-16 px-4 shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-2 min-w-0"
            >
              <div className="w-8 h-8 rounded-md bg-accent-primary flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-bg-primary tracking-tight">V</span>
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-tight whitespace-nowrap">
                VECTOR
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <div className="w-8 h-8 rounded-md bg-accent-primary flex items-center justify-center mx-auto">
            <span className="text-sm font-bold text-bg-primary tracking-tight">V</span>
          </div>
        )}

        {!collapsed && (
          <button
            onClick={toggleSidebar}
            className="ml-auto p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors duration-fast"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* ── Primary Navigation ───────────────────────────────────── */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {PRIMARY_NAV.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)
            }
          />
        ))}

        {/* Divider */}
        <div className="my-3 mx-2 border-t border-border-default" />

        {SECONDARY_NAV.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={
              item.path.startsWith('#')
                ? false
                : location.pathname.startsWith(item.path)
            }
          />
        ))}
      </nav>

      {/* ── Bottom: Profile + Expand ─────────────────────────────── */}
      <div className="p-3 mt-auto">
        {collapsed ? (
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors duration-fast"
            aria-label="Expand sidebar"
          >
            <PanelLeft size={18} />
          </button>
        ) : (
          <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-bg-hover transition-colors duration-fast text-left group outline-none">
            <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center shrink-0 shadow-sm group-hover:border-border-hover transition-colors">
              <span className="text-xs font-semibold text-text-primary">U</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary truncate">User</p>
              <p className="text-xs text-text-muted truncate">Local Session</p>
            </div>
          </button>
        )}
      </div>
    </motion.aside>
  );
}

// ─── Individual Nav Item ────────────────────────────────────────────
interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}

function SidebarNavItem({ item, collapsed, isActive }: SidebarNavItemProps) {
  const Icon = item.icon;
  const isHashLink = item.path.startsWith('#');

  const baseClasses = cn(
    'group relative flex items-center w-full gap-3 rounded-md transition-all duration-200 outline-none border-none',
    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2 text-left',
    isActive
      ? 'bg-bg-hover text-text-primary font-medium'
      : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover font-medium'
  );

  const content = (
    <>
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 inset-y-0 my-auto w-0.5 h-5 bg-accent-primary rounded-r-full"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}

      <Icon size={18} className="shrink-0" />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-bg-elevated text-text-primary text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-fast z-50 shadow-md">
          {item.label}
        </div>
      )}
    </>
  );

  if (isHashLink) {
    return (
      <button className={baseClasses} aria-label={item.label}>
        {content}
      </button>
    );
  }

  return (
    <NavLink to={item.path} className={baseClasses} aria-label={item.label}>
      {content}
    </NavLink>
  );
}

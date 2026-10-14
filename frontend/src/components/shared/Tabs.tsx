import { cn } from '@/utils/cn';

export interface Tab {
  label: string;
  value: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Tab navigation component — underline style.
 */
export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex border-b border-border-default', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative px-4 py-2.5 text-sm font-medium transition-colors duration-fast whitespace-nowrap',
            activeTab === tab.value
              ? 'text-text-primary'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          {tab.label}
          {activeTab === tab.value && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}

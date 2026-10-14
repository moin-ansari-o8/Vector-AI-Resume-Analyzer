import { cn } from '@/utils/cn';

export interface StatReadoutProps {
  label: string;
  value: string | number;
  change?: string;
  className?: string;
}

/**
 * Single stat display — number + label + optional change indicator.
 * Used in StatsRow on the Dashboard.
 */
export function StatReadout({ label, value, change, className }: StatReadoutProps) {
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');

  return (
    <div
      className={cn(
        'flex flex-col gap-1 p-4 rounded-lg border border-border-default bg-bg-secondary',
        className
      )}
    >
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-text-primary tabular-nums">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'text-xs font-medium',
              isPositive && 'text-accent-positive',
              isNegative && 'text-accent-negative',
              !isPositive && !isNegative && 'text-text-muted'
            )}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

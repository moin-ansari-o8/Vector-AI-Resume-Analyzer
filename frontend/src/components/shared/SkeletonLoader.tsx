import { cn } from '@/utils/cn';

export interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
}

/**
 * Loading skeleton with shimmer animation.
 */
export function SkeletonLoader({
  className,
  variant = 'rect',
  width,
  height,
}: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-bg-hover',
        variant === 'text' && 'h-4 rounded',
        variant === 'circle' && 'rounded-full',
        variant === 'rect' && 'rounded-lg',
        className
      )}
      style={{ width, height }}
    />
  );
}

/**
 * Pre-built skeleton for a table row.
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonLoader
          key={i}
          variant="text"
          className="flex-1"
          height="14px"
        />
      ))}
    </div>
  );
}

/**
 * Pre-built skeleton for a stat card.
 */
export function StatSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border border-border-default bg-bg-secondary">
      <SkeletonLoader variant="text" width="80px" height="12px" />
      <SkeletonLoader variant="text" width="120px" height="28px" />
    </div>
  );
}

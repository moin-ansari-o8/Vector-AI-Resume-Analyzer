import { cn } from '@/utils/cn';

export interface SkillTagProps {
  label: string;
  variant?: 'matched' | 'missing' | 'neutral';
  className?: string;
}

/**
 * Skill chip with matched/missing/neutral variants.
 * Matched = green tint, Missing = red tint, Neutral = default muted.
 */
export function SkillTag({ label, variant = 'neutral', className }: SkillTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors duration-fast',
        variant === 'matched' && 'bg-accent-positive/15 text-accent-positive',
        variant === 'missing' && 'bg-accent-negative/15 text-accent-negative',
        variant === 'neutral' && 'bg-bg-hover text-text-secondary',
        className
      )}
      title={label}
    >
      {label}
    </span>
  );
}

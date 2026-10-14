import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ParsingStep {
  label: string;
  status: 'pending' | 'active' | 'done';
}

export interface ParsingStatusProps {
  steps: ParsingStep[];
  className?: string;
}

/**
 * Multi-step parsing progress indicator.
 * Shows stages like: Uploading → Parsing → Extracting → Indexing → Ready
 */
export function ParsingStatus({ steps, className }: ParsingStatusProps) {
  const activeIndex = steps.findIndex((s) => s.status === 'active');
  const progress = activeIndex >= 0
    ? ((activeIndex + 0.5) / steps.length) * 100
    : steps.every((s) => s.status === 'done')
      ? 100
      : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-border-default rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Step labels */}
      <div className="flex items-center gap-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {step.status === 'done' ? (
              <Check size={12} className="text-accent-positive" />
            ) : step.status === 'active' ? (
              <motion.div
                className="w-2 h-2 rounded-full bg-accent-primary"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ) : (
              <div className="w-2 h-2 rounded-full bg-border-default" />
            )}
            <span
              className={cn(
                'text-xs',
                step.status === 'done' && 'text-text-secondary',
                step.status === 'active' && 'text-text-primary font-medium',
                step.status === 'pending' && 'text-text-muted'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

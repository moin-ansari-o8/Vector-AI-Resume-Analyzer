import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface MatchRingProps {
  score: number; // 0–100
  size?: number; // px, default 48
  strokeWidth?: number;
  className?: string;
}

/**
 * Circular score indicator using SVG + Framer Motion.
 * Color by score:
 *   ≥ 80 → accent-positive (green)
 *   ≥ 60 → accent-warning (amber)
 *   < 60 → accent-negative (red)
 */
export function MatchRing({ score, size = 48, strokeWidth = 3.5, className }: MatchRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  const color =
    score >= 80
      ? 'var(--accent-positive)'
      : score >= 60
        ? 'var(--accent-warning)'
        : 'var(--accent-negative)';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {/* Center text */}
      <span
        className="absolute text-xs font-semibold tabular-nums"
        style={{ color }}
      >
        {Math.round(score)}
      </span>
    </div>
  );
}

import { motion } from 'framer-motion';

interface BreakdownProps {
  label: string;
  score: number;
}

function BreakdownBar({ label, score }: BreakdownProps) {
  const color =
    score >= 80 ? 'bg-accent-positive' : score >= 60 ? 'bg-accent-warning' : 'bg-accent-negative';

  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-sm text-text-secondary">{label}</span>
      <div className="flex-1 h-1.5 bg-border-default rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </div>
      <span className="w-8 text-right text-sm font-medium tabular-nums text-text-primary">
        {score}
      </span>
    </div>
  );
}

interface ScoreBreakdownProps {
  breakdown: {
    skills: number;
    experience: number;
    education: number;
  };
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      <BreakdownBar label="Skills" score={breakdown.skills} />
      <BreakdownBar label="Experience" score={breakdown.experience} />
      <BreakdownBar label="Education" score={breakdown.education} />
    </div>
  );
}

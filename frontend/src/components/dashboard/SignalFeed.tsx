import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useResumeStore } from '@/stores/useResumeStore';
import { useJobStore } from '@/stores/useJobStore';
import { matchingService } from '@/services/matching.service';

const ICONS = {
  positive: <CheckCircle2 size={16} className="text-accent-positive" />,
  negative: <AlertCircle size={16} className="text-accent-negative" />,
  info: <Info size={16} className="text-accent-primary" />,
  neutral: <Activity size={16} className="text-text-muted" />,
};

type SignalType = 'positive' | 'negative' | 'info' | 'neutral';

interface Signal {
  id: string;
  type: SignalType;
  message: string;
  timestamp: string;
}

export function SignalFeed() {
  const resumes = useResumeStore(state => state.resumes);
  const jobs = useJobStore(state => state.jobs);
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    matchingService.getRecentMatches().then(matches => {
      const generatedSignals: Signal[] = [];
      
      matches.slice(0, 5).forEach((m: any, idx: number) => {
        generatedSignals.push({
          id: `match_${idx}`,
          type: m.score >= 80 ? 'positive' : (m.score < 50 ? 'negative' : 'neutral'),
          message: `Match run: ${m.candidateId} vs ${m.jobId} (${m.score}%)`,
          timestamp: m.timestamp
        });
      });

      resumes.slice(0, 5).forEach((r, idx) => {
        generatedSignals.push({
          id: `res_${idx}`,
          type: 'info',
          message: `Resume uploaded: ${r.candidateName}`,
          timestamp: r.uploadedAt
        });
      });

      jobs.slice(0, 5).forEach((j, idx) => {
        generatedSignals.push({
          id: `job_${idx}`,
          type: 'info',
          message: `New job created: ${j.role}`,
          timestamp: j.addedAt
        });
      });

      // Sort by timestamp descending
      generatedSignals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (generatedSignals.length === 0) {
        generatedSignals.push({
          id: 'welcome',
          type: 'neutral',
          message: 'System ready. Upload a resume to get started.',
          timestamp: new Date().toISOString()
        });
      }

      setSignals(generatedSignals.slice(0, 8));
    });
  }, [resumes, jobs]);

  return (
    <div className="bg-bg-secondary rounded-lg border border-border-default flex flex-col h-[400px]">
      <div className="px-6 py-4 border-b border-border-default">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Activity Feed</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {signals.map((signal, idx) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5 shrink-0 bg-bg-primary rounded-full p-1 border border-border-default">
              {ICONS[signal.type]}
            </div>
            <div>
              <p className={cn(
                "text-sm",
                signal.type === 'positive' && "text-text-primary",
                signal.type === 'negative' && "text-accent-negative",
                signal.type === 'info' && "text-text-secondary",
                signal.type === 'neutral' && "text-text-muted",
              )}>
                {signal.message}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

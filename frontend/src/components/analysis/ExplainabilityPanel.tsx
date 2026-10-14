import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SignalItem {
  skill: string;
  type: string;
  context: string;
}

interface ExplainabilityPanelProps {
  explainability: string;
  signals: SignalItem[];
}

export function ExplainabilityPanel({ explainability, signals }: ExplainabilityPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-bg-secondary p-5 rounded-lg border border-border-default">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          AI Analysis Summary
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {explainability}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Key Signals
        </h3>
        
        {signals.map((signal, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-3 p-3 rounded-md bg-bg-hover border border-border-default"
          >
            <div className="mt-0.5 shrink-0">
              {signal.type === 'strong' ? (
                <CheckCircle2 size={16} className="text-accent-positive" />
              ) : (
                <AlertCircle size={16} className="text-accent-warning" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {signal.skill} <span className={cn(
                  "text-xs ml-2 font-normal uppercase tracking-wider",
                  signal.type === 'strong' ? 'text-accent-positive' : 'text-accent-warning'
                )}>
                  {signal.type === 'strong' ? 'Strong Signal' : 'Weak/Missing Signal'}
                </span>
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {signal.context}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

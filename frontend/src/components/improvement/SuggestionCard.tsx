import { Check, X, Edit2 } from 'lucide-react';
import { Button } from '../shared/Button';

interface SuggestionCardProps {
  section: string;
  originalText: string;
  suggestedText: string;
  reasoning: string;
}

export function SuggestionCard({ section, originalText, suggestedText, reasoning }: SuggestionCardProps) {
  return (
    <div className="bg-bg-primary border border-border-default rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {section}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-accent-primary/10 text-accent-primary">
          AI Suggestion
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-text-muted mb-1">Original</p>
          <div className="p-3 bg-accent-negative/5 border border-accent-negative/20 rounded-md">
            <p className="text-sm text-text-secondary line-through opacity-70">{originalText}</p>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-text-muted mb-1">Suggested</p>
          <div className="p-3 bg-accent-positive/5 border border-accent-positive/20 rounded-md">
            <p className="text-sm text-text-primary">{suggestedText}</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted mb-1">Why?</p>
        <p className="text-sm text-text-secondary italic">"{reasoning}"</p>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border-default">
        <Button variant="primary" size="sm" icon={<Check size={14} />} className="flex-1">
          Accept
        </Button>
        <Button variant="secondary" size="sm" icon={<Edit2 size={14} />} className="flex-1">
          Edit
        </Button>
        <Button variant="ghost" size="sm" icon={<X size={14} className="text-accent-negative" />} className="flex-1 hover:bg-accent-negative/10">
          Reject
        </Button>
      </div>
    </div>
  );
}

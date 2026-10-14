import { useState } from 'react';
import { Check, X, Edit2, Sparkles, CornerDownLeft } from 'lucide-react';
import { Button } from '../shared/Button';
import { cn } from '@/utils/cn';

interface SuggestionCardProps {
  section: string;
  originalText: string;
  suggestedText: string;
  reasoning: string;
  onAccept?: (suggestedText: string) => void;
  onReject?: () => void;
  onSelect?: () => void;
  isActive?: boolean;
}

export function SuggestionCard({
  section,
  originalText,
  suggestedText,
  reasoning,
  onAccept,
  onReject,
  onSelect,
  isActive = false,
}: SuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState(suggestedText);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "bg-bg-primary border rounded-lg p-4 space-y-3 transition-all duration-fast cursor-pointer",
        isActive
          ? "border-accent-primary ring-1 ring-accent-primary/30 shadow-md"
          : "border-border-default hover:border-border-hover"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {section}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-accent-primary/10 text-accent-primary flex items-center gap-1">
          <Sparkles size={10} /> AI Recommendation
        </span>
      </div>

      <div className="space-y-2.5">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-text-muted mb-1 font-mono">Original Line</p>
          <div className="p-2.5 bg-accent-negative/5 border border-accent-negative/20 rounded-md">
            <p className="text-xs text-text-secondary line-through opacity-75 leading-relaxed font-sans">
              {originalText}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-[11px] uppercase tracking-wider text-text-muted mb-1 font-mono">Recommended Line</p>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-bg-elevated border border-accent-primary/40 rounded-md text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary font-sans leading-relaxed"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<CornerDownLeft size={12} />}
                  onClick={() => {
                    setIsEditing(false);
                    onAccept?.(customText);
                  }}
                >
                  Apply Custom
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-accent-positive/5 border border-accent-positive/20 rounded-md">
              <p className="text-xs text-text-primary font-medium leading-relaxed font-sans">
                {customText}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-text-muted mb-0.5 font-mono">Reasoning</p>
        <p className="text-xs text-text-secondary italic leading-relaxed">"{reasoning}"</p>
      </div>

      {!isEditing && (
        <div className="flex gap-2 pt-2 border-t border-border-default">
          <Button
            variant="primary"
            size="sm"
            icon={<Check size={14} />}
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onAccept?.(customText);
            }}
          >
            Accept
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit2 size={13} />}
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={14} className="text-accent-negative" />}
            className="hover:bg-accent-negative/10 px-2"
            title="Dismiss suggestion"
            onClick={(e) => {
              e.stopPropagation();
              onReject?.();
            }}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

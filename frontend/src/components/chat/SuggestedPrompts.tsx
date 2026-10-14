interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ prompts, onSelect }: SuggestedPromptsProps) {
  if (prompts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {prompts.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(prompt)}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-border-default bg-bg-primary text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-colors duration-fast text-left"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

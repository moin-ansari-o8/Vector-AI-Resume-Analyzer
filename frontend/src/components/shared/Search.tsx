import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SearchProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search input with icon, clear button, and focus ring.
 */
export function Search({
  value = '',
  onChange,
  placeholder = 'Search...',
  className,
}: SearchProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        'flex items-center gap-2 h-9 px-3 rounded-md border transition-colors duration-fast',
        focused
          ? 'border-accent-primary/50 bg-bg-secondary'
          : 'border-border-default bg-bg-secondary hover:border-border-hover',
        className
      )}
    >
      <SearchIcon size={14} className="text-text-muted shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="p-0.5 rounded text-text-muted hover:text-text-primary transition-colors duration-fast"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

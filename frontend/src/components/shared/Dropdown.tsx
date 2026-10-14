import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-md border text-sm transition-colors duration-fast',
          open
            ? 'border-border-hover bg-bg-hover text-text-primary'
            : 'border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary'
        )}
      >
        {selected?.icon}
        <span>{selected?.label || placeholder}</span>
        <ChevronDown
          size={14}
          className={cn('ml-1 transition-transform duration-fast', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[160px] py-1 rounded-lg bg-bg-elevated border border-border-default shadow-lg z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors duration-fast',
                opt.value === value
                  ? 'text-accent-primary bg-accent-primary/5'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

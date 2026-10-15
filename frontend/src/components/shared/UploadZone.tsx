import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

/**
 * Sophisticated drag-and-drop upload zone for resumes (PDF, PNG, JPG, JPEG).
 * NOT a generic dashed rectangle — styled to match our premium aesthetic.
 */
export function UploadZone({
  onFileSelect,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSizeMB = 10,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);

      const isAllowed = ALLOWED_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!isAllowed) {
        setError('Only PDF, PNG, JPG, and JPEG files are accepted.');
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMB}MB limit.`);
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  }

  function clearSelection() {
    setSelectedFile(null);
    setError(null);
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-dashed transition-all duration-normal',
        isDragging
          ? 'border-accent-primary bg-accent-primary/5'
          : 'border-border-default hover:border-border-hover',
        error && 'border-accent-negative',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
    >
      {selectedFile ? (
        // ── File Selected State ──
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <FileText size={20} className="text-accent-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-text-muted">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            onClick={clearSelection}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors duration-fast"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        // ── Drop Zone State ──
        <label className="flex flex-col items-center justify-center gap-3 p-8 cursor-pointer">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-normal',
              isDragging ? 'bg-accent-primary/20' : 'bg-bg-hover'
            )}
          >
            <Upload
              size={24}
              className={cn(
                'transition-colors duration-normal',
                isDragging ? 'text-accent-primary' : 'text-text-muted'
              )}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">
              {isDragging ? 'Drop resume here' : 'DROP RESUME HERE'}
            </p>
            <p className="text-xs text-text-muted mt-1">
              PDF, PNG, JPG · Max {maxSizeMB}MB ·{' '}
              <span className="text-accent-primary">Browse files</span>
            </p>
          </div>
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="sr-only"
          />
        </label>
      )}

      {error && (
        <p className="px-4 pb-3 text-xs text-accent-negative">{error}</p>
      )}
    </div>
  );
}

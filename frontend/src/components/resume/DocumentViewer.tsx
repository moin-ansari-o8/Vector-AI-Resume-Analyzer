import { useState, useEffect } from 'react';
import { FileText, Download, FileCode, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';
import { resumeApi } from '@/api/resume.api';
import { resumeService } from '@/services/resume.service';
import type { Resume } from '@/types/resume.types';

interface DocumentViewerProps {
  resumeId?: string;
  resume?: Resume | null;
  className?: string;
}

export function DocumentViewer({
  resumeId,
  resume: propResume,
  className,
}: DocumentViewerProps) {
  const [resume, setResume] = useState<Resume | null>(propResume || null);
  const [viewMode, setViewMode] = useState<'original' | 'raw'>('original');
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (propResume) {
      setResume(propResume);
    } else if (resumeId) {
      resumeService.getById(resumeId)
        .then(setResume)
        .catch((e) => console.error('Failed to load resume for viewer:', e));
    }
  }, [resumeId, propResume]);

  const pdfUrl = resume ? resumeApi.getPdfUrl(resume.id) : '';

  return (
    <div className={cn("flex flex-col h-full bg-bg-secondary border border-border-default rounded-lg overflow-hidden shadow-sm", className)}>
      {/* Viewer Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-bg-primary shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-bg-elevated border border-border-default text-accent-primary">
            <FileText size={16} />
          </div>
          <div>
            <span className="text-sm font-semibold text-text-primary block truncate max-w-xs">
              {resume?.candidateName || 'Candidate Resume'}
            </span>
            <span className="text-xs text-text-muted font-mono">{resume?.id || resumeId}</span>
          </div>
        </div>

        {/* View mode toggle: ONLY Original and Raw Text */}
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-elevated p-0.5 rounded-md border border-border-default text-xs">
            <button
              onClick={() => setViewMode('original')}
              className={cn(
                "px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5",
                viewMode === 'original'
                  ? "bg-bg-hover text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <FileText size={13} /> Original
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={cn(
                "px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5",
                viewMode === 'raw'
                  ? "bg-bg-hover text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <FileCode size={13} /> Raw Text
            </button>
          </div>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
              title="Open document in new tab"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Main Document Content Area */}
      <div className="flex-1 bg-[#0E0F0F] overflow-hidden flex flex-col p-2 md:p-3">
        {viewMode === 'original' ? (
          <div className="w-full h-full flex flex-col bg-bg-elevated rounded border border-border-default overflow-hidden">
            {pdfUrl && !pdfError ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full flex-1 border-0"
                title="Original Resume File"
                onError={() => setPdfError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-3">
                <FileText size={48} className="text-text-muted opacity-50" />
                <p className="text-sm text-text-primary font-medium">Original file preview</p>
                <p className="text-xs text-text-secondary max-w-sm">
                  {pdfUrl 
                    ? "If the PDF preview doesn't render in your browser frame, you can open or download it directly."
                    : "No uploaded original file found for this profile."}
                </p>
                {pdfUrl && (
                  <div className="flex gap-2 mt-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-accent-primary text-bg-primary rounded text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    >
                      <ExternalLink size={13} /> Open in New Tab
                    </a>
                    <a
                      href={pdfUrl}
                      download
                      className="px-3 py-1.5 bg-bg-hover text-text-primary border border-border-default rounded text-xs font-semibold hover:bg-bg-elevated transition-colors flex items-center gap-1.5"
                    >
                      <Download size={13} /> Download PDF
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto p-4 md:p-6 bg-bg-elevated rounded border border-border-default font-mono text-xs text-text-secondary whitespace-pre-wrap leading-relaxed shadow-sm">
            {resume?.raw_text || 'No raw text available.'}
          </div>
        )}
      </div>
    </div>
  );
}

import { DocumentViewer } from '../resume/DocumentViewer';
import type { Resume } from '@/types/resume.types';

interface OriginalResumeProps {
  resume: Resume | null;
  highlightedSection?: string | null;
  highlightedOriginalText?: string | null;
  onSelectLine?: (text: string, section: string) => void;
}

export function OriginalResume({
  resume,
  highlightedSection,
  highlightedOriginalText,
  onSelectLine,
}: OriginalResumeProps) {
  if (!resume) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-hover text-text-muted">
        <p>No resume selected. Please upload or choose a resume to inspect.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-hidden">
      <DocumentViewer
        resume={resume}
        resumeId={resume.id}
        highlightedSection={highlightedSection}
        highlightedOriginalText={highlightedOriginalText}
        onSelectLine={onSelectLine}
      />
    </div>
  );
}

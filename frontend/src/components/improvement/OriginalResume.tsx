import { DocumentViewer } from '../resume/DocumentViewer';
import type { Resume } from '@/types/resume.types';

interface OriginalResumeProps {
  resume: Resume | null;
  className?: string;
}

export function OriginalResume({
  resume,
  className,
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
        className={className}
      />
    </div>
  );
}

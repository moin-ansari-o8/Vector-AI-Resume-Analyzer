import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { DocumentViewer } from '@/components/resume/DocumentViewer';
import { ExtractionPanel } from '@/components/resume/ExtractionPanel';
import { resumeService } from '@/services/resume.service';
import type { Resume } from '@/types/resume.types';

export function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      resumeService.getById(id)
        .then(setResume)
        .catch((err) => console.error('Failed to load resume:', err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-text-muted">Loading candidate data...</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="text-text-muted">Resume not found.</p>
        <button 
          onClick={() => navigate('/resumes')}
          className="text-accent-primary hover:underline"
        >
          Back to Resumes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-8">
      {/* Header bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border-default bg-bg-primary shrink-0">
        <button
          onClick={() => navigate('/resumes')}
          className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors duration-fast"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-text-primary truncate">
          {resume.candidateName} <span className="text-text-muted font-normal text-sm ml-2">{id}</span>
        </h1>
      </div>

      {/* Split view */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-hidden">
          <DocumentViewer resumeId={resume.id} />
        </div>
        <div className="w-96 shrink-0 border-l border-border-default bg-bg-primary overflow-hidden">
          <ExtractionPanel resume={resume} />
        </div>
      </div>
    </div>
  );
}

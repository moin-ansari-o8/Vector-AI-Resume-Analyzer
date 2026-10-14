import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Save, Download, Sparkles, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { ImprovementWorkspace } from '@/components/improvement/ImprovementWorkspace';
import { useToast } from '@/components/shared/Toast';
import { useResumeStore } from '@/stores/useResumeStore';
import { resumeService } from '@/services/resume.service';
import { resumeApi } from '@/api/resume.api';
import { ROUTES } from '@/constants/routes';
import type { Resume } from '@/types/resume.types';

export function ResumeImprovementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: pathId } = useParams<{ id?: string }>();
  const { addToast } = useToast();

  const resumes = useResumeStore((state) => state.resumes);
  const setResumes = useResumeStore((state) => state.setResumes);
  const selectedResumeId = useResumeStore((state) => state.selectedResumeId);
  const selectResume = useResumeStore((state) => state.selectResume);

  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetResumeId = pathId || params.get('resumeId');

    resumeService.getAll().then((loadedResumes) => {
      setResumes(loadedResumes);

      if (targetResumeId) {
        resumeService.getById(targetResumeId)
          .then((r) => {
            setActiveResume(r);
            selectResume(r.id);
          })
          .catch(() => {
            const found = loadedResumes.find(r => r.id === targetResumeId);
            if (found) {
              setActiveResume(found);
              selectResume(found.id);
            } else if (loadedResumes.length > 0) {
              setActiveResume(loadedResumes[0]);
              selectResume(loadedResumes[0].id);
            }
          })
          .finally(() => setIsLoading(false));
      } else if (selectedResumeId) {
        const found = loadedResumes.find((r) => r.id === selectedResumeId);
        if (found) {
          setActiveResume(found);
        } else if (loadedResumes.length > 0) {
          setActiveResume(loadedResumes[0]);
          selectResume(loadedResumes[0].id);
        }
        setIsLoading(false);
      } else if (loadedResumes.length > 0) {
        setActiveResume(loadedResumes[0]);
        selectResume(loadedResumes[0].id);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
  }, [pathId, location.search]);


  const handleSelectResume = (id: string) => {
    selectResume(id);
    const found = resumes.find((r) => r.id === id);
    if (found) {
      setActiveResume(found);
    } else {
      resumeService.getById(id).then(setActiveResume);
    }
  };

  const handleSaveChanges = async () => {
    if (!activeResume) return;
    try {
      await resumeService.update(activeResume.id, {
        sections: activeResume.sections,
        raw_text: activeResume.raw_text,
      });
      addToast('All resume improvements saved to database!', 'success');
    } catch (e) {
      addToast('Failed to save changes', 'error');
    }
  };

  const pdfUrl = activeResume ? resumeApi.getPdfUrl(activeResume.id) : '';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-8">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-border-default bg-bg-primary shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.RESUMES)}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors duration-fast"
            title="Back to Resumes"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-text-primary">
                Resume Recommendations & Improvement
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-accent-primary/10 text-accent-primary">
                AI Powered
              </span>
            </div>
            
            {/* Candidate & Target selector inline */}
            <div className="flex items-center gap-3 mt-1 text-xs">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <User size={13} className="text-text-muted" />
                {resumes.length > 1 ? (
                  <select
                    value={activeResume?.id || ''}
                    onChange={(e) => handleSelectResume(e.target.value)}
                    className="bg-bg-elevated border border-border-default rounded px-2 py-0.5 text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.candidateName} ({r.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-medium text-text-primary">
                    {activeResume?.candidateName || 'No resume uploaded'}
                  </span>
                )}
              </div>

              <span className="text-border-default">|</span>

              <div className="flex items-center gap-1.5 text-text-secondary">
                <Briefcase size={13} className="text-text-muted" />
                <span>Target:</span>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-bg-elevated border border-border-default rounded px-2 py-0.5 text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-accent-primary"
                >
                  <option value="Senior Backend Engineer">Senior Backend Engineer</option>
                  <option value="Python Developer">Python Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {pdfUrl && (
            <a href={pdfUrl} download className="inline-block">
              <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                PDF
              </Button>
            </a>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 p-4 lg:p-6 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-text-muted">
            <p>Loading candidate resume...</p>
          </div>
        ) : (
          <ImprovementWorkspace
            resume={activeResume}
            targetRole={targetRole}
            onUpdateResume={setActiveResume}
          />
        )}
      </div>
    </div>
  );
}

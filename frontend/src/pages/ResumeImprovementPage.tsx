import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, User, Sparkles } from 'lucide-react';
import { ImprovementWorkspace } from '@/components/improvement/ImprovementWorkspace';
import { useResumeStore } from '@/stores/useResumeStore';
import { useJobStore } from '@/stores/useJobStore';
import { resumeService } from '@/services/resume.service';
import { jobService } from '@/services/job.service';
import { matchingApi } from '@/api/matching.api';
import { ROUTES } from '@/constants/routes';
import type { Resume } from '@/types/resume.types';

export function ResumeImprovementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: pathId } = useParams<{ id?: string }>();

  const resumes = useResumeStore((state) => state.resumes);
  const setResumes = useResumeStore((state) => state.setResumes);
  const selectedResumeId = useResumeStore((state) => state.selectedResumeId);
  const selectResume = useResumeStore((state) => state.selectResume);

  const jobs = useJobStore((state) => state.jobs);
  const setJobs = useJobStore((state) => state.setJobs);

  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [isLoading, setIsLoading] = useState(true);
  const [matchedRoles, setMatchedRoles] = useState<string[]>([]);

  // Fetch jobs from DB to populate target options dynamically
  useEffect(() => {
    if (jobs.length === 0) {
      jobService.getAll().then(setJobs);
    }
  }, [jobs.length, setJobs]);

  // AI Vector Matching: Query ChromaDB & SentenceTransformer for roles semantically relevant to this resume
  useEffect(() => {
    if (!activeResume) return;

    const resumeText = activeResume.raw_text || Object.values(activeResume.sections || {}).join('\n\n');
    if (!resumeText.trim()) return;

    matchingApi.getTopMatchesForResume(resumeText, 25)
      .then((matches) => {
        if (matches && matches.length > 0) {
          const titles = matches
            .map((m: any) => (m.title || m.role || '').trim())
            .filter((t: string) => t && t.toLowerCase() !== (activeResume.role || '').toLowerCase());
          const uniqueTitles = Array.from(new Set(titles));
          setMatchedRoles(uniqueTitles);
        }
      })
      .catch((err) => {
        console.warn('AI matching for target dropdown failed, falling back to skill overlap:', err);
      });
  }, [activeResume?.id, activeResume?.raw_text]);

  // Fallback: Filter database jobs that share at least one skill or domain keyword with the candidate
  const fallbackRelevantRoles = useMemo(() => {
    if (!activeResume) return [];
    const candSkills = (activeResume.skills || []).map((s) => s.toLowerCase());
    const candRole = (activeResume.role || '').toLowerCase();

    return jobs
      .filter((j) => {
        const req = (j.requiredSkills || []).map((s) => s.toLowerCase());
        const hasSkillOverlap = req.some((s) =>
          candSkills.some((cs) => cs.includes(s) || s.includes(cs))
        );
        const titleLower = (j.role || j.title || '').toLowerCase();
        const hasTitleOverlap = candRole && (titleLower.includes(candRole) || candRole.includes(titleLower));
        return hasSkillOverlap || hasTitleOverlap;
      })
      .map((j) => (j.role || j.title || '').trim())
      .filter(Boolean);
  }, [jobs, activeResume]);

  // AI-filtered relevant roles (excluding unrelated domains like Accountant/Teacher for a Tech resume)
  const displayedRoles = useMemo(() => {
    const list = matchedRoles.length > 0 ? matchedRoles : Array.from(new Set(fallbackRelevantRoles));
    const currentLower = (activeResume?.role || '').toLowerCase();
    return list.filter((r) => r.toLowerCase() !== currentLower);
  }, [matchedRoles, fallbackRelevantRoles, activeResume?.role]);

  // Sync target role to candidate's detected role if available
  useEffect(() => {
    if (activeResume?.role) {
      setTargetRole(activeResume.role);
    } else if (displayedRoles.length > 0) {
      setTargetRole(displayedRoles[0]);
    }
  }, [activeResume?.id, activeResume?.role, displayedRoles]);

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
                <Sparkles size={13} className="text-accent-primary" />
                <span>Target:</span>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-bg-elevated border border-border-default rounded px-2 py-0.5 text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-accent-primary"
                >
                  {activeResume?.role && (
                    <option value={activeResume.role}>{activeResume.role} (Current)</option>
                  )}
                  {displayedRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                  {displayedRoles.length === 0 && !activeResume?.role && (
                    <option value="Software Engineer">Software Engineer</option>
                  )}
                </select>
              </div>
            </div>
          </div>
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

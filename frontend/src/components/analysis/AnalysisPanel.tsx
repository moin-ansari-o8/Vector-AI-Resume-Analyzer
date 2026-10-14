import { Dropdown } from '../shared/Dropdown';
import { useResumeStore } from '@/stores/useResumeStore';
import { useJobStore } from '@/stores/useJobStore';

interface AnalysisPanelProps {
  selectedResumeId: string | null;
  selectedJobId: string | null;
  onResumeChange: (id: string) => void;
  onJobChange: (id: string) => void;
}

export function AnalysisPanel({
  selectedResumeId,
  selectedJobId,
  onResumeChange,
  onJobChange
}: AnalysisPanelProps) {
  const resumes = useResumeStore((state) => state.resumes);
  const jobs = useJobStore((state) => state.jobs);

  const resumeOptions = resumes.map((r) => ({
    label: `${r.candidateName} (${r.role || 'No Role'})`,
    value: r.id
  }));

  const jobOptions = jobs.map((j) => ({
    label: `${j.role} at ${j.company}`,
    value: j.id
  }));

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-bg-secondary border border-border-default rounded-lg">
      <div className="flex-1">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Select Candidate
        </label>
        <Dropdown
          options={resumeOptions}
          value={selectedResumeId || undefined}
          onChange={onResumeChange}
          placeholder="Select a candidate..."
          className="w-full"
        />
      </div>

      <div className="flex-1">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Select Target Role
        </label>
        <Dropdown
          options={jobOptions}
          value={selectedJobId || undefined}
          onChange={onJobChange}
          placeholder="Select a target job..."
          className="w-full"
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, User, Search } from 'lucide-react';
import { jobService } from '@/services/job.service';
import { useJobMatches } from '@/hooks/useMatching';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { MatchRing } from '@/components/shared/MatchRing';
import { Button } from '@/components/shared/Button';
import { ROUTES } from '@/constants/routes';
import type { Job } from '@/types/job.types';
import type { AnalysisMatch } from '@/types/analysis.types';

export function MatchResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  
  const { data: matches, isLoading } = useJobMatches(id ?? null);

  useEffect(() => {
    if (id) {
      jobService.getById(id).then(setJob).catch(console.error);
    }
  }, [id]);

  const columns: Column<AnalysisMatch>[] = [
    {
      key: 'score',
      header: 'Match Score',
      width: '100px',
      sortable: true,
      sortFn: (a, b) => a.score - b.score,
      render: (row) => <MatchRing score={row.score} size={48} strokeWidth={3.5} />,
    },
    {
      key: 'candidate',
      header: 'Candidate',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-bg-hover flex items-center justify-center shrink-0">
            <User size={16} className="text-text-muted" />
          </div>
          <span className="font-medium text-text-primary">{row.candidateName || row.candidateId}</span>
        </div>
      ),
    },
    {
      key: 'matched',
      header: 'Key Strengths',
      render: (row) => (
        <p className="text-sm text-text-secondary truncate max-w-xs">
          {row.matchedSkills.join(', ')}
        </p>
      ),
    },
    {
      key: 'missing',
      header: 'Missing Skills',
      render: (row) => (
        <p className="text-sm text-accent-warning truncate max-w-xs">
          {row.missingSkills.join(', ') || 'None critical'}
        </p>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <Button 
          variant="secondary" 
          size="sm"
          icon={<Search size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(ROUTES.ANALYSIS); // Assuming we can pass state/query params in real app
          }}
        >
          Deep Dive
        </Button>
      ),
    }
  ];

  if (!job && isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-text-muted">Loading match results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 -m-4 sm:-m-8 p-4 sm:p-8 bg-bg-primary min-h-[calc(100vh-4rem)]">
      {/* Header bar */}
      <div className="flex items-center gap-4 pb-6 border-b border-border-default">
        <button
          onClick={() => navigate(ROUTES.JOBS)}
          className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors duration-fast"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{job?.role}</h1>
          <p className="text-sm text-text-secondary mt-0.5">{job?.company} • Match Results</p>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={matches || []}
          emptyMessage="No candidates matched this job yet."
          onRowClick={(row) => navigate(ROUTES.RESUME_DETAIL(row.candidateId))}
        />
      </div>
    </div>
  );
}

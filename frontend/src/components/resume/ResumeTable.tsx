import { useNavigate } from 'react-router';
import { Sparkles, Trash2, ExternalLink } from 'lucide-react';
import { DataTable, type Column } from '../shared/DataTable';
import { ROUTES } from '@/constants/routes';
import { resumeService } from '@/services/resume.service';
import { useToast } from '@/components/shared/Toast';
import type { Resume } from '@/types/resume.types';

interface ResumeTableProps {
  resumes: Resume[];
}

export function ResumeTable({ resumes }: ResumeTableProps) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeService.delete(id);
        addToast('Resume deleted successfully', 'info');
      } catch (err) {
        addToast('Failed to delete resume', 'error');
      }
    }
  };

  const columns: Column<Resume>[] = [
    {
      key: 'candidateName',
      header: 'Candidate Name',
      sortable: true,
      sortFn: (a, b) => a.candidateName.localeCompare(b.candidateName),
      render: (row) => (
        <div>
          <span className="font-medium text-text-primary block">{row.candidateName}</span>
          <span className="text-[11px] text-text-muted font-mono">{row.id}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      sortFn: (a, b) => (a.role || '').localeCompare(b.role || ''),
      render: (row) => <span className="text-text-secondary">{row.role || '—'}</span>,
    },
    {
      key: 'experience',
      header: 'Experience',
      sortable: true,
      sortFn: (a, b) => (a.experienceYears || 0) - (b.experienceYears || 0),
      render: (row) => (
        <span className="text-text-secondary">
          {row.experienceYears ? `${row.experienceYears} years` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const colors = {
          ready: 'text-accent-positive bg-accent-positive/10',
          parsing: 'text-accent-warning bg-accent-warning/10',
          error: 'text-accent-negative bg-accent-negative/10',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${colors[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'uploadedAt',
      header: 'Uploaded At',
      sortable: true,
      sortFn: (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
      render: (row) => (
        <span className="text-text-muted text-xs">
          {new Date(row.uploadedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`${ROUTES.IMPROVEMENT}?resumeId=${row.id}`)}
            className="p-1.5 rounded text-accent-primary hover:bg-accent-primary/10 transition-colors flex items-center gap-1 text-xs font-medium"
            title="Open in Improvement Studio"
          >
            <Sparkles size={14} /> Improve
          </button>
          <button
            onClick={(e) => handleDelete(e, row.id)}
            className="p-1.5 rounded text-text-muted hover:text-accent-negative hover:bg-accent-negative/10 transition-colors"
            title="Delete resume"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-bg-secondary rounded-lg border border-border-default overflow-hidden">
      <DataTable
        columns={columns}
        data={resumes}
        onRowClick={(row) => navigate(ROUTES.RESUME_DETAIL(row.id))}
      />
    </div>
  );
}

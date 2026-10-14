import { useNavigate } from 'react-router';
import { DataTable, type Column } from '../shared/DataTable';
import { ROUTES } from '@/constants/routes';
import type { Resume } from '@/types/resume.types';

interface ResumeTableProps {
  resumes: Resume[];
}

export function ResumeTable({ resumes }: ResumeTableProps) {
  const navigate = useNavigate();

  const columns: Column<Resume>[] = [
    {
      key: 'candidateName',
      header: 'Candidate Name',
      sortable: true,
      sortFn: (a, b) => a.candidateName.localeCompare(b.candidateName),
      render: (row) => <span className="font-medium text-text-primary">{row.candidateName}</span>,
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
          <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${colors[row.status]}`}>
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
        <span className="text-text-muted text-sm">
          {new Date(row.uploadedAt).toLocaleDateString()}
        </span>
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

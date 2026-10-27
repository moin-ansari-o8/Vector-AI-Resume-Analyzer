import { useNavigate } from 'react-router';
import { DataTable, type Column } from '../shared/DataTable';
import { SkillTag } from '../shared/SkillTag';
import { ROUTES } from '@/constants/routes';
import type { Job } from '@/types/job.types';

interface JobTableProps {
  jobs: Job[];
  emptyMessage?: string;
}

export function JobTable({ jobs, emptyMessage }: JobTableProps) {
  const navigate = useNavigate();

  const columns: Column<Job>[] = [
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      sortFn: (a, b) => a.role.localeCompare(b.role),
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.role}</p>
          <p className="text-xs text-text-secondary mt-0.5">{row.company}</p>
        </div>
      ),
    },
    {
      key: 'skills',
      header: 'Required Skills',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5 max-w-[280px]">
          {row.requiredSkills.slice(0, 3).map((skill) => (
            <SkillTag key={skill} label={skill} variant="neutral" />
          ))}
          {row.requiredSkills.length > 3 && (
            <span className="text-xs text-text-muted self-center ml-1">+{row.requiredSkills.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'matches',
      header: 'Matches',
      sortable: true,
      sortFn: (a, b) => (b.matchesCount || 0) - (a.matchesCount || 0),
      render: (row) => (
        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-bg-hover text-text-primary text-xs font-medium min-w-[2rem]">
          {row.matchesCount || 0}
        </span>
      ),
    },
    {
      key: 'addedAt',
      header: 'Added Date',
      sortable: true,
      sortFn: (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
      render: (row) => (
        <span className="text-text-muted text-sm">
          {new Date(row.addedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-bg-secondary rounded-lg border border-border-default overflow-hidden">
      <DataTable
        columns={columns}
        data={jobs}
        emptyMessage={emptyMessage}
        onRowClick={(row) => navigate(ROUTES.MATCH_RESULTS(row.id))}
      />
    </div>
  );
}

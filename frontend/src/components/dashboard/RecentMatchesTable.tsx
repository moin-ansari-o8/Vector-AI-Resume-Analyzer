import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../shared/DataTable';
import { MatchRing } from '../shared/MatchRing';
import { matchingService } from '@/services/matching.service';
import type { AnalysisMatch } from '@/types/analysis.types';

export function RecentMatchesTable() {
  const [matches, setMatches] = useState<AnalysisMatch[]>([]);

  useEffect(() => {
    matchingService.getRecentMatches().then(setMatches);
  }, []);

  const columns: Column<AnalysisMatch>[] = [
    {
      key: 'score',
      header: 'Score',
      width: '80px',
      sortable: true,
      sortFn: (a, b) => a.score - b.score,
      render: (row) => <MatchRing score={row.score} size={40} strokeWidth={3} />,
    },
    {
      key: 'candidate',
      header: 'Candidate',
      render: (row) => (
        <span className="font-medium">{row.candidateId}</span>
      ),
    },
    {
      key: 'job',
      header: 'Job Title',
      render: (row) => <span className="text-text-secondary">{row.jobId}</span>,
    },
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      sortFn: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      render: (row) => (
        <span className="text-text-muted text-xs">
          {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    }
  ];

  return (
    <div className="bg-bg-secondary rounded-lg border border-border-default overflow-hidden">
      <div className="px-6 py-4 border-b border-border-default flex justify-between items-center">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Recent Matches</h3>
      </div>
      {matches.length > 0 ? (
        <DataTable 
          columns={columns} 
          data={matches} 
          onRowClick={(row) => console.log('Clicked match', row)}
        />
      ) : (
        <div className="p-8 text-center text-text-muted text-sm">
          No matches run yet. Go to Analysis Studio to run a match!
        </div>
      )}
    </div>
  );
}

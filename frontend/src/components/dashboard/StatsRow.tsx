import { useEffect, useState } from 'react';
import { StatReadout } from '../shared/StatReadout';
import { useResumeStore } from '@/stores/useResumeStore';
import { useJobStore } from '@/stores/useJobStore';
import { matchingService } from '@/services/matching.service';
import type { AnalysisMatch } from '@/types/analysis.types';

export function StatsRow() {
  const resumes = useResumeStore(state => state.resumes);
  const jobs = useJobStore(state => state.jobs);
  const [matches, setMatches] = useState<AnalysisMatch[]>([]);

  useEffect(() => {
    matchingService.getRecentMatches().then(setMatches);
  }, []);

  const highMatches = matches.filter(m => m.score > 80).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatReadout 
        label="Total Resumes" 
        value={resumes.length.toString()} 
        change={`${resumes.length > 0 ? '+' : ''}${resumes.length} total`} 
      />
      <StatReadout 
        label="Active Jobs" 
        value={jobs.length.toString()} 
        change={`${jobs.length > 0 ? '+' : ''}${jobs.length} total`} 
      />
      <StatReadout 
        label="Matches >80%" 
        value={highMatches.toString()} 
        change={`${matches.length} total runs`} 
      />
      <StatReadout 
        label="Avg Processing Time" 
        value="1.2s" 
        change="Optimized" 
      />
    </div>
  );
}

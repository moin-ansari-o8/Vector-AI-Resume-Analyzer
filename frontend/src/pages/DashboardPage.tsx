import { useEffect } from 'react';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { RecentMatchesTable } from '@/components/dashboard/RecentMatchesTable';
import { SignalFeed } from '@/components/dashboard/SignalFeed';
import { useResumeStore } from '@/stores/useResumeStore';
import { useJobStore } from '@/stores/useJobStore';
import { resumeService } from '@/services/resume.service';
import { jobService } from '@/services/job.service';

export function DashboardPage() {
  const setResumes = useResumeStore(state => state.setResumes);
  const setJobs = useJobStore(state => state.setJobs);

  useEffect(() => {
    resumeService.getAll().then(setResumes);
    jobService.getAll().then(setJobs);
  }, [setResumes, setJobs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Overview</h1>
      </div>
      
      <StatsRow />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentMatchesTable />
        </div>
        <div className="xl:col-span-1">
          <SignalFeed />
        </div>
      </div>
    </div>
  );
}

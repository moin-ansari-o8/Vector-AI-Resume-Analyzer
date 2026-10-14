import { useEffect } from 'react';
import { JobInputForm } from '@/components/job/JobInputForm';
import { JobTable } from '@/components/job/JobTable';
import { jobService } from '@/services/job.service';
import { useJobStore } from '@/stores/useJobStore';

export function JobsPage() {
  const jobs = useJobStore((state) => state.jobs);
  const setJobs = useJobStore((state) => state.setJobs);

  useEffect(() => {
    // Initial fetch
    jobService.getAll().then(setJobs);
  }, [setJobs]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Jobs & Roles</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <JobInputForm />
        </div>
        
        <div className="lg:col-span-2">
          <JobTable jobs={jobs} />
        </div>
      </div>
    </div>
  );
}

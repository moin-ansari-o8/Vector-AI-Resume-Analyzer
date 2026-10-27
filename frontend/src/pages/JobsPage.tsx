import { useEffect, useState, useMemo } from 'react';
import { JobInputForm } from '@/components/job/JobInputForm';
import { JobTable } from '@/components/job/JobTable';
import { Search } from '@/components/shared/Search';
import { jobService } from '@/services/job.service';
import { useJobStore } from '@/stores/useJobStore';
import { Briefcase } from 'lucide-react';

export function JobsPage() {
  const jobs = useJobStore((state) => state.jobs);
  const setJobs = useJobStore((state) => state.setJobs);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initial fetch
    jobService.getAll().then(setJobs);
  }, [setJobs]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter((job) => {
      const matchRole = (job.role || '').toLowerCase().includes(q);
      const matchTitle = (job.title || '').toLowerCase().includes(q);
      const matchCompany = (job.company || '').toLowerCase().includes(q);
      const matchDesc = (job.description || '').toLowerCase().includes(q);
      const matchSkills = (job.requiredSkills || []).some((s) =>
        s.toLowerCase().includes(q)
      );

      return matchRole || matchTitle || matchCompany || matchDesc || matchSkills;
    });
  }, [jobs, searchQuery]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Jobs & Roles</h1>
          <p className="text-sm text-text-muted mt-1">
            Search, filter, and manage job requisitions saved in the database.
          </p>
        </div>

        {/* Search Box on Job Page */}
        <div className="w-full sm:w-80">
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by role, skill, company..."
            className="w-full bg-bg-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <JobInputForm />
        </div>
        
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-text-muted px-1">
            <span className="flex items-center gap-1.5">
              <Briefcase size={13} className="text-text-muted" />
              Showing <strong className="text-text-primary font-semibold">{filteredJobs.length}</strong> of {jobs.length} jobs
              {searchQuery && (
                <span className="text-accent-primary">matching &ldquo;{searchQuery}&rdquo;</span>
              )}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-accent-primary hover:underline font-medium text-xs cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>

          <JobTable
            jobs={filteredJobs}
            emptyMessage={
              searchQuery
                ? `No jobs match "${searchQuery}". Try searching for another role or skill.`
                : 'No job roles found in database.'
            }
          />
        </div>
      </div>
    </div>
  );
}

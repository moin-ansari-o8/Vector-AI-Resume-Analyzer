import { create } from 'zustand';
import type { Job } from '@/types/job.types';

interface JobStore {
  jobs: Job[];
  selectedJobId: string | null;
  setJobs: (jobs: Job[]) => void;
  selectJob: (id: string | null) => void;
  addJob: (job: Job) => void;
}

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  selectedJobId: null,
  setJobs: (jobs) => set({ jobs }),
  selectJob: (id) => set({ selectedJobId: id }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
}));

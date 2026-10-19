import { APP_CONFIG } from '@/config/app.config';
import { jobApi } from '@/api/job.api';
import { mockJobs } from '@/mocks/jobs.mock';
import type { Job } from '@/types/job.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getLocalJobs = (): Job[] => {
  const saved = localStorage.getItem('sessionJobs');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
};

const saveLocalJobs = (jobs: Job[]) => {
  try {
    localStorage.setItem('sessionJobs', JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save jobs to cache:', e);
  }
};

export const jobService = {
  async getAll(): Promise<Job[]> {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(500);
      return mockJobs;
    }

    try {
      const serverJobs = await jobApi.getAll();
      if (serverJobs && serverJobs.length > 0) {
        saveLocalJobs(serverJobs);
        return serverJobs;
      }
    } catch (e) {
      console.warn('Backend jobs fetch failed, falling back to local cache:', e);
    }

    return getLocalJobs();
  },

  async getById(id: string): Promise<Job> {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(300);
      const job = mockJobs.find(j => j.id === id);
      if (!job) throw new Error('Job not found');
      return job;
    }

    try {
      const serverJob = await jobApi.getById(id);
      if (serverJob) return serverJob;
    } catch (e) {
      console.warn('Backend getById failed, checking local cache for job:', id, e);
    }

    const localJobs = getLocalJobs();
    const job = localJobs.find(j => j.id === id);
    if (!job) throw new Error('Job not found');
    return job;
  },

  async create(data: Partial<Job>): Promise<Job> {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(800);
      const mockJob: Job = {
        id: `job_mock_${Date.now()}`,
        role: data.title || data.role || 'New Job',
        title: data.title || data.role || 'New Job',
        company: data.company || 'TechCorp',
        requiredSkills: ['Python', 'Docker', 'AWS'],
        experienceRequired: 2,
        addedAt: new Date().toISOString(),
        matchesCount: 0
      };
      const currentJobs = getLocalJobs();
      saveLocalJobs([mockJob, ...currentJobs]);
      return mockJob;
    }

    const savedJob = await jobApi.create(data);
    const currentJobs = getLocalJobs();
    saveLocalJobs([savedJob, ...currentJobs.filter(j => j.id !== savedJob.id)]);
    return savedJob;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(400);
      return { success: true };
    }

    try {
      await jobApi.delete(id);
    } catch (e) {
      console.warn('Backend delete job failed:', e);
    }

    const currentJobs = getLocalJobs();
    saveLocalJobs(currentJobs.filter(j => j.id !== id));
    return { success: true };
  }
};

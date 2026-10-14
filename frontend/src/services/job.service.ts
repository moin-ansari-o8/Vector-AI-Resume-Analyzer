import { APP_CONFIG } from '@/config/app.config';
import { jobApi } from '@/api/job.api';
import { mockJobs } from '@/mocks/jobs.mock';
import type { Job } from '@/types/job.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getSessionJobs = (): Job[] => {
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

const saveSessionJobs = (jobs: Job[]) => {
  localStorage.setItem('sessionJobs', JSON.stringify(jobs));
};

export const jobService = {
  async getAll() {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(500);
      return mockJobs;
    }
    return getSessionJobs();
  },

  async getById(id: string) {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(300);
      const job = mockJobs.find(j => j.id === id);
      if (!job) throw new Error('Job not found');
      return job;
    }
    const jobs = getSessionJobs();
    const job = jobs.find(j => j.id === id);
    if (!job) throw new Error('Job not found in session');
    return job;
  },

  async create(data: Partial<Job>) {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(800);
      return { success: true };
    }
    const result = await jobApi.create(data);
    
    // Add to session jobs
    const newJob: Job = {
      id: `job_real_${Date.now()}`,
      role: data.title || 'New Job',
      company: data.company || 'Unknown',
      requiredSkills: result.required_skills || [],
      experienceRequired: result.experience_required || 0,
      addedAt: new Date().toISOString(),
      matchesCount: 0
    };
    
    const currentJobs = getSessionJobs();
    saveSessionJobs([newJob, ...currentJobs]);
    return newJob;
  },

  async delete(id: string) {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(400);
      return { success: true };
    }
    const currentJobs = getSessionJobs();
    saveSessionJobs(currentJobs.filter(j => j.id !== id));
    return { success: true };
  }
};

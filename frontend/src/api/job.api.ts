import { apiClient } from './client';
import type { Job } from '@/types/job.types';

export const jobApi = {
  getAll: () => apiClient.get<Job[]>('/jobs/').then(res => res.data),

  getById: (id: string) => apiClient.get<Job>(`/jobs/${id}`).then(res => res.data),

  create: (data: Partial<Job>) => {
    const payload = {
      title: data.title || data.role || '',
      role: data.role || data.title || '',
      company: data.company || '',
      location: data.location || 'Remote',
      description: data.description || '',
      required_skills: data.requiredSkills,
      experience_required: data.experienceRequired
    };
    return apiClient.post<Job>('/jobs/', payload).then(res => res.data);
  },

  delete: (id: string) => apiClient.delete<{ message: string; id: string }>(`/jobs/${id}`).then(res => res.data),
};

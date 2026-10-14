import { apiClient } from './client';
import type { Job } from '@/types/job.types';

export const jobApi = {
  // Local only
  getAll: () => Promise.resolve([]),
  getById: (id: string) => Promise.reject(new Error("Not implemented on backend")),
  
  create: (data: Partial<Job>) => {
    // According to backend spec: { title, company, location, description }
    const payload = {
      title: data.role || (data as any).title || '',
      company: data.company || '',
      location: (data as any).location || '',
      description: (data as any).description || ''
    };
    return apiClient.post<any>('/jobs/process', payload).then(res => res.data);
  },
  
  // Local only
  delete: (id: string) => Promise.resolve({ success: true }),
};

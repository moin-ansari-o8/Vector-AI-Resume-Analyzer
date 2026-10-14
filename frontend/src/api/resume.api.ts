import { apiClient } from './client';
import type { Resume } from '@/types/resume.types';

export const resumeApi = {
  // Local only - no backend GET
  getAll: () => Promise.resolve([]),
  getById: (id: string) => Promise.reject(new Error("Not implemented on backend")),
  
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<any>('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },
  
  // Local only
  delete: (id: string) => Promise.resolve({ success: true }),
};

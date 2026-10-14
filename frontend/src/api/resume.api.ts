import { apiClient } from './client';
import { APP_CONFIG } from '@/config/app.config';
import type { Resume } from '@/types/resume.types';

export const resumeApi = {
  getAll: () => apiClient.get<Resume[]>('/resume/').then(res => res.data),
  
  getById: (id: string) => apiClient.get<Resume>(`/resume/${id}`).then(res => res.data),
  
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<any>('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },
  
  create: (data: Partial<Resume>) =>
    apiClient.post<Resume>('/resume/', data).then(res => res.data),

  update: (id: string, data: Partial<Resume>) =>
    apiClient.put<Resume>(`/resume/${id}`, data).then(res => res.data),
    
  delete: (id: string) => apiClient.delete<any>(`/resume/${id}`).then(res => res.data),

  getPdfUrl: (id: string) => `${APP_CONFIG.API_BASE_URL}/resume/${id}/pdf`,
};


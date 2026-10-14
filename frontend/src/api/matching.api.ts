import { apiClient } from './client';
import type { AnalysisMatch } from '@/types/analysis.types';

export const matchingApi = {
  // Backend only supports matching a given resume text to the jobs in its Vector DB
  getTopMatchesForResume: (resumeText: string, top_k = 10) => 
    apiClient.post<{ matches: any[] }>(`/matching/resume-jobs`, { resume_text: resumeText, top_k })
      .then(res => res.data.matches),
      
  // Not implemented on backend (backend does not store resumes in vector DB to match against jobs)
  getTopMatchesForJob: (jobId: string, limit = 10) => 
    Promise.reject(new Error("Backend does not support matching jobs to resumes yet.")),
    
  // Not implemented on backend
  getDetailedMatch: (resumeId: string, jobId: string) =>
    Promise.reject(new Error("Not implemented on backend")),
};

import { apiClient } from './client';
import type { AnalysisMatch } from '@/types/analysis.types';

export const matchingApi = {
  getRecentMatches: () =>
    apiClient.get<AnalysisMatch[]>('/matching/recent').then(res => res.data),

  recordMatch: (match: Partial<AnalysisMatch>) =>
    apiClient.post<AnalysisMatch>('/matching/record', match).then(res => res.data),

  getTopMatchesForJob: (jobId: string) =>
    apiClient.get<AnalysisMatch[]>(`/matching/job/${jobId}`).then(res => res.data),

  getTopMatchesForResume: (resumeText: string, top_k = 10) =>
    apiClient.post<{ matches: any[] }>(`/matching/resume-jobs`, { resume_text: resumeText, top_k })
      .then(res => res.data.matches),
};

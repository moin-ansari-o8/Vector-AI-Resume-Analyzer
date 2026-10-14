import { apiClient } from './client';

export const recommendationApi = {
  getResumeRecommendations: (resumeText: string, resumeSkills: string[], resumeExperience: string, topK: number = 5) =>
    apiClient.post<any>('/recommendations/resume', {
      resume_text: resumeText,
      resume_skills: resumeSkills,
      resume_experience: resumeExperience,
      top_k: topK
    }).then(res => res.data),
};

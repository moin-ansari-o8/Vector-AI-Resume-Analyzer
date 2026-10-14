import { apiClient } from './client';

export const explainabilityApi = {
  explainJobMatch: (candidateSkills: string[], candidateExperience: string, job: any) =>
    apiClient.post<any>('/explain/job', {
      candidate_skills: candidateSkills,
      candidate_experience: candidateExperience,
      job
    }).then(res => res.data),
};

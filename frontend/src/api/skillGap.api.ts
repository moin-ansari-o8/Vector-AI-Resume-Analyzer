import { apiClient } from './client';

export const skillGapApi = {
  analyze: (candidateSkills: string[], requiredSkills: string[]) =>
    apiClient.post<any>('/skill-gap/analyze', {
      candidate_skills: candidateSkills,
      required_skills: requiredSkills
    }).then(res => res.data),
};

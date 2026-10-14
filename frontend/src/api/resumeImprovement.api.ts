import { apiClient } from './client';

export const resumeImprovementApi = {
  improve: (resumeText: string, jobTitle: string, jobDescription: string, candidateSkills: string[], missingSkills: string[]) =>
    apiClient.post<any>('/resume/improve', {
      resume_text: resumeText,
      job_title: jobTitle,
      job_description: jobDescription,
      candidate_skills: candidateSkills,
      missing_skills: missingSkills
    }).then(res => res.data),
};

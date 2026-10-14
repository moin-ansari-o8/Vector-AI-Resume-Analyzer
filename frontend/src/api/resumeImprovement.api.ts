import { apiClient } from './client';

export interface ImprovementSuggestion {
  section: string;
  originalText: string;
  suggestedText: string;
  reasoning: string;
}

export interface ImprovementResponse {
  job_title: string;
  suggestions: ImprovementSuggestion[];
  summary_guidance?: string;
}

export const resumeImprovementApi = {
  improve: (params: {
    resumeText: string;
    jobTitle?: string;
    jobDescription?: string;
    candidateSkills?: string[];
    missingSkills?: string[];
    sections?: Record<string, string>;
  }): Promise<ImprovementResponse> =>
    apiClient.post<ImprovementResponse>('/resume/improve', {
      resume_text: params.resumeText,
      job_title: params.jobTitle || 'Software Engineer',
      job_description: params.jobDescription || '',
      candidate_skills: params.candidateSkills || [],
      missing_skills: params.missingSkills || [],
      sections: params.sections,
    }).then(res => res.data),
};

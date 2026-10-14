import { apiClient } from './client';

export const chatApi = {
  askQuestion: (sessionId: string, question: string, resumeText: string, resumeSkills: string[], resumeExperience: string) =>
    apiClient.post<any>('/chat/career', {
      session_id: sessionId,
      question,
      resume_text: resumeText,
      resume_skills: resumeSkills,
      resume_experience: resumeExperience
    }).then(res => res.data),

  clearSession: (sessionId: string) =>
    apiClient.delete<any>(`/chat/career/${sessionId}`).then(res => res.data),
};

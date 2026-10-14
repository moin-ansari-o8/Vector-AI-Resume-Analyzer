import { apiClient } from './client';

export const chatApi = {
  askQuestion: (
    sessionId: string,
    question: string,
    resumeText: string,
    resumeSkills: string[] = [],
    resumeExperience: string | number = 0,
    targetJob?: string
  ) =>
    apiClient.post<any>('/chat/career', {
      session_id: sessionId,
      question,
      resume_text: resumeText,
      resume_skills: resumeSkills,
      resume_experience: parseFloat(String(resumeExperience)) || 0,
      target_job: targetJob,
    }).then(res => res.data),

  clearSession: (sessionId: string) =>
    apiClient.delete<any>(`/chat/career/${sessionId}`).then(res => res.data),

  getStatus: () =>
    apiClient.get<any>('/chat/status').then(res => res.data),

  updateConfig: (geminiApiKey: string) =>
    apiClient.post<any>('/chat/config', { gemini_api_key: geminiApiKey }).then(res => res.data),
};

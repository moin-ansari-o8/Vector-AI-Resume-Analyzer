import { APP_CONFIG } from '@/config/app.config';
import type { Message } from '@/types/chat.types';
import { chatApi } from '@/api/chat.api';
import { useResumeStore } from '@/stores/useResumeStore';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let currentSessionId = `sess_${Date.now()}_${Math.floor(Math.random()*1000)}`;

export const chatService = {
  async sendMessage(messages: Message[], context?: Record<string, any>) {
    const lastMessage = messages[messages.length - 1];
    
    if (APP_CONFIG.USE_MOCKS) {
      await delay(1200);
      const lowerText = lastMessage.content.toLowerCase();
      let reply = "I can help you optimize this resume for your target roles. What section would you like to review?";
      
      if (lowerText.includes('experience') || lowerText.includes('line')) {
        reply = "Looking at your Experience section: In bullet #1, try quantifying your impact: 'Architected high-throughput services processing 10k+ RPS, reducing latency by 35%'.";
      } else if (lowerText.includes('gap') || lowerText.includes('missing') || lowerText.includes('add')) {
        reply = "To address missing requirements, add a 'Cloud & DevOps' category under Technical Skills and cite a hands-on project demonstrating containerization and cloud deployments.";
      } else if (lowerText.includes('summary')) {
        reply = "Recommended Summary Rewrite:\n'Results-driven Software Engineer with proven expertise in building scalable distributed systems and APIs. Demonstrated success delivering resilient production services with 99.9% uptime.'";
      }
      
      return {
        id: `ai_${Date.now()}`,
        role: 'assistant' as const,
        content: reply,
        timestamp: new Date().toISOString(),
      };
    }
    
    // Resolve resume context if not explicitly provided
    let resumeText = context?.resumeText;
    let resumeSkills = context?.resumeSkills || [];
    let resumeExperience = context?.resumeExperience || 0;
    let targetJob = context?.targetJob;

    if (!resumeText) {
      const activeResume = useResumeStore.getState().getActiveResume();
      if (activeResume) {
        resumeText = activeResume.raw_text || Object.values(activeResume.sections || {}).join('\n\n');
        resumeSkills = activeResume.skills || [];
        resumeExperience = activeResume.experienceYears || 0;
      }
    }
    
    if (!resumeText) {
      resumeText = "General candidate profile seeking technical resume feedback.";
    }
    
    try {
      const response = await chatApi.askQuestion(
         currentSessionId,
         lastMessage.content,
         resumeText,
         resumeSkills,
         resumeExperience,
         targetJob
      );
      
      return {
        id: `ai_${Date.now()}`,
        role: 'assistant' as const,
        content: response.answer || response.message || "I reviewed your resume. How else can I assist with your improvements?",
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      console.error('Chat error from server, falling back to local analysis:', err);
      return {
        id: `ai_${Date.now()}`,
        role: 'assistant' as const,
        content: `I'm having trouble connecting to the AI service right now.\n\n` +
          `In the meantime, you can:\n` +
          `• Click **✨ Show Suggestions** on the Improvement page for AI-powered suggestions\n` +
          `• Try again in a moment — the AI service may be temporarily busy\n` +
          `• Check the **Settings** page to verify your Gemini API key is configured`,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  clearSession() {
    if (!APP_CONFIG.USE_MOCKS) {
      chatApi.clearSession(currentSessionId).catch(console.error);
    }
    currentSessionId = `sess_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  }
};

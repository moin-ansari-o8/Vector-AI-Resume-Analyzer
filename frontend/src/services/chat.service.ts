import { APP_CONFIG } from '@/config/app.config';
import type { Message } from '@/types/chat.types';
import { chatApi } from '@/api/chat.api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple session manager for the lifetime of the tab
let currentSessionId = `sess_${Date.now()}_${Math.floor(Math.random()*1000)}`;

export const chatService = {
  async sendMessage(messages: Message[], context?: Record<string, any>) {
    const lastMessage = messages[messages.length - 1];
    
    if (APP_CONFIG.USE_MOCKS) {
      await delay(1500); // Simulate AI response time
      
      const lowerText = lastMessage.content.toLowerCase();
      let reply = "I can help you analyze this resume. What specific aspects would you like to know about?";
      
      if (lowerText.includes('experience')) {
        reply = "Based on the resume, the candidate has exactly 6 years of experience, primarily focused on backend engineering with Python and scalable microservices.";
      } else if (lowerText.includes('gap') || lowerText.includes('missing')) {
        reply = "The primary gap is direct experience with AWS. However, they have extensive knowledge of Docker and Kubernetes which should translate well to ECS/EKS.";
      } else if (lowerText.includes('culture') || lowerText.includes('soft')) {
        reply = "While resumes are poor indicators of culture fit, the candidate explicitly mentions mentoring junior engineers, which demonstrates leadership and communication skills.";
      }
      
      return {
        id: `ai_${Date.now()}`,
        role: 'assistant' as const,
        content: reply,
        timestamp: new Date().toISOString(),
      };
    }
    
    // Real API Call
    if (!context || !context.resumeText) {
       throw new Error("Resume context is missing. Cannot ask AI.");
    }
    
    const response = await chatApi.askQuestion(
       currentSessionId,
       lastMessage.content,
       context.resumeText,
       context.resumeSkills || [],
       context.resumeExperience || "0"
    );
    
    return {
      id: `ai_${Date.now()}`,
      role: 'assistant' as const,
      content: response.answer || response.message || String(response),
      timestamp: new Date().toISOString()
    };
  },
  
  clearSession() {
    if (!APP_CONFIG.USE_MOCKS) {
      chatApi.clearSession(currentSessionId).catch(console.error);
    }
    currentSessionId = `sess_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  }
};


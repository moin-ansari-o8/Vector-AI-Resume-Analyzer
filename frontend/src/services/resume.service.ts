import { APP_CONFIG } from '@/config/app.config';
import { resumeApi } from '@/api/resume.api';
import { mockResumes } from '@/mocks/resumes.mock';
import type { Resume } from '@/types/resume.types';

// Helper to simulate network delay for mocks
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Session-level storage for real backend mode (since backend is stateless for resumes)
const getSessionResumes = (): Resume[] => {
  const saved = localStorage.getItem('sessionResumes');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
};

const saveSessionResumes = (resumes: Resume[]) => {
  localStorage.setItem('sessionResumes', JSON.stringify(resumes));
};

export const resumeService = {
  async getAll() {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(600);
      return mockResumes;
    }
    return getSessionResumes();
  },

  async getById(id: string) {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(400);
      const resume = mockResumes.find(r => r.id === id);
      if (!resume) throw new Error('Resume not found');
      return resume;
    }
    const resumes = getSessionResumes();
    const resume = resumes.find(r => r.id === id);
    if (!resume) throw new Error('Resume not found in session');
    return resume;
  },

  async upload(file: File) {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(1500); // Simulate upload time
      return { message: 'Upload successful', resumeId: `res_new_${Date.now()}` };
    }
    const data = await resumeApi.upload(file);
    
    // Construct a Resume object from backend response
    const newResume: Resume = {
      id: `res_real_${Date.now()}`,
      candidateName: data.structured_data?.personal_info?.name || file.name.replace('.pdf', ''),
      role: 'Candidate', // Could be extracted if backend provided it
      experienceYears: data.structured_data?.experience?.length || 0,
      uploadedAt: new Date().toISOString(),
      status: 'ready',
      skills: data.structured_data?.skills || [],
      raw_text: data.raw_text
    };
    
    const currentResumes = getSessionResumes();
    saveSessionResumes([newResume, ...currentResumes]);
    return { message: data.message || 'Upload successful', resumeId: newResume.id };
  },
  
  async delete(id: string) {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(400);
      return { success: true };
    }
    const currentResumes = getSessionResumes();
    saveSessionResumes(currentResumes.filter(r => r.id !== id));
    return { success: true };
  }
};

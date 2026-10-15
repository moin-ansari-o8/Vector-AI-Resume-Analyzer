import { APP_CONFIG } from '@/config/app.config';
import { resumeApi } from '@/api/resume.api';
import { mockResumes } from '@/mocks/resumes.mock';
import { useResumeStore } from '@/stores/useResumeStore';
import type { Resume } from '@/types/resume.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getLocalResumes = (): Resume[] => {
  try {
    const saved = localStorage.getItem('sessionResumes');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse sessionResumes:', e);
  }
  
  // Fallback to Zustand persisted storage
  try {
    const zustandStore = localStorage.getItem('vector_resume_store');
    if (zustandStore) {
      const parsed = JSON.parse(zustandStore);
      if (parsed?.state?.resumes && Array.isArray(parsed.state.resumes)) {
        return parsed.state.resumes;
      }
    }
  } catch (e) {
    // ignore
  }

  return [];
};

const saveLocalResumes = (resumes: Resume[]) => {
  try {
    localStorage.setItem('sessionResumes', JSON.stringify(resumes));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const resumeService = {
  async getAll(): Promise<Resume[]> {
    const localResumes = getLocalResumes();
    const storeResumes = useResumeStore.getState().resumes || [];

    if (APP_CONFIG.USE_MOCKS) {
      await delay(200);
      // Merge mockResumes with any user uploaded/stored resumes
      const map = new Map<string, Resume>();
      for (const r of mockResumes) map.set(r.id, r);
      for (const r of localResumes) map.set(r.id, r);
      for (const r of storeResumes) map.set(r.id, r);
      const combined = Array.from(map.values());
      useResumeStore.getState().setResumes(combined);
      saveLocalResumes(combined);
      return combined;
    }
    
    let serverResumes: Resume[] = [];
    try {
      serverResumes = await resumeApi.getAll();
    } catch (e) {
      console.warn('Backend resume fetch failed, falling back to local database/cache:', e);
    }

    // Merge server resumes and local cached resumes by ID (server takes precedence for matching IDs)
    const resumeMap = new Map<string, Resume>();
    for (const r of storeResumes) resumeMap.set(r.id, r);
    for (const r of localResumes) resumeMap.set(r.id, r);
    for (const r of serverResumes) resumeMap.set(r.id, r);

    const merged = Array.from(resumeMap.values());
    if (merged.length > 0) {
      saveLocalResumes(merged);
      useResumeStore.getState().setResumes(merged);
      return merged;
    }

    return [];
  },


  async getById(id: string): Promise<Resume> {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(300);
      const resume = mockResumes.find(r => r.id === id);
      if (!resume) throw new Error('Resume not found');
      return resume;
    }

    try {
      const serverResume = await resumeApi.getById(id);
      if (serverResume) {
        // Sync into store and local cache
        const current = getLocalResumes();
        const merged = [serverResume, ...current.filter(r => r.id !== id)];
        saveLocalResumes(merged);
        useResumeStore.getState().updateResume(id, serverResume);
        return serverResume;
      }
    } catch (e) {
      console.warn('Backend getById failed, checking local cache for:', id, e);
    }

    const localResumes = getLocalResumes();
    const found = localResumes.find(r => r.id === id);
    if (found) return found;

    // Check store as well
    const fromStore = useResumeStore.getState().resumes.find(r => r.id === id);
    if (fromStore) return fromStore;

    throw new Error('Resume not found');
  },

  async upload(file: File): Promise<{ message: string; resumeId: string }> {
    const cleanFileName = file.name.replace(/\.(pdf|png|jpe?g)$/i, '');

    if (APP_CONFIG.USE_MOCKS) {
      await delay(800);
      const mockId = `res_mock_${Date.now()}`;
      const mockResume: Resume = {
        id: mockId,
        filename: file.name,
        candidateName: cleanFileName.replace(/[-_]/g, ' '),
        role: 'Software Engineer',
        experienceYears: 3,
        uploadedAt: new Date().toISOString(),
        uploaded_at: new Date().toISOString(),
        status: 'ready',
        skills: ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'AWS'],
        raw_text: `Candidate Profile: ${cleanFileName}\nRole: Software Engineer\nExperience: 3+ years in full-stack and backend development.\nSkills: Python, FastAPI, Docker, PostgreSQL, AWS\n• Developed and deployed scalable microservices.\n• Collaborated across cross-functional teams to deliver production releases.`,
        sections: {
          personal_information: `${cleanFileName}\ncontact@example.com | San Francisco, CA`,
          experience: `Software Engineer • TechCorp (2022 - Present)\n• Spearheaded core microservices development using Python and FastAPI.\n• Optimized database query pipelines reducing latency by 30%.\n• Managed containerized deployments using Docker and AWS.`,
          skills: 'Python, FastAPI, Docker, PostgreSQL, React, AWS',
          education: 'B.S. in Computer Science • University of Technology (2018 - 2022)'
        }
      };
      const currentResumes = getLocalResumes();
      const updated = [mockResume, ...currentResumes.filter(r => r.id !== mockId)];
      saveLocalResumes(updated);
      useResumeStore.getState().addResume(mockResume);
      useResumeStore.getState().selectResume(mockResume.id);
      return { message: 'Upload successful', resumeId: mockId };
    }


    const data = await resumeApi.upload(file);
    
    // Construct rich Resume object
    const newResume: Resume = {
      id: data.id || `res_real_${Date.now()}`,
      filename: data.filename || file.name,
      candidateName: data.candidateName || data.structured_data?.personal_information || cleanFileName,
      candidate_name: data.candidateName || cleanFileName,
      role: data.role || 'Candidate',
      experienceYears: Number(data.experienceYears || data.structured_data?.experience_years || 0),
      experience_years: Number(data.experienceYears || 0),
      uploadedAt: data.uploadedAt || new Date().toISOString(),
      uploaded_at: data.uploadedAt || new Date().toISOString(),
      status: 'ready',
      skills: data.skills || data.structured_data?.skills || [],
      raw_text: data.raw_text || '',
      sections: data.sections || {},
      structured_data: data.structured_data || {},
      pdf_url: data.pdf_url || `/resume/${data.id}/pdf`,
      file_path: data.file_path
    };
    
    const currentResumes = getLocalResumes();
    const updated = [newResume, ...currentResumes.filter(r => r.id !== newResume.id)];
    saveLocalResumes(updated);
    
    // Update zustand store
    useResumeStore.getState().addResume(newResume);
    useResumeStore.getState().selectResume(newResume.id);
    
    return { 
      message: data.message || 'Resume uploaded and analyzed successfully', 
      resumeId: newResume.id 
    };
  },

  async update(id: string, updates: Partial<Resume>): Promise<Resume> {
    if (!APP_CONFIG.USE_MOCKS) {
      try {
        await resumeApi.update(id, updates);
      } catch (e) {
        console.warn('Failed to update resume on backend, updating locally:', e);
      }
    }
    
    const current = getLocalResumes();
    const updated = current.map(r => r.id === id ? { ...r, ...updates } : r);
    saveLocalResumes(updated);
    useResumeStore.getState().updateResume(id, updates);
    
    return updated.find(r => r.id === id) || updates as Resume;
  },
  
  async delete(id: string): Promise<{ success: boolean }> {
    if (!APP_CONFIG.USE_MOCKS) {
      try {
        await resumeApi.delete(id);
      } catch (e) {
        console.warn('Backend delete error:', e);
      }
    }
    
    const currentResumes = getLocalResumes();
    const filtered = currentResumes.filter(r => r.id !== id);
    saveLocalResumes(filtered);
    useResumeStore.getState().deleteResume(id);
    
    return { success: true };
  }
};

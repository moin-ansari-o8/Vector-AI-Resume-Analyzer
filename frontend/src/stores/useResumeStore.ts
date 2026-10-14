import { create } from 'zustand';
import type { Resume } from '@/types/resume.types';

interface ResumeStore {
  resumes: Resume[];
  selectedResumeId: string | null;
  setResumes: (resumes: Resume[]) => void;
  selectResume: (id: string | null) => void;
  addResume: (resume: Resume) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumes: [],
  selectedResumeId: null,
  setResumes: (resumes) => set({ resumes }),
  selectResume: (id) => set({ selectedResumeId: id }),
  addResume: (resume) => set((state) => ({ resumes: [resume, ...state.resumes] })),
}));

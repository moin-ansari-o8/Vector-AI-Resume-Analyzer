import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Resume } from '@/types/resume.types';

interface ResumeStore {
  resumes: Resume[];
  selectedResumeId: string | null;
  setResumes: (resumes: Resume[]) => void;
  selectResume: (id: string | null) => void;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  getActiveResume: () => Resume | undefined;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumes: [],
      selectedResumeId: null,
      setResumes: (resumes) => set({ 
        resumes,
        selectedResumeId: get().selectedResumeId || (resumes.length > 0 ? resumes[0].id : null)
      }),
      selectResume: (id) => set({ selectedResumeId: id }),
      addResume: (resume) =>
        set((state) => ({
          resumes: [resume, ...state.resumes.filter((r) => r.id !== resume.id)],
          selectedResumeId: resume.id,
        })),
      updateResume: (id, updates) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      deleteResume: (id) =>
        set((state) => {
          const filtered = state.resumes.filter((r) => r.id !== id);
          return {
            resumes: filtered,
            selectedResumeId:
              state.selectedResumeId === id
                ? filtered.length > 0
                  ? filtered[0].id
                  : null
                : state.selectedResumeId,
          };
        }),
      getActiveResume: () => {
        const { resumes, selectedResumeId } = get();
        if (selectedResumeId) {
          const found = resumes.find((r) => r.id === selectedResumeId);
          if (found) return found;
        }
        return resumes[0];
      },
    }),
    {
      name: 'vector_resume_store',
      partialize: (state) => ({
        resumes: state.resumes,
        selectedResumeId: state.selectedResumeId,
      }),
    }
  )
);

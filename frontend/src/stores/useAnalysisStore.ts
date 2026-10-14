import { create } from 'zustand';

interface AnalysisStore {
  isAnalyzing: boolean;
  setAnalyzing: (isAnalyzing: boolean) => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  isAnalyzing: false,
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
}));

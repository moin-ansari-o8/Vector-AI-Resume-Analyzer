export interface AnalysisMatch {
  candidateId: string;
  jobId: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  timestamp: string;
}

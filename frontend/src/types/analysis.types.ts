export interface AnalysisMatch {
  candidateId: string;
  candidateName?: string;
  candidate_id?: string;
  jobId: string;
  jobTitle?: string;
  job_id?: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  timestamp: string;
}

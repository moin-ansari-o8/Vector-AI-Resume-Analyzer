export interface Job {
  id: string;
  role: string;
  company: string;
  requiredSkills: string[];
  experienceRequired: number;
  addedAt: string;
  matchesCount: number;
}

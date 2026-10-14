export interface Job {
  id: string;
  role: string;
  title?: string;
  company: string;
  requiredSkills: string[];
  experienceRequired: number;
  addedAt: string;
  matchesCount: number;
  description?: string;
  location?: string;
}

export interface Resume {
  id: string;
  candidateName: string;
  role: string;
  experienceYears: number;
  uploadedAt: string;
  status: 'parsing' | 'ready' | 'error';
  skills: string[];
  raw_text?: string;
}

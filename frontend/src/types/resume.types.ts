export interface Resume {
  id: string;
  candidateName: string;
  candidate_name?: string;
  role: string;
  experienceYears: number;
  experience_years?: number;
  uploadedAt: string;
  uploaded_at?: string;
  status: 'parsing' | 'ready' | 'error';
  skills: string[];
  raw_text?: string;
  sections?: {
    personal_information?: string;
    education?: string;
    skills?: string;
    experience?: string;
    projects?: string;
    certifications?: string;
    [key: string]: string | undefined;
  };
  structured_data?: {
    personal_information?: string;
    education?: string[];
    skills?: string[];
    normalized_skills?: string[];
    experience?: string[];
    projects?: string[];
    certifications?: string[];
    entities?: Record<string, string[]>;
    experience_years?: number;
    resume_score?: number;
    [key: string]: any;
  };
  file_path?: string;
  pdf_url?: string;
  filename?: string;
}

import { type Resume } from '@/types/resume.types';

export const mockResumes: Resume[] = [
  {
    id: 'res_001',
    candidateName: 'Eleanor Vance',
    role: 'Senior Backend Engineer',
    experienceYears: 6,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'ready',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis'],
  },
  {
    id: 'res_002',
    candidateName: 'Marcus Chen',
    role: 'Full Stack Developer',
    experienceYears: 4,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'ready',
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
  },
  {
    id: 'res_003',
    candidateName: 'Sarah Jenkins',
    role: 'Data Scientist',
    experienceYears: 3,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'ready',
    skills: ['Python', 'Pandas', 'Scikit-Learn', 'TensorFlow', 'SQL'],
  },
  {
    id: 'res_004',
    candidateName: 'David Kim',
    role: 'DevOps Engineer',
    experienceYears: 5,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'parsing',
    skills: [],
  },
  {
    id: 'res_005',
    candidateName: 'Aisha Patel',
    role: 'Frontend Architect',
    experienceYears: 8,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    status: 'ready',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'GraphQL', 'Jest'],
  },
  {
    id: 'res_006',
    candidateName: 'James Wilson',
    role: 'Junior Developer',
    experienceYears: 1,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'error',
    skills: [],
  }
];

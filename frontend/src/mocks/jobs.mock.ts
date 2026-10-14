import { type Job } from '@/types/job.types';

export const mockJobs: Job[] = [
  {
    id: 'job_001',
    role: 'Senior Backend Engineer',
    company: 'TechNova',
    requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    experienceRequired: 5,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    matchesCount: 12,
  },
  {
    id: 'job_002',
    role: 'Frontend Developer',
    company: 'Nexus UX',
    requiredSkills: ['React', 'TypeScript', 'Tailwind', 'Framer Motion'],
    experienceRequired: 3,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    matchesCount: 8,
  },
  {
    id: 'job_003',
    role: 'Machine Learning Engineer',
    company: 'AI Solutions Inc.',
    requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'SQL', 'MLflow'],
    experienceRequired: 4,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    matchesCount: 4,
  },
  {
    id: 'job_004',
    role: 'DevOps Specialist',
    company: 'CloudScale',
    requiredSkills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux'],
    experienceRequired: 6,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    matchesCount: 0,
  }
];

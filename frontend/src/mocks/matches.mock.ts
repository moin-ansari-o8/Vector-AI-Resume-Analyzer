import { type AnalysisMatch } from '@/types/analysis.types';

export const mockMatches: AnalysisMatch[] = [
  {
    candidateId: 'res_001', // Eleanor Vance
    jobId: 'job_001', // Senior Backend Engineer
    score: 86,
    matchedSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    missingSkills: ['AWS'],
    timestamp: new Date().toISOString(),
  },
  {
    candidateId: 'res_005', // Aisha Patel
    jobId: 'job_002', // Frontend Developer
    score: 92,
    matchedSkills: ['React', 'TypeScript', 'Tailwind'],
    missingSkills: ['Framer Motion'],
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    candidateId: 'res_003', // Sarah Jenkins
    jobId: 'job_003', // ML Engineer
    score: 74,
    matchedSkills: ['Python', 'TensorFlow', 'SQL'],
    missingSkills: ['PyTorch', 'MLflow'],
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  }
];

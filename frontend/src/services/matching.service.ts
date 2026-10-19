import { APP_CONFIG } from '@/config/app.config';
import { matchingApi } from '@/api/matching.api';
import { skillGapApi } from '@/api/skillGap.api';
import { explainabilityApi } from '@/api/explainability.api';
import { resumeService } from './resume.service';
import { jobService } from './job.service';
import { mockMatches } from '@/mocks/matches.mock';
import { mockAnalysisDetails as detailMocks } from '@/mocks/analysis.mock';
import type { AnalysisMatch } from '@/types/analysis.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getLocalMatches = (): AnalysisMatch[] => {
  const saved = localStorage.getItem('sessionMatches');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return []; }
  }
  return [];
};

const saveLocalMatches = (matches: AnalysisMatch[]) => {
  try {
    localStorage.setItem('sessionMatches', JSON.stringify(matches));
  } catch (e) {
    console.error('Failed to save matches to cache:', e);
  }
};

export const matchingService = {
  async getRecentMatches(): Promise<AnalysisMatch[]> {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(500);
      return mockMatches;
    }

    try {
      const serverMatches = await matchingApi.getRecentMatches();
      if (serverMatches) {
        saveLocalMatches(serverMatches);
        return serverMatches;
      }
    } catch (e) {
      console.warn('Backend recent matches fetch failed, using local cache:', e);
    }

    return getLocalMatches();
  },

  async getTopMatchesForJob(jobId: string): Promise<AnalysisMatch[]> {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(700);
      return mockMatches.filter(m => m.jobId === jobId);
    }

    try {
      const serverResults = await matchingApi.getTopMatchesForJob(jobId);
      if (serverResults) return serverResults;
    } catch (e) {
      console.warn('Backend getTopMatchesForJob failed, using local filter:', e);
    }

    const localMatches = getLocalMatches();
    return localMatches.filter(m => m.jobId === jobId);
  },

  async getTopMatchesForResume(resumeId: string): Promise<AnalysisMatch[]> {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(700);
      return mockMatches.filter(m => m.candidateId === resumeId);
    }
    
    // Real API requires the resume text
    const resume = await resumeService.getById(resumeId);
    if (!resume.raw_text) {
      throw new Error("Resume text not found. Cannot perform matching.");
    }
    
    const results = await matchingApi.getTopMatchesForResume(resume.raw_text);
    return results.map((r: any) => ({
      candidateId: resume.candidateName || resumeId,
      jobId: r.title || r.job_id || r.id,
      score: Math.round(r.similarity_score || Math.random() * 40 + 60),
      matchedSkills: r.required_skills || [],
      missingSkills: [],
      timestamp: new Date().toISOString()
    }));
  },
  
  async getDetailedMatch(resumeId: string, jobId: string) {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(1200);
      return detailMocks;
    }
    
    // Fetch required data
    const resume = await resumeService.getById(resumeId);
    const job = await jobService.getById(jobId);
    
    // Call AI endpoints
    const [skillGap, explain] = await Promise.all([
      skillGapApi.analyze(resume.skills, job.requiredSkills),
      explainabilityApi.explainJobMatch(resume.skills, resume.experienceYears.toString(), job)
    ]);
    
    // Map to AnalysisDetail format expected by frontend
    const matchedCount = skillGap.matched_skills?.length || 0;
    const missingCount = skillGap.missing_skills?.length || 0;
    const totalSkills = matchedCount + missingCount || 1;
    const skillsScore = Math.round((matchedCount / totalSkills) * 100);
    
    // Format signals
    const skillSignals = [
      ...(skillGap.matched_skills || []).map((s: string) => ({ skill: s, type: 'strong' as const, context: 'Matched requirement' })),
      ...(skillGap.missing_skills || []).map((s: string) => ({ skill: s, type: 'missing' as const, context: 'Missing requirement' }))
    ];

    let explanationText = '';
    if (typeof explain === 'string') {
      explanationText = explain;
    } else if (explain.explanation) {
      explanationText = explain.explanation;
    } else {
      const matchPct = explain.skill_match_percentage || Math.round(skillsScore);
      const meetsExp = explain.experience_status === 'meets_requirement' ? 'meets' : 'is below';
      const missingCountLocal = explain.missing_skills?.length || 0;
      explanationText = `The candidate is a ${matchPct}% skill match for the ${job.title || job.role || 'selected'} role. They have ${explain.candidate_experience || resume.experienceYears} years of experience, which ${meetsExp} the required ${explain.required_experience || job.experienceRequired} years. Overall, they match ${explain.matched_skills?.length || matchedCount} skills but are missing ${missingCountLocal} key skills.`;
    }

    const overallScore = Math.round(skillsScore * 0.8 + 15);

    // Persist match to backend SQLite database
    const newMatch: AnalysisMatch = {
      candidateId: resume.candidateName || resumeId,
      jobId: job.title || job.role || jobId,
      score: overallScore,
      matchedSkills: skillGap.matched_skills || [],
      missingSkills: skillGap.missing_skills || [],
      timestamp: new Date().toISOString()
    };

    try {
      await matchingApi.recordMatch({
        candidateId: resume.id,
        candidateName: resume.candidateName || resume.candidate_name,
        jobId: job.id,
        jobTitle: job.title || job.role,
        score: overallScore,
        matchedSkills: skillGap.matched_skills || [],
        missingSkills: skillGap.missing_skills || [],
        timestamp: newMatch.timestamp
      });
    } catch (e) {
      console.warn('Failed to record match on backend database:', e);
    }

    const currentMatches = getLocalMatches();
    saveLocalMatches([newMatch, ...currentMatches.filter((m: any) => !(m.candidateId === newMatch.candidateId && m.jobId === newMatch.jobId))]);

    return {
      scoreBreakdown: {
        overall: overallScore,
        skills: skillsScore,
        experience: resume.experienceYears >= job.experienceRequired ? 100 : Math.round((resume.experienceYears / (job.experienceRequired || 1)) * 100),
        education: 100
      },
      skillSignals,
      explainability: explanationText
    };
  }
};

import { APP_CONFIG } from '@/config/app.config';
import { matchingApi } from '@/api/matching.api';
import { skillGapApi } from '@/api/skillGap.api';
import { explainabilityApi } from '@/api/explainability.api';
import { resumeService } from './resume.service';
import { jobService } from './job.service';
import { mockMatches } from '@/mocks/matches.mock';
import { mockAnalysisDetails as detailMocks } from '@/mocks/analysis.mock';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getSessionMatches = () => {
  const saved = localStorage.getItem('sessionMatches');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return []; }
  }
  return [];
};

const saveSessionMatches = (matches: any[]) => {
  localStorage.setItem('sessionMatches', JSON.stringify(matches));
};

export const matchingService = {
  async getRecentMatches() {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(500);
      return mockMatches;
    }
    return getSessionMatches();
  },

  async getTopMatchesForJob(jobId: string) {
    if (APP_CONFIG.USE_MOCKS) {
      await delay(700);
      return mockMatches.filter(m => m.jobId === jobId);
    }
    return matchingApi.getTopMatchesForJob(jobId);
  },

  async getTopMatchesForResume(resumeId: string) {
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
      candidateId: resumeId,
      jobId: r.job_id || r.id,
      score: r.score || Math.floor(Math.random() * 40 + 60),
      matchedSkills: r.matched_skills || [],
      missingSkills: r.missing_skills || [],
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
      ...(skillGap.matched_skills || []).map((s: string) => ({ skill: s, type: 'strong', context: 'Matched requirement' })),
      ...(skillGap.missing_skills || []).map((s: string) => ({ skill: s, type: 'missing', context: 'Missing requirement' }))
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

    // Save match to history
    const newMatch = {
      candidateId: resume.candidateName || resumeId,
      jobId: job.title || job.role || jobId,
      score: overallScore,
      matchedSkills: skillGap.matched_skills || [],
      missingSkills: skillGap.missing_skills || [],
      timestamp: new Date().toISOString()
    };
    const currentMatches = getSessionMatches();
    saveSessionMatches([newMatch, ...currentMatches.filter((m: any) => !(m.candidateId === newMatch.candidateId && m.jobId === newMatch.jobId))]);

    return {
      scoreBreakdown: {
        overall: overallScore, // Simple heuristic score
        skills: skillsScore,
        experience: resume.experienceYears >= job.experienceRequired ? 100 : Math.round((resume.experienceYears / (job.experienceRequired || 1)) * 100),
        education: 100 // placeholder
      },
      skillSignals,
      explainability: explanationText
    };
  }
};

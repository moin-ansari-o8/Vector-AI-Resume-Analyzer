import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { AnalysisPanel } from '@/components/analysis/AnalysisPanel';
import { ScoreBreakdown } from '@/components/analysis/ScoreBreakdown';
import { SkillSignals } from '@/components/analysis/SkillSignals';
import { ExplainabilityPanel } from '@/components/analysis/ExplainabilityPanel';
import { AnalysisActionBar } from '@/components/analysis/AnalysisActionBar';
import { MatchRing } from '@/components/shared/MatchRing';
import { resumeService } from '@/services/resume.service';
import { jobService } from '@/services/job.service';
import { matchingService } from '@/services/matching.service';
import { useResumeStore } from '@/stores/useResumeStore';
import { useJobStore } from '@/stores/useJobStore';

export function AnalysisStudioPage() {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const setResumes = useResumeStore((state) => state.setResumes);
  const setJobs = useJobStore((state) => state.setJobs);

  useEffect(() => {
    // Initial fetch for dropdowns
    resumeService.getAll().then(setResumes);
    jobService.getAll().then(setJobs);
  }, [setResumes, setJobs]);

  useEffect(() => {
    if (selectedResumeId && selectedJobId) {
      matchingService.getDetailedMatch(selectedResumeId, selectedJobId)
        .then(setAnalysis)
        .catch(console.error);
    }
  }, [selectedResumeId, selectedJobId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Analysis Studio</h1>
      </div>

      <AnalysisPanel
        selectedResumeId={selectedResumeId}
        selectedJobId={selectedJobId}
        onResumeChange={setSelectedResumeId}
        onJobChange={setSelectedJobId}
      />

      {analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Core Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex flex-col items-center justify-center p-8 bg-bg-secondary border border-border-default rounded-lg">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-6">Overall Match</h3>
              <MatchRing score={analysis.scoreBreakdown.overall} size={160} strokeWidth={8} />
            </div>
            
            <div className="p-6 bg-bg-secondary border border-border-default rounded-lg">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-6">Score Breakdown</h3>
              <ScoreBreakdown breakdown={analysis.scoreBreakdown} />
            </div>
          </div>

          {/* Right Column: Deep Dive & Signals */}
          <div className="lg:col-span-2 space-y-6">
            <ExplainabilityPanel 
              explainability={analysis.explainability} 
              signals={analysis.skillSignals} 
            />
            
            <AnalysisActionBar resumeId={selectedResumeId!} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-text-muted border border-border-default border-dashed rounded-lg">
          <p>Select a candidate and a target role to run the analysis.</p>
        </div>
      )}
    </div>
  );
}

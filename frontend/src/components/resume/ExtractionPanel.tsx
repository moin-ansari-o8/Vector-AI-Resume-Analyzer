import { SkillTag } from '../shared/SkillTag';
import type { Resume } from '@/types/resume.types';

interface ExtractionPanelProps {
  resume: Resume;
}

export function ExtractionPanel({ resume }: ExtractionPanelProps) {
  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <div className="p-6 border-b border-border-default">
        <h2 className="text-xl font-semibold text-text-primary">{resume.candidateName}</h2>
        <p className="text-sm text-text-secondary mt-1">{resume.role}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Extracted Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-bg-secondary rounded-lg border border-border-default">
              <span className="text-xs text-text-muted uppercase">Experience</span>
              <p className="text-lg font-medium text-text-primary mt-1">{resume.experienceYears} Years</p>
            </div>
            <div className="p-3 bg-bg-secondary rounded-lg border border-border-default">
              <span className="text-xs text-text-muted uppercase">Status</span>
              <p className="text-lg font-medium text-accent-positive mt-1 capitalize">{resume.status}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Detected Skills</h3>
          {resume.skills && resume.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <SkillTag key={skill} label={skill} variant="neutral" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No skills extracted yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

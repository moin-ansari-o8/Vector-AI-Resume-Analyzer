import { SkillTag } from '../shared/SkillTag';

interface SkillSignalsProps {
  matched: string[];
  missing: string[];
}

export function SkillSignals({ matched, missing }: SkillSignalsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Matched Requirements
        </h4>
        <div className="flex flex-wrap gap-2">
          {matched.length > 0 ? (
            matched.map((skill) => (
              <SkillTag key={skill} label={skill} variant="matched" />
            ))
          ) : (
            <span className="text-sm text-text-muted">No key requirements matched.</span>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Missing Requirements
        </h4>
        <div className="flex flex-wrap gap-2">
          {missing.length > 0 ? (
            missing.map((skill) => (
              <SkillTag key={skill} label={skill} variant="missing" />
            ))
          ) : (
            <span className="text-sm text-text-muted">No critical missing requirements.</span>
          )}
        </div>
      </div>
    </div>
  );
}

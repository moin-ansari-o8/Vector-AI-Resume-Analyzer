import { useState, useEffect } from 'react';
import { OriginalResume } from './OriginalResume';
import { ResumeImprovementChat } from './ResumeImprovementChat';
import { useToast } from '../shared/Toast';
import { resumeService } from '@/services/resume.service';
import type { Resume } from '@/types/resume.types';

interface ImprovementWorkspaceProps {
  resume: Resume | null;
  targetRole?: string;
  onUpdateResume?: (updated: Resume) => void;
}

export function ImprovementWorkspace({
  resume: initialResume,
  targetRole = 'Software Engineer',
  onUpdateResume,
}: ImprovementWorkspaceProps) {
  const [resume, setResume] = useState<Resume | null>(initialResume);
  const { addToast } = useToast();

  useEffect(() => {
    setResume(initialResume);
  }, [initialResume]);

  const handleApplyLineChange = async (originalText: string, newText: string, section: string) => {
    if (!resume) return;

    let updatedSections = { ...(resume.sections || {}) };
    let updatedRawText = resume.raw_text || '';

    if (originalText && updatedRawText.includes(originalText)) {
      updatedRawText = updatedRawText.replace(originalText, newText);
    } else {
      updatedRawText += `\n• ${newText}`;
    }

    const secKey = Object.keys(updatedSections).find(k =>
      section.toLowerCase().includes(k.toLowerCase())
    ) || 'experience';

    if (updatedSections[secKey]) {
      if (updatedSections[secKey].includes(originalText)) {
        updatedSections[secKey] = updatedSections[secKey].replace(originalText, newText);
      } else {
        updatedSections[secKey] += `\n• ${newText}`;
      }
    }

    const updatedResume: Resume = {
      ...resume,
      sections: updatedSections,
      raw_text: updatedRawText,
    };

    setResume(updatedResume);
    onUpdateResume?.(updatedResume);

    try {
      await resumeService.update(resume.id, {
        sections: updatedSections,
        raw_text: updatedRawText,
      });
      addToast('Suggestion applied and saved to resume!', 'success');
    } catch (e) {
      console.error('Error saving updated resume:', e);
    }
  };

  return (
    <div className="flex h-full border border-border-default rounded-lg overflow-hidden bg-bg-secondary">
      {/* Left Pane: Original Resume / Raw Text Viewer */}
      <OriginalResume
        resume={resume}
        className="flex-1 h-full"
      />

      {/* Right Pane: AI Chat Assistant with "Show Suggestions" Button */}
      <div className="w-[420px] lg:w-[460px] shrink-0 bg-bg-secondary border-l border-border-default flex flex-col overflow-hidden">
        <ResumeImprovementChat
          resume={resume}
          targetJobTitle={targetRole}
          onApplyText={handleApplyLineChange}
        />
      </div>
    </div>
  );
}

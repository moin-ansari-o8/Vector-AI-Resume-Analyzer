import { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Edit3, RefreshCw, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { OriginalResume } from './OriginalResume';
import { SuggestionCard } from './SuggestionCard';
import { ResumeImprovementChat } from './ResumeImprovementChat';
import { Tabs } from '../shared/Tabs';
import { Button } from '../shared/Button';
import { useToast } from '../shared/Toast';
import { resumeImprovementApi, type ImprovementSuggestion } from '@/api/resumeImprovement.api';
import { resumeService } from '@/services/resume.service';
import type { Resume } from '@/types/resume.types';

import { ExtractionPanel } from '../resume/ExtractionPanel';

interface ImprovementWorkspaceProps {
  resume: Resume | null;
  targetRole?: string;
  onUpdateResume?: (updated: Resume) => void;
}

export function ImprovementWorkspace({
  resume: initialResume,
  targetRole = 'Senior Backend Engineer',
  onUpdateResume,
}: ImprovementWorkspaceProps) {
  const [resume, setResume] = useState<Resume | null>(initialResume);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    setResume(initialResume);
  }, [initialResume]);

  // Load suggestions when resume changes
  useEffect(() => {
    if (!resume) return;

    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const text = resume.raw_text || Object.values(resume.sections || {}).join('\n\n');
        const res = await resumeImprovementApi.improve({
          resumeText: text,
          jobTitle: targetRole,
          candidateSkills: resume.skills || [],
          missingSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
          sections: resume.sections as Record<string, string>,
        });

        if (res.suggestions && res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
          // Highlight first suggestion by default
          setHighlightedText(res.suggestions[0].originalText);
          setHighlightedSection(res.suggestions[0].section);
          setActiveCardIndex(0);
        }
      } catch (err) {
        console.error('Failed to generate suggestions:', err);
        // Fallback default suggestions targeting candidate data
        const fallback = [
          {
            section: 'Professional Summary',
            originalText: resume.sections?.personal_information?.split('\n')[0] || resume.candidateName || 'Experienced software professional.',
            suggestedText: `Results-driven ${targetRole} with demonstrated expertise in architecting scalable backend microservices and high-throughput APIs.`,
            reasoning: 'Replaces generic phrasing with targeted title keywords and quantifiable scope.'
          },
          {
            section: 'Experience',
            originalText: resume.sections?.experience?.split('\n')[0] || 'Maintained software components.',
            suggestedText: 'Spearheaded critical system optimizations, reducing latency by 35% and increasing service reliability to 99.9%.',
            reasoning: 'Uses strong action verb "Spearheaded" and quantified metric.'
          }
        ];
        setSuggestions(fallback);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [resume?.id, targetRole]);

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
      addToast('Suggestion applied and saved to database!', 'success');
    } catch (e) {
      console.error('Error saving updated resume:', e);
    }
  };

  // Accept a suggestion: replace the text in the resume and persist
  const handleAcceptSuggestion = async (index: number, newText: string) => {
    if (!resume) return;
    const target = suggestions[index];
    if (!target) return;

    await handleApplyLineChange(target.originalText, newText, target.section);

    // Remove accepted suggestion
    const remaining = suggestions.filter((_, i) => i !== index);
    setSuggestions(remaining);

    if (remaining.length > 0) {
      const nextIndex = Math.min(index, remaining.length - 1);
      setActiveCardIndex(nextIndex);
      setHighlightedText(remaining[nextIndex].originalText);
      setHighlightedSection(remaining[nextIndex].section);
    } else {
      setActiveCardIndex(null);
      setHighlightedText(null);
      setHighlightedSection(null);
    }
  };

  const handleRejectSuggestion = (index: number) => {
    const remaining = suggestions.filter((_, i) => i !== index);
    setSuggestions(remaining);
    if (remaining.length > 0) {
      const nextIndex = Math.min(index, remaining.length - 1);
      setActiveCardIndex(nextIndex);
      setHighlightedText(remaining[nextIndex].originalText);
      setHighlightedSection(remaining[nextIndex].section);
    } else {
      setActiveCardIndex(null);
      setHighlightedText(null);
      setHighlightedSection(null);
    }
    addToast('Suggestion dismissed', 'info');
  };

  const handleSelectCard = (index: number) => {
    setActiveCardIndex(index);
    setHighlightedText(suggestions[index].originalText);
    setHighlightedSection(suggestions[index].section);
  };

  return (
    <div className="flex h-full border border-border-default rounded-lg overflow-hidden bg-bg-secondary">
      {/* Left Pane: Actual Resume Document with Live Highlights */}
      <OriginalResume
        resume={resume}
        highlightedSection={highlightedSection}
        highlightedOriginalText={highlightedText}
        onSelectLine={(text, section) => {
          setHighlightedText(text);
          setHighlightedSection(section);
        }}
      />

      {/* Right Pane: AI Assistant / Suggestions & Interactive Chat */}
      <div className="w-96 lg:w-[440px] shrink-0 bg-bg-secondary border-l border-border-default flex flex-col overflow-hidden">
        <Tabs
          tabs={[
            { label: 'AI Suggestions', value: 'suggestions' },
            { label: 'Resume Chat', value: 'chat' },
            { label: 'Extracted Data', value: 'extracted' },
            { label: 'Direct Editor', value: 'editor' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="bg-bg-primary px-4 border-b border-border-default shrink-0"
        />

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'suggestions' ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border-default">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    {suggestions.length} Recommended Improvements
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Target: <span className="text-accent-primary font-medium">{targetRole}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RefreshCw size={12} className={isLoadingSuggestions ? "animate-spin" : ""} />}
                  onClick={() => {
                    if (resume) {
                      setSuggestions([]);
                      setIsLoadingSuggestions(true);
                      resumeImprovementApi.improve({
                        resumeText: resume.raw_text || '',
                        jobTitle: targetRole,
                        candidateSkills: resume.skills || [],
                        missingSkills: ['AWS', 'Docker'],
                      }).then(res => {
                        setSuggestions(res.suggestions || []);
                      }).finally(() => setIsLoadingSuggestions(false));
                    }
                  }}
                  title="Regenerate suggestions with AI"
                >
                  Refresh
                </Button>
              </div>

              {isLoadingSuggestions ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin"></div>
                  <p className="text-xs text-text-secondary">AI analyzing resume against target role...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3 p-6 bg-bg-primary rounded-lg border border-border-default">
                  <CheckCircle size={32} className="text-accent-positive" />
                  <p className="text-sm font-medium text-text-primary">All suggestions applied!</p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Your resume has incorporated the targeted improvements. Use the **Resume Chat** tab to ask further questions.
                  </p>
                </div>
              ) : (
                suggestions.map((s, i) => (
                  <SuggestionCard
                    key={`${s.section}-${i}`}
                    {...s}
                    isActive={activeCardIndex === i}
                    onSelect={() => handleSelectCard(i)}
                    onAccept={(newText) => handleAcceptSuggestion(i, newText)}
                    onReject={() => handleRejectSuggestion(i)}
                  />
                ))
              )}
            </div>
          ) : activeTab === 'chat' ? (
            /* Working Interactive Chat for Line-by-Line Inquiries */
            <ResumeImprovementChat
              resume={resume}
              targetJobTitle={targetRole}
              onApplyText={(orig, newLine, sec) => {
                handleApplyLineChange(orig, newLine, sec);
              }}
            />
          ) : activeTab === 'extracted' ? (
            /* Extracted Data View */
            <div className="flex-1 overflow-y-auto">
              {resume ? (
                <ExtractionPanel resume={resume} />
              ) : (
                <div className="p-6 text-text-muted text-xs">No resume data loaded.</div>
              )}
            </div>
          ) : (
            /* Manual / Direct Editor */
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Edit Resume Raw Text
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Save size={12} />}
                  onClick={async () => {
                    if (resume) {
                      await resumeService.update(resume.id, { raw_text: resume.raw_text });
                      addToast('Changes saved to database!', 'success');
                    }
                  }}
                >
                  Save Text
                </Button>
              </div>
              <textarea
                value={resume?.raw_text || ''}
                onChange={(e) => {
                  if (resume) {
                    const updated = { ...resume, raw_text: e.target.value };
                    setResume(updated);
                  }
                }}
                className="flex-1 w-full bg-bg-elevated border border-border-default rounded-md p-3 font-mono text-xs text-text-primary leading-relaxed focus:outline-none focus:ring-1 focus:ring-accent-primary resize-none"
                placeholder="Resume text..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



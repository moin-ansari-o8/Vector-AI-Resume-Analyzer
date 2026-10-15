import { useState, useEffect } from 'react';
import { FileText, Eye, Download, FileCode, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { resumeApi } from '@/api/resume.api';
import { resumeService } from '@/services/resume.service';
import type { Resume } from '@/types/resume.types';

interface DocumentViewerProps {
  resumeId?: string;
  resume?: Resume | null;
  className?: string;
  highlightedSection?: string | null;
  highlightedOriginalText?: string | null;
  onSelectLine?: (text: string, section: string) => void;
}

export function DocumentViewer({
  resumeId,
  resume: propResume,
  className,
  highlightedSection,
  highlightedOriginalText,
  onSelectLine,
}: DocumentViewerProps) {
  const [resume, setResume] = useState<Resume | null>(propResume || null);
  const [viewMode, setViewMode] = useState<'formatted' | 'pdf' | 'raw'>('formatted');
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (propResume) {
      setResume(propResume);
    } else if (resumeId) {
      resumeService.getById(resumeId)
        .then(setResume)
        .catch((e) => console.error('Failed to load resume for viewer:', e));
    }
  }, [resumeId, propResume]);

  const pdfUrl = resume ? resumeApi.getPdfUrl(resume.id) : '';

  // Extract candidate contact details and sections
  const sections = resume?.sections || {};
  const personalInfo = sections.personal_information || '';
  const experienceText = sections.experience || '';
  const educationText = sections.education || '';
  const skillsList = resume?.skills || [];
  const projectsText = sections.projects || '';
  const certificationsText = sections.certifications || '';

  // Split lines for rendering
  const parseLines = (text: string) => {
    return text.split('\n').map(l => l.trim()).filter(Boolean);
  };

  const cleanTarget = (t: string) => t.replace(/^[•\-\*\s#]+/, '').trim().toLowerCase();

  const isHighlighted = (text: string, _sectionName: string) => {
    if (!highlightedOriginalText) return false;
    const cleanLine = cleanTarget(text);
    const target = cleanTarget(highlightedOriginalText);
    if (!cleanLine || !target) return false;

    // Check if line contains target snippet or vice versa
    const snippet = target.slice(0, 25);
    return cleanLine.includes(snippet) || target.includes(cleanLine.slice(0, 25));
  };


  return (
    <div className={cn("flex flex-col h-full bg-bg-secondary border border-border-default rounded-lg overflow-hidden shadow-sm", className)}>
      {/* Viewer Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-bg-primary shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-bg-elevated border border-border-default text-accent-primary">
            <FileText size={16} />
          </div>
          <div>
            <span className="text-sm font-semibold text-text-primary block truncate max-w-xs">
              {resume?.candidateName || 'Candidate Resume'}
            </span>
            <span className="text-xs text-text-muted font-mono">{resume?.id || resumeId}</span>
          </div>
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-elevated p-0.5 rounded-md border border-border-default text-xs">
            <button
              onClick={() => setViewMode('formatted')}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5",
                viewMode === 'formatted'
                  ? "bg-bg-hover text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Eye size={13} /> Formatted
            </button>
            <button
              onClick={() => setViewMode('pdf')}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5",
                viewMode === 'pdf'
                  ? "bg-bg-hover text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <FileText size={13} /> Original File
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5",
                viewMode === 'raw'
                  ? "bg-bg-hover text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <FileCode size={13} /> Raw Text
            </button>
          </div>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
              title="Open document in new tab"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Main Document Content Area */}
      <div className="flex-1 p-4 md:p-6 bg-[#0E0F0F] overflow-y-auto">
        {viewMode === 'pdf' ? (
          <div className="w-full h-full min-h-[600px] flex flex-col bg-bg-elevated rounded border border-border-default overflow-hidden">
            {!pdfError ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full flex-1 border-0"
                title="Original Resume PDF"
                onError={() => setPdfError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-3">
                <FileText size={48} className="text-text-muted opacity-50" />
                <p className="text-sm text-text-secondary">PDF preview is not supported directly in this frame.</p>
                <a
                  href={pdfUrl}
                  download
                  className="px-4 py-2 bg-accent-primary text-bg-primary rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Download Original PDF
                </a>
              </div>
            )}
          </div>
        ) : viewMode === 'raw' ? (
          <div className="max-w-4xl mx-auto p-6 bg-bg-elevated rounded-lg border border-border-default font-mono text-xs text-text-secondary whitespace-pre-wrap leading-relaxed shadow-sm">
            {resume?.raw_text || 'No raw text available.'}
          </div>
        ) : (
          /* Formatted Resume Sheet View */
          <div className="max-w-3xl mx-auto min-h-[900px] bg-[#FFFFFF] text-[#1A1A1A] p-8 md:p-12 shadow-xl rounded-sm transition-all duration-normal font-sans">
            {/* Header / Identity */}
            <div className="border-b-2 border-neutral-300 pb-6 mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif">
                {resume?.candidateName || 'Candidate Profile'}
              </h1>
              <p className="text-neutral-700 font-medium text-sm mt-1">
                {resume?.role || 'Software Engineering Professional'}
              </p>

              {personalInfo && (
                <div className="mt-3 text-xs text-neutral-600 space-y-1">
                  {parseLines(personalInfo).slice(1, 4).map((line, idx) => (
                    <p key={idx} className="leading-relaxed">{line}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Section */}
            {personalInfo && parseLines(personalInfo).length > 3 && (
              <div className={cn(
                "mb-6 p-2 rounded transition-all",
                isHighlighted(personalInfo, 'Summary') ? "bg-amber-100 ring-2 ring-amber-400" : ""
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono">
                    Professional Summary
                  </h2>
                  {isHighlighted(personalInfo, 'Summary') && (
                    <span className="text-[10px] bg-amber-500 text-white font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={10} /> Suggestion Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-800 leading-relaxed">
                  {parseLines(personalInfo).slice(3).join(' ')}
                </p>
              </div>
            )}

            {/* Experience Section */}
            {experienceText && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-200 pb-1 mb-3">
                  Experience
                </h2>
                <div className="space-y-3">
                  {parseLines(experienceText).map((line, idx) => {
                    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
                    const text = isBullet ? line.substring(1).trim() : line;
                    const highlighted = isHighlighted(text, 'Experience');

                    return (
                      <div
                        key={idx}
                        onClick={() => onSelectLine?.(text, 'Experience')}
                        className={cn(
                          "text-sm leading-relaxed rounded p-1.5 transition-all cursor-pointer",
                          highlighted
                            ? "bg-amber-100 text-neutral-950 font-medium ring-2 ring-amber-400 pl-2 shadow-xs"
                            : "hover:bg-neutral-100 text-neutral-800"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {isBullet ? (
                            <span className="text-neutral-500 mt-1 select-none">•</span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 font-mono mt-1 select-none">#</span>
                          )}
                          <span className="flex-1">{text}</span>
                          {highlighted && (
                            <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded shrink-0 font-medium">
                              Improve
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {skillsList.length > 0 && (
              <div className={cn(
                "mb-6 p-2 rounded transition-all",
                isHighlighted(skillsList.join(', '), 'Skills') ? "bg-amber-100 ring-2 ring-amber-400" : ""
              )}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-200 pb-1 mb-3">
                  Core Skills & Technologies
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {projectsText && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-200 pb-1 mb-3">
                  Key Projects
                </h2>
                <div className="space-y-2 text-sm text-neutral-800">
                  {parseLines(projectsText).map((line, idx) => (
                    <p key={idx} className="leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {educationText && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-200 pb-1 mb-3">
                  Education & Background
                </h2>
                <div className="space-y-2 text-sm text-neutral-800">
                  {parseLines(educationText).map((line, idx) => (
                    <p key={idx} className="leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {certificationsText && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-200 pb-1 mb-3">
                  Certifications & Credentials
                </h2>
                <div className="space-y-1 text-sm text-neutral-800">
                  {parseLines(certificationsText).map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback if experience or major sections are not recognized */}
            {(!experienceText && !educationText && !projectsText) && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono mb-3">
                  Resume Content & Experience
                </h2>
                <div className="space-y-2">
                  {parseLines(resume?.raw_text || '').map((line, idx) => {
                    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
                    const text = isBullet ? line.substring(1).trim() : line;
                    const highlighted = isHighlighted(text, 'Resume');
                    return (
                      <div
                        key={idx}
                        onClick={() => onSelectLine?.(text, 'Experience')}
                        className={cn(
                          "text-sm leading-relaxed rounded p-1.5 transition-all cursor-pointer",
                          highlighted
                            ? "bg-amber-100 text-neutral-950 font-medium ring-2 ring-amber-400 pl-2 shadow-xs"
                            : "hover:bg-neutral-100 text-neutral-800"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-neutral-400 mt-1 select-none text-xs">{isBullet ? '•' : '›'}</span>
                          <span className="flex-1">{text}</span>
                          {highlighted && (
                            <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded shrink-0 font-medium">
                              Improve
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

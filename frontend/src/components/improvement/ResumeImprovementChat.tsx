import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Key, Check, ArrowRight } from 'lucide-react';
import { chatService } from '@/services/chat.service';
import { chatApi } from '@/api/chat.api';
import { useToast } from '@/components/shared/Toast';
import type { Message } from '@/types/chat.types';
import type { Resume } from '@/types/resume.types';

interface ResumeImprovementChatProps {
  resume: Resume | null;
  targetJobTitle?: string;
  onApplyText?: (originalLine: string, newLine: string, section: string) => void;
}

interface ParsedSuggestion {
  section: string;
  original: string;
  replacement: string;
}

export function ResumeImprovementChat({
  resume,
  targetJobTitle = 'Software Engineer',
  onApplyText,
}: ResumeImprovementChatProps) {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `Hello! I'm analyzing **${resume?.candidateName || 'your resume'}** against the **${targetJobTitle}** target role.\n\nAsk me anything: which exact line in your experience needs metrics, where to add missing skills, or how to rephrase bullet points for maximum recruiter impact!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [appliedLines, setAppliedLines] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatApi.getStatus()
      .then(setAiStatus)
      .catch(() => {});
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSaveGeminiKey = async () => {
    if (!keyInput.trim()) return;
    try {
      const res = await chatApi.updateConfig(keyInput.trim());
      setAiStatus(res.status);
      addToast('Gemini API configured successfully!', 'success');
      setShowKeyInput(false);
      setKeyInput('');
    } catch (e) {
      addToast('Failed to save Gemini API key', 'error');
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(
        [...messages, userMessage],
        {
          resumeText: resume?.raw_text || Object.values(resume?.sections || {}).join('\n\n'),
          resumeSkills: resume?.skills || [],
          resumeExperience: resume?.experienceYears || 0,
          targetJob: targetJobTitle,
        }
      );

      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue analyzing that section. Please check your backend connection.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to parse suggestion tags like [APPLY_SUGGESTION:Experience|orig|repl]
  const parseMessageContent = (content: string) => {
    const tagMatch = content.match(/\[APPLY_SUGGESTION:(.*?)\|(.*?)\|(.*?)\]/);
    if (!tagMatch) {
      return { cleanText: content, suggestion: null };
    }
    const cleanText = content.replace(/\[APPLY_SUGGESTION:(.*?)\|(.*?)\|(.*?)\]/, '').trim();
    const suggestion: ParsedSuggestion = {
      section: tagMatch[1],
      original: tagMatch[2],
      replacement: tagMatch[3],
    };
    return { cleanText, suggestion };
  };

  const handleApplySuggestion = (s: ParsedSuggestion) => {
    if (onApplyText) {
      onApplyText(s.original, s.replacement, s.section);
      setAppliedLines((prev) => new Set(prev).add(s.original));
      addToast(`Applied updated line to ${s.section}!`, 'success');
    }
  };

  const quickPrompts = [
    "Which line in Experience needs metrics?",
    "Where should I place missing skills?",
    "Rewrite summary with strong verbs",
    "Identify weak bullet points",
  ];

  return (
    <div className="flex flex-col h-full bg-bg-secondary">
      {/* AI Provider Header Banner */}
      <div className="px-3.5 py-2 border-b border-border-default bg-bg-primary flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-accent-primary" />
          <span className="font-medium text-text-primary">
            {aiStatus?.gemini_configured ? 'Google Gemini AI Engine' : 'Heuristic Resume Analyzer'}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${aiStatus?.gemini_configured ? 'bg-accent-positive' : 'bg-accent-warning'}`} />
        </div>

        {!aiStatus?.gemini_configured && (
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-[11px] text-accent-primary hover:underline flex items-center gap-1 font-medium"
          >
            <Key size={11} /> {showKeyInput ? 'Cancel' : 'Set Gemini Key'}
          </button>
        )}
      </div>

      {/* Inline Gemini Key Config Bar */}
      {showKeyInput && (
        <div className="p-3 bg-bg-elevated border-b border-border-default flex gap-2 items-center shrink-0">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Paste your Google Gemini API key..."
            className="flex-1 bg-bg-primary border border-border-default rounded px-2.5 py-1 text-xs text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
          <button
            onClick={handleSaveGeminiKey}
            className="px-3 py-1 bg-accent-primary text-bg-primary rounded text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      )}

      {/* Quick Prompts Bar */}
      <div className="p-2.5 border-b border-border-default bg-bg-primary/50 overflow-x-auto flex gap-1.5 shrink-0 [&::-webkit-scrollbar]:hidden">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary hover:border-accent-primary/40 transition-colors shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const { cleanText, suggestion } = msg.role === 'assistant'
            ? parseMessageContent(msg.content)
            : { cleanText: msg.content, suggestion: null };

          const isApplied = suggestion ? appliedLines.has(suggestion.original) : false;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-md bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center shrink-0 text-accent-primary mt-0.5">
                  <Bot size={14} />
                </div>
              )}
              
              <div className="max-w-[88%] space-y-2">
                <div
                  className={`rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-accent-primary text-bg-primary font-medium'
                      : 'bg-bg-primary border border-border-default text-text-primary shadow-xs'
                  }`}
                >
                  {cleanText}
                </div>

                {/* Interactive Apply Suggestion Card inside Chat */}
                {suggestion && (
                  <div className="p-3 bg-bg-primary border border-accent-primary/30 rounded-lg shadow-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-accent-primary text-[11px] uppercase tracking-wider">
                        {suggestion.section} Update
                      </span>
                      {isApplied && (
                        <span className="text-[10px] text-accent-positive flex items-center gap-1 font-medium bg-accent-positive/10 px-2 py-0.5 rounded">
                          <Check size={11} /> Applied
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <div className="p-2 bg-accent-negative/5 border border-accent-negative/20 rounded text-[11px] text-text-secondary line-through">
                        {suggestion.original}
                      </div>
                      <div className="p-2 bg-accent-positive/5 border border-accent-positive/20 rounded text-[11px] text-text-primary font-medium flex items-start gap-1">
                        <ArrowRight size={12} className="text-accent-positive shrink-0 mt-0.5" />
                        <span>{suggestion.replacement}</span>
                      </div>
                    </div>

                    {!isApplied && (
                      <button
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="w-full mt-1.5 py-1.5 px-3 bg-accent-primary text-bg-primary rounded text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Check size={13} /> Apply to Resume Document
                      </button>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-md bg-bg-elevated border border-border-default flex items-center justify-center shrink-0 text-text-secondary mt-0.5">
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 items-center text-xs text-text-muted">
            <div className="w-7 h-7 rounded-md bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
              <Bot size={14} />
            </div>
            <div className="flex gap-1 items-center bg-bg-primary px-3 py-2 rounded-lg border border-border-default">
              <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"></span>
              <span className="ml-1 text-[11px] text-text-secondary">Analyzing resume lines...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-border-default bg-bg-primary shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask where to update lines, add skills, or rewrite..."
            className="flex-1 bg-bg-elevated border border-border-default rounded-md px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-md bg-accent-primary text-bg-primary disabled:opacity-40 hover:opacity-90 transition-opacity"
            title="Send inquiry"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}


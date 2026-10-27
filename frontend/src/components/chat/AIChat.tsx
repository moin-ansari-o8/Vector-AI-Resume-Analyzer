import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Minus } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { SuggestedPrompts } from './SuggestedPrompts';
import { useResumeStore } from '@/stores/useResumeStore';

export function AIChat() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  // Do not render floating chatbox if user is on improvement page or resume detail page (they have their own dedicated workspace chat)
  if (location.pathname.startsWith('/improvement') || location.pathname.startsWith('/resumes/')) {
    return null;
  }
  
  const selectedResumeId = useResumeStore(state => state.selectedResumeId);
  const resumes = useResumeStore(state => state.resumes);
  const activeResume = resumes.find(r => r.id === selectedResumeId) || resumes[0];
  
  const chatContext = activeResume ? {
    resumeText: activeResume.raw_text || Object.values(activeResume.sections || {}).join('\n\n'),
    resumeSkills: activeResume.skills,
    resumeExperience: (activeResume.experienceYears || 0).toString()
  } : undefined;

  const { messages, isTyping, appendUserMessage } = useChat(chatContext);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    appendUserMessage(input.trim());
    setInput('');
  };

  const handlePromptSelect = (prompt: string) => {
    if (isTyping) return;
    appendUserMessage(prompt);
  };

  return (
    <>
      {/* Collapsed floating action button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent-primary text-bg-primary flex items-center justify-center shadow-lg z-40 hover:brightness-110 transition-all"
            aria-label="Open AI Chat"
          >
            <Bot size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[85vh] bg-bg-elevated border border-border-default rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-bg-secondary">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Vector AI Assistant</h3>
                  <p className="text-xs text-text-muted">Ask anything about candidates</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-text-muted p-4">
                  <Bot size={40} className="opacity-20" />
                  <p className="text-sm">I can help you evaluate candidates, extract skills, or draft interview questions.</p>
                </div>
              ) : (
                messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
              )}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border bg-accent-primary/10 border-accent-primary/20 text-accent-primary">
                    <Bot size={14} />
                  </div>
                  <div className="bg-transparent border border-border-default rounded-lg p-3 rounded-tl-none flex items-center gap-1">
                    <motion.div className="w-1.5 h-1.5 bg-text-muted rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-text-muted rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-text-muted rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border-default bg-bg-primary">
              {messages.length === 0 && (
                <SuggestedPrompts 
                  prompts={[
                    "What are the red flags?",
                    "Generate 3 technical interview questions."
                  ]}
                  onSelect={handlePromptSelect}
                />
              )}
              
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full pl-4 pr-12 py-3 bg-bg-secondary border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 disabled:opacity-50 disabled:hover:text-text-muted disabled:hover:bg-transparent transition-all"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

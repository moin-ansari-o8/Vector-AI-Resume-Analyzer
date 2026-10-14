import { useState } from 'react';
import { OriginalResume } from './OriginalResume';
import { SuggestionCard } from './SuggestionCard';
import { Tabs } from '../shared/Tabs';

export function ImprovementWorkspace() {
  const [activeTab, setActiveTab] = useState('suggestions');

  const mockSuggestions = [
    {
      section: 'Professional Summary',
      originalText: 'Experienced backend engineer with 6+ years of building scalable microservices.',
      suggestedText: 'Backend Engineer with 6+ years of experience architecting high-throughput microservices capable of processing 10k+ RPS.',
      reasoning: 'Added quantifiable metrics to demonstrate scale and impact.'
    },
    {
      section: 'Experience - TechNova',
      originalText: 'Maintained database infrastructure.',
      suggestedText: 'Optimized PostgreSQL database infrastructure, reducing query latency by 40%.',
      reasoning: 'Replaced passive phrasing with action-oriented, results-driven language.'
    }
  ];

  return (
    <div className="flex h-full border border-border-default rounded-lg overflow-hidden">
      {/* Left Pane: Original Resume Document */}
      <OriginalResume />
      
      {/* Right Pane: AI Assistant / Suggestions */}
      <div className="w-96 shrink-0 bg-bg-secondary border-l border-border-default flex flex-col">
        <Tabs
          tabs={[
            { label: 'AI Suggestions', value: 'suggestions' },
            { label: 'Editor', value: 'editor' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="bg-bg-primary px-4"
        />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'suggestions' ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-primary">2 Pending Improvements</h3>
                <span className="text-xs text-text-muted">Target: Backend Engineer</span>
              </div>
              
              {mockSuggestions.map((s, i) => (
                <SuggestionCard key={i} {...s} />
              ))}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              Manual editor coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

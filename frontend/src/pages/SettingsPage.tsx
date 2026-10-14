import { useState, useEffect } from 'react';
import { Settings, Cpu, Sparkles, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { useToast } from '@/components/shared/Toast';
import { chatApi } from '@/api/chat.api';

export function SettingsPage() {
  const isMocksEnabled = import.meta.env.VITE_USE_MOCKS !== 'false';
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const { addToast } = useToast();

  const [aiStatus, setAiStatus] = useState<any>(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isMocksEnabled) {
      chatApi.getStatus()
        .then(setAiStatus)
        .catch(console.error);
    }
  }, [isMocksEnabled]);

  const handleSaveKey = async () => {
    if (!geminiKey.trim()) return;
    setIsSaving(true);
    try {
      const res = await chatApi.updateConfig(geminiKey.trim());
      setAiStatus(res.status);
      addToast('Gemini API key saved successfully!', 'success');
      setGeminiKey('');
    } catch (e) {
      addToast('Failed to update Gemini API key', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-caption text-text-secondary uppercase tracking-wider font-medium mb-2 block">
            CONFIGURATION
          </span>
          <h1 className="text-h1 text-text-primary">Settings</h1>
        </div>
      </div>
      
      {/* AI Engine & Gemini Configuration Card */}
      <div className="bg-bg-elevated rounded-lg p-6 border border-border-default shadow-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20 text-accent-primary">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="text-h3 text-text-primary">AI & LLM Engine Configuration</h2>
            <p className="text-body-sm text-text-secondary">Configure Google Gemini API or local Ollama for resume intelligence.</p>
          </div>
        </div>

        {/* AI Provider Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-bg-primary rounded-md border border-border-default space-y-1">
            <span className="text-[11px] font-mono uppercase text-text-muted">Active Engine</span>
            <p className="text-sm font-semibold text-accent-primary capitalize">
              {aiStatus?.active_provider || 'Local Ollama / Heuristic'}
            </p>
          </div>
          
          <div className="p-3.5 bg-bg-primary rounded-md border border-border-default space-y-1">
            <span className="text-[11px] font-mono uppercase text-text-muted">Google Gemini</span>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <span className={`w-2 h-2 rounded-full ${aiStatus?.gemini_configured ? 'bg-accent-positive' : 'bg-text-muted'}`} />
              <span className={aiStatus?.gemini_configured ? 'text-accent-positive' : 'text-text-muted'}>
                {aiStatus?.gemini_configured ? 'Configured' : 'Not Configured'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-bg-primary rounded-md border border-border-default space-y-1">
            <span className="text-[11px] font-mono uppercase text-text-muted">Local Ollama</span>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <span className={`w-2 h-2 rounded-full ${aiStatus?.ollama_available ? 'bg-accent-positive' : 'bg-accent-warning'}`} />
              <span className={aiStatus?.ollama_available ? 'text-accent-positive' : 'text-accent-warning'}>
                {aiStatus?.ollama_available ? 'Connected (llama3.2:3b)' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Gemini API Key Input */}
        <div className="space-y-2 pt-2 border-t border-border-default">
          <label className="text-body-sm font-medium text-text-primary flex items-center gap-2">
            <Key size={14} className="text-accent-primary" />
            Google Gemini API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Paste your Gemini API key (AIzaSy...)"
              className="flex-1 bg-bg-primary border border-border-default rounded-md px-3.5 py-2 text-sm text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveKey}
              disabled={isSaving || !geminiKey.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Key'}
            </Button>
          </div>
          <p className="text-caption text-text-secondary">
            Get your free API key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-accent-primary hover:underline">Google AI Studio</a>. When configured, VECTOR uses Gemini for ultra-fast, high-precision resume suggestions.
          </p>
        </div>
      </div>
      
      {/* General Settings */}
      <div className="bg-bg-elevated rounded-lg p-6 border border-border-default shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-bg-hover flex items-center justify-center border border-border-default">
            <Settings className="text-accent-primary" size={20} />
          </div>
          <div>
            <h2 className="text-h3 text-text-primary">System Environment</h2>
            <p className="text-body-sm text-text-secondary">Current server routing and endpoint parameters.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-body-sm font-medium text-text-primary block">Backend API Status</label>
            <div className="flex items-center gap-3 p-4 bg-bg-primary rounded-md border border-border-default">
              <div className={`w-2.5 h-2.5 rounded-full ${isMocksEnabled ? 'bg-accent-warning' : 'bg-accent-positive'}`}></div>
              <span className="text-body-sm text-text-secondary">
                {isMocksEnabled 
                  ? 'Running in Mock Mode (No backend connected)' 
                  : `Connected to ${apiUrl}`}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-body-sm font-medium text-text-primary block">Environment Configuration</label>
            <div className="p-4 bg-bg-primary rounded-md border border-border-default font-mono text-sm space-y-2">
              <div className="flex">
                <span className="text-text-muted w-48">VITE_API_BASE_URL:</span>
                <span className="text-accent-primary">{apiUrl}</span>
              </div>
              <div className="flex">
                <span className="text-text-muted w-48">VITE_USE_MOCKS:</span>
                <span className={isMocksEnabled ? 'text-accent-warning' : 'text-accent-positive'}>
                  {isMocksEnabled ? 'true' : 'false'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

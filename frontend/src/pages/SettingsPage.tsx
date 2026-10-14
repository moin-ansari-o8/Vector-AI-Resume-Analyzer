import { Settings } from 'lucide-react';

export function SettingsPage() {
  const isMocksEnabled = import.meta.env.VITE_USE_MOCKS !== 'false';
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
      
      <div className="bg-bg-elevated rounded-lg p-6 border border-border-default shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-bg-hover flex items-center justify-center border border-border-default">
            <Settings className="text-accent-primary" size={20} />
          </div>
          <div>
            <h2 className="text-h3 text-text-primary">Application Settings</h2>
            <p className="text-body-sm text-text-secondary">Manage your environment and API configurations.</p>
          </div>
        </div>
        
        <div className="space-y-6">
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
            <p className="text-caption text-text-secondary mt-2">
              To change these values, edit the .env file in the frontend directory and restart the development server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router';
import { ArrowLeft, Save, Download } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { ImprovementWorkspace } from '@/components/improvement/ImprovementWorkspace';
import { ROUTES } from '@/constants/routes';

export function ResumeImprovementPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-8">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-bg-primary shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.ANALYSIS)}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors duration-fast"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-text-primary truncate">
              Resume Improvement
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">Optimizing for: Senior Backend Engineer</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" icon={<Download size={14} />}>
            Export PDF
          </Button>
          <Button variant="primary" size="sm" icon={<Save size={14} />}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <ImprovementWorkspace />
      </div>
    </div>
  );
}

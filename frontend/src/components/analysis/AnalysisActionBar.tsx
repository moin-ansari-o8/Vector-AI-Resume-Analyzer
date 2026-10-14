import { useNavigate } from 'react-router';
import { Button } from '../shared/Button';
import { PenTool, MessageSquare, Download, Share2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface AnalysisActionBarProps {
  resumeId: string;
}

export function AnalysisActionBar({ resumeId }: AnalysisActionBarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-t border-border-default">
      <Button 
        variant="primary" 
        icon={<PenTool size={16} />}
        onClick={() => navigate(`${ROUTES.IMPROVEMENT}?resumeId=${resumeId}`)}
      >
        Improve Resume
      </Button>
      
      <Button 
        variant="secondary" 
        icon={<MessageSquare size={16} />}
        onClick={() => {}}
      >
        Ask AI Chat
      </Button>
      
      <div className="flex-1" />
      
      <Button 
        variant="ghost" 
        icon={<Share2 size={16} />}
      >
        Share
      </Button>
      
      <Button 
        variant="ghost" 
        icon={<Download size={16} />}
      >
        Export PDF
      </Button>
    </div>
  );
}

import { FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DocumentViewerProps {
  resumeId: string;
  className?: string;
}

export function DocumentViewer({ resumeId, className }: DocumentViewerProps) {
  return (
    <div className={cn("flex flex-col h-full bg-bg-secondary border border-border-default rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-bg-primary">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-text-muted" />
          <span className="text-sm font-medium text-text-primary">Original Document</span>
        </div>
        <span className="text-xs text-text-muted">PDF</span>
      </div>
      
      {/* Mock PDF Viewer Area */}
      <div className="flex-1 p-8 bg-bg-hover overflow-y-auto">
        <div className="max-w-3xl mx-auto min-h-[800px] bg-white text-black p-12 shadow-sm rounded">
          {/* Extremely basic mock of a document rendering */}
          <div className="space-y-6 opacity-80">
            <div className="border-b-2 border-gray-300 pb-4">
              <h1 className="text-3xl font-bold font-serif">Candidate Document</h1>
              <p className="text-gray-600 mt-2">ID: {resumeId}</p>
            </div>
            
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            
            <div className="pt-8 space-y-4">
              <h2 className="text-xl font-bold font-serif">Experience</h2>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-11/12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

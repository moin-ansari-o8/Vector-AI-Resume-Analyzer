import { useState } from 'react';
import { Tabs } from '../shared/Tabs';
import { Button } from '../shared/Button';
import { useToast } from '../shared/Toast';
import { useJobStore } from '@/stores/useJobStore';
import { jobService } from '@/services/job.service';

export function JobInputForm() {
  const [activeTab, setActiveTab] = useState('text');
  const [jobTitle, setJobTitle] = useState('');
  const [jobText, setJobText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const addJob = useJobStore(state => state.addJob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      addToast('Job title is required', 'error');
      return;
    }
    if (activeTab === 'text' && !jobText.trim()) return;
    if (activeTab === 'url' && !jobUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const description = activeTab === 'text' ? jobText : `Job URL: ${jobUrl}`;
      const newJob = await jobService.create({
        title: jobTitle,
        description: description,
        company: "Unknown Company"
      });
      addJob(newJob);
      addToast('Job description analyzed and saved successfully.', 'success');
      setJobTitle('');
      setJobText('');
      setJobUrl('');
    } catch (error) {
      console.error(error);
      addToast('Failed to add job', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border-default">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Add New Job</h3>
      </div>
      
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { label: 'Paste Text', value: 'text' },
          { label: 'Enter URL', value: 'url' },
        ]}
        className="px-4"
      />
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Job Title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="w-full h-10 px-3 bg-bg-primary border border-border-default rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
          />
        </div>

        {activeTab === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Job Description</label>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-40 p-3 bg-bg-primary border border-border-default rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all resize-none"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Job URL</label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://company.com/careers/job-123"
              className="w-full h-10 px-3 bg-bg-primary border border-border-default rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
            />
            <p className="text-xs text-text-muted mt-2">
              Our AI will attempt to extract the job requirements directly from the page.
            </p>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            variant="primary" 
            loading={isSubmitting}
            disabled={activeTab === 'text' ? !jobText.trim() : !jobUrl.trim()}
          >
            Analyze & Save
          </Button>
        </div>
      </form>
    </div>
  );
}

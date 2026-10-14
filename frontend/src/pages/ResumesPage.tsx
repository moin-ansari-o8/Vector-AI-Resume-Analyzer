import { useEffect } from 'react';
import { UploadZone } from '@/components/shared/UploadZone';
import { ResumeTable } from '@/components/resume/ResumeTable';
import { useResumeUpload } from '@/hooks/useResumeUpload';
import { resumeService } from '@/services/resume.service';
import { useResumeStore } from '@/stores/useResumeStore';

export function ResumesPage() {
  const { mutate: uploadResume, isPending } = useResumeUpload();
  const resumes = useResumeStore((state) => state.resumes);
  const setResumes = useResumeStore((state) => state.setResumes);

  useEffect(() => {
    // Initial fetch
    resumeService.getAll().then(setResumes);
  }, [setResumes]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Resumes</h1>
      </div>

      <section>
        <UploadZone
          onFileSelect={(file) => uploadResume(file)}
        />
        {isPending && <p className="text-sm text-text-muted mt-2">Uploading...</p>}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-medium text-text-primary">Resume Database</h2>
        </div>
        <ResumeTable resumes={resumes} />
      </section>
    </div>
  );
}

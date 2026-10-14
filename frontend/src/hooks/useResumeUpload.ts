import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '@/services/resume.service';
import { useResumeStore } from '@/stores/useResumeStore';
import { useToast } from '@/components/shared/Toast';

export function useResumeUpload() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const setResumes = useResumeStore((state) => state.setResumes);

  return useMutation({
    mutationFn: (file: File) => resumeService.upload(file),
    onSuccess: (data) => {
      addToast(data.message || 'Resume uploaded successfully', 'success');
      // Re-sync all resumes in store
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      resumeService.getAll().then(setResumes);
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to upload resume', 'error');
    },
  });
}


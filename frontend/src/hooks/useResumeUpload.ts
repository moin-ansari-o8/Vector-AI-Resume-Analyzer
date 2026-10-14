import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '@/services/resume.service';
import { useToast } from '@/components/shared/Toast';

export function useResumeUpload() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (file: File) => resumeService.upload(file),
    onSuccess: (data) => {
      addToast(data.message || 'Resume uploaded successfully', 'success');
      // Invalidate resumes list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to upload resume', 'error');
    },
  });
}

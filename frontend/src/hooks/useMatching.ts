import { useQuery } from '@tanstack/react-query';
import { matchingService } from '@/services/matching.service';

export function useJobMatches(jobId: string | null) {
  return useQuery({
    queryKey: ['matches', 'job', jobId],
    queryFn: () => matchingService.getTopMatchesForJob(jobId!),
    enabled: !!jobId,
  });
}

export function useResumeMatches(resumeId: string | null) {
  return useQuery({
    queryKey: ['matches', 'resume', resumeId],
    queryFn: () => matchingService.getTopMatchesForResume(resumeId!),
    enabled: !!resumeId,
  });
}

export function useDetailedMatch(resumeId: string | null, jobId: string | null) {
  return useQuery({
    queryKey: ['matches', 'detail', resumeId, jobId],
    queryFn: () => matchingService.getDetailedMatch(resumeId!, jobId!),
    enabled: !!resumeId && !!jobId,
  });
}

import { useQuery } from '@tanstack/react-query';

// Since we mock the matching details to include skill gap, 
// this is a specialized hook that derives the gap directly from detailed match.
// Note: In a real backend, this might be a separate API endpoint.
import { useDetailedMatch } from './useMatching';

export function useSkillGap(resumeId: string | null, jobId: string | null) {
  const query = useDetailedMatch(resumeId, jobId);

  return {
    ...query,
    data: query.data ? query.data.skillSignals : undefined,
  };
}

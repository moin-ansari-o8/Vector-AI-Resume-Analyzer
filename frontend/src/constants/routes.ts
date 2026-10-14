export const ROUTES = {
  HOME: '/',
  RESUMES: '/resumes',
  RESUME_DETAIL: (id: string) => `/resumes/${id}`,
  JOBS: '/jobs',
  MATCH_RESULTS: (id: string) => `/jobs/${id}/matches`,
  ANALYSIS: '/analysis',
  IMPROVEMENT: '/improvement',
  SETTINGS: '/settings',
} as const;

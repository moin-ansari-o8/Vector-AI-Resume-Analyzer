import { apiClient } from './client';

export const ingestionApi = {
  ingestJobs: () =>
    apiClient.post<any>('/ingestion/jobs').then(res => res.data),
};

export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true', // Default to false (connect to real backend DB)
} as const;


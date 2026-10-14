import { BrowserRouter, Routes, Route } from 'react-router';
import { ROUTES } from '@/constants/routes';

// Layouts
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ToastProvider } from '@/components/shared/Toast';

// Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { ResumesPage } from '@/pages/ResumesPage';
import { ResumeDetailPage } from '@/pages/ResumeDetailPage';
import { JobsPage } from '@/pages/JobsPage';
import { MatchResultsPage } from '@/pages/MatchResultsPage';
import { AnalysisStudioPage } from '@/pages/AnalysisStudioPage';
import { ResumeImprovementPage } from '@/pages/ResumeImprovementPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRouter() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.HOME} element={<DashboardPage />} />
            <Route path={ROUTES.RESUMES} element={<ResumesPage />} />
            <Route path={ROUTES.RESUME_DETAIL(':id')} element={<ResumeImprovementPage />} />
            <Route path={ROUTES.JOBS} element={<JobsPage />} />

            <Route path={ROUTES.MATCH_RESULTS(':id')} element={<MatchResultsPage />} />
            <Route path={ROUTES.ANALYSIS} element={<AnalysisStudioPage />} />
            <Route path={ROUTES.IMPROVEMENT} element={<ResumeImprovementPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

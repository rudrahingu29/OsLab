import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';

const LandingPage = lazy(() => import('../features/landing/LandingPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const OSLabPage = lazy(() => import('../features/os-lab/pages/OSLabPage'));
const CPUSchedulingLab = lazy(() => import('../features/os-lab/labs/cpu-scheduling/CPUSchedulingLab'));
const MemoryManagementLab = lazy(() => import('../features/os-lab/labs/memory-management/MemoryManagementLab'));
const DiskSchedulingLab = lazy(() => import('../features/os-lab/labs/disk-scheduling/DiskSchedulingLab'));

const LearnPage = lazy(() => import('../features/learn/pages/LearnPage'));
const TopicPage = lazy(() => import('../features/learn/pages/TopicPage'));
const QuizPage = lazy(() => import('../features/quiz/pages/QuizPage'));
const MiniOSPage = lazy(() => import('../features/mini-os/pages/MiniOSPage'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const NotFoundPage = lazy(() => import('../features/not-found/NotFoundPage'));


import { useRouteError, useNavigate } from 'react-router-dom';

const RouteErrorBoundary: React.FC = () => {
  const error: any = useRouteError();
  const navigate = useNavigate();
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-primary)' }}>
      <h2>Application Error</h2>
      <p style={{ color: 'var(--color-text-muted)', margin: '1rem 0' }}>
        {error?.message || 'An unexpected error occurred in the application.'}
      </p>
      <button 
        onClick={() => navigate('/mini-os')} 
        style={{ padding: '8px 16px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        Reload Mini-OS
      </button>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
      },
      {
        path: 'learn',
        element: <ProtectedRoute><LearnPage /></ProtectedRoute>
      },
      {
        path: 'learn/:topicSlug',
        element: <ProtectedRoute><TopicPage /></ProtectedRoute>
      },
      {
        path: 'quiz/:topicSlug',
        element: <ProtectedRoute><QuizPage /></ProtectedRoute>
      },
      {
        path: 'mini-os',
        element: <ProtectedRoute><MiniOSPage /></ProtectedRoute>
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      {
        path: 'os-lab',
        element: <ProtectedRoute><OSLabPage /></ProtectedRoute>
      },
      {
        path: 'os-lab/cpu-scheduling',
        element: <ProtectedRoute><CPUSchedulingLab /></ProtectedRoute>
      },
      {
        path: 'os-lab/memory-management',
        element: <ProtectedRoute><MemoryManagementLab /></ProtectedRoute>
      },
      {
        path: 'os-lab/disk-scheduling',
        element: <ProtectedRoute><DiskSchedulingLab /></ProtectedRoute>
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

export default router;

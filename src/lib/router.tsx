import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
]);

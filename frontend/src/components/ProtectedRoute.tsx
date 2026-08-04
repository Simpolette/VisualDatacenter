import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface ProtectedRouteProps {
  requiredRole?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { isAuthenticated, hasRole } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400">Authentication is required to access this page.</p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-slate-100">
        <div className="text-center max-w-md p-6 bg-slate-800 rounded-lg border border-slate-700 shadow-xl">
          <div className="text-amber-400 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">403 - Permission Denied</h1>
          <p className="text-slate-400 mb-6">
            You do not have the required permissions ({requiredRole}) to access this page.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-md transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

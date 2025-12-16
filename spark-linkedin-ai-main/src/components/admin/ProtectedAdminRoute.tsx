import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isAuthenticated, isLoading, admin } = useAdmin();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !admin) {
    // Clear any stale token
    localStorage.removeItem('adminToken');
    return <Navigate to="/admin/login" replace />;
  }

  // Render children only when authenticated
  return <>{children}</>;
}


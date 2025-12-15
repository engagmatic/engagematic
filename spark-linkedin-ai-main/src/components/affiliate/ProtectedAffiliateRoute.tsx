import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/services/api';

interface ProtectedAffiliateRouteProps {
  children: React.ReactNode;
}

export function ProtectedAffiliateRoute({ children }: ProtectedAffiliateRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const affiliateToken = localStorage.getItem('affiliateToken');
      
      if (!affiliateToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token by trying to get affiliate profile
      try {
        const response = await api.getAffiliateProfile();
        if (response.success) {
          setIsAuthenticated(true);
        } else {
          // Invalid token, clear it
          localStorage.removeItem('affiliateToken');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Token invalid or expired, clear it
        localStorage.removeItem('affiliateToken');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50/50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/affiliate/login" replace />;
  }

  return <>{children}</>;
}


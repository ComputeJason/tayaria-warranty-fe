import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface MasterProtectedRouteProps {
  children: React.ReactNode;
}

export const MasterProtectedRoute = ({ children }: MasterProtectedRouteProps) => {
  const { isMasterAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tayaria-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-tayaria-yellow" />
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isMasterAuthenticated) {
    // Redirect to login page while saving the attempted URL
    return <Navigate to="/master/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 
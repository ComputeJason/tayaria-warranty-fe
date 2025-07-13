import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

export const AuthenticatedRoute = ({ children }: AuthenticatedRouteProps) => {
  const { isAuthenticated, isMasterAuthenticated, isLoading } = useAuth();
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

  // Check if we're on a master route
  const isMasterRoute = location.pathname.startsWith('/master');

  // Redirect authenticated users based on their role
  if (isMasterRoute && isMasterAuthenticated) {
    return <Navigate to="/master/claims" replace />;
  }
  
  if (!isMasterRoute && isAuthenticated) {
    return <Navigate to="/admin/claims" replace />;
  }

  return <>{children}</>;
}; 
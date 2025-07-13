import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

export const AuthenticatedRoute = ({ children }: AuthenticatedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

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

  if (isAuthenticated) {
    // If user is already authenticated, redirect to claims
    return <Navigate to="/admin/claims" replace />;
  }

  return <>{children}</>;
}; 
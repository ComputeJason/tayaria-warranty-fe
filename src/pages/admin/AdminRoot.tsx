import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const AdminRoot = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="text-gray-700 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/admin/claims' : '/admin/login'} replace />;
};

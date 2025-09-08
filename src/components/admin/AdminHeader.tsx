import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  title: string;
  showBack?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/admin/login');
  };

  return (
    <div className="flex items-center justify-between p-4 bg-yellow-300 border-b border-yellow-300">
      <div className="flex items-center">
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="mr-2 text-red-600 hover:text-red-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-gray-900 text-xl font-semibold">{title}</h1>
      </div>
      <button 
        onClick={handleLogout}
        className="text-red-600 hover:text-red-700 flex items-center"
      >
        <LogOut className="h-5 w-5 mr-1" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default AdminHeader;

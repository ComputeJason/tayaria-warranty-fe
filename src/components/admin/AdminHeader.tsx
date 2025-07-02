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
    <div className="flex items-center justify-between p-4 bg-tayaria-darkgray">
      <div className="flex items-center">
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="mr-2 text-white hover:text-tayaria-yellow"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-white text-xl font-semibold">{title}</h1>
      </div>
      <button 
        onClick={handleLogout}
        className="text-white hover:text-tayaria-red flex items-center"
      >
        <LogOut className="h-5 w-5 mr-1" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default AdminHeader;

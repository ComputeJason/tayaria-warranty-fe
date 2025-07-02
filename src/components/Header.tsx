
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

const Header = ({ showBack = false, title = '' }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="flex items-center justify-between p-4 bg-tayaria-black">
      <div className="flex items-center">
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="mr-2 text-white hover:text-tayaria-yellow"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        )}
        {!showBack && (
          <div className="h-10 w-10">
            <img src="/lovable-uploads/ef1b240f-abaf-4df5-bfc8-43b7411279d5.png" alt="Tayaria Logo" className="h-full w-full object-contain" />
          </div>
        )}
        {isHomePage && !title && (
          <h1 className="text-tayaria-yellow text-xl font-bold ml-2">TAYARIA</h1>
        )}
        {title && <h1 className="text-white text-xl font-semibold ml-2">{title}</h1>}
      </div>
      <button className="text-white hover:text-tayaria-yellow">
        <Bell className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Header;

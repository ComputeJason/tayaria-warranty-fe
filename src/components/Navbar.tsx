
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-tayaria-darkgray border-t border-tayaria-gray w-full py-3 px-4 flex justify-around items-center">
      <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-tayaria-yellow' : 'text-white'}`}>
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link to="/retailer-location" className={`flex flex-col items-center ${location.pathname === '/retailer-location' ? 'text-tayaria-yellow' : 'text-white'}`}>
        <MapPin className="h-6 w-6" />
        <span className="text-xs mt-1">Retailer Location</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-tayaria-yellow' : 'text-white'}`}>
        <User className="h-6 w-6" />
        <span className="text-xs mt-1">My Profile</span>
      </Link>
    </div>
  );
};

export default Navbar;

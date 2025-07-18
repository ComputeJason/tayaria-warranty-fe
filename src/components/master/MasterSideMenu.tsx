import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, Menu, LayoutDashboard, UserPlus, ShieldCheck } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MasterSideMenuProps {
  onCollapseChange: (isCollapsed: boolean) => void;
}

const MasterSideMenu: React.FC<MasterSideMenuProps> = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange(newState);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-tayaria-gray">
        {!isCollapsed && <h2 className="text-white font-semibold">Master Panel</h2>}
        <button
          onClick={handleCollapse}
          className="text-gray-400 hover:text-white transition-colors hidden md:block"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="p-2">
        <Link
          to="/master/claims"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            location.pathname === '/master/claims'
              ? 'bg-tayaria-yellow/10 text-tayaria-yellow'
              : 'text-gray-400 hover:bg-tayaria-gray/10 hover:text-white'
          }`}
        >
          <FileText className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Manage Claims</span>}
        </Link>
        {/* Temporarily commented out until feature is ready
        <Link
          to="/master/warranties"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            location.pathname === '/master/warranties'
              ? 'bg-tayaria-yellow/10 text-tayaria-yellow'
              : 'text-gray-400 hover:bg-tayaria-gray/10 hover:text-white'
          }`}
        >
          <ShieldCheck className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Manage Warranties</span>}
        </Link>
        <Link
          to="/master/dashboard"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            location.pathname === '/master/dashboard'
              ? 'bg-tayaria-yellow/10 text-tayaria-yellow'
              : 'text-gray-400 hover:bg-tayaria-gray/10 hover:text-white'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">View Dashboard</span>}
        </Link>
        */}
        <Link
          to="/master/create-retail"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            location.pathname === '/master/create-retail'
              ? 'bg-tayaria-yellow/10 text-tayaria-yellow'
              : 'text-gray-400 hover:bg-tayaria-gray/10 hover:text-white'
          }`}
        >
          <UserPlus className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Create Retail Account</span>}
        </Link>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Side Menu */}
      <div className={`fixed left-0 top-0 h-full bg-tayaria-darkgray border-r border-tayaria-gray transition-all duration-300 hidden md:block ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <NavContent />
      </div>

      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-tayaria-darkgray border-b border-tayaria-gray flex items-center justify-between px-4 md:hidden z-50">
        <h2 className="text-white font-semibold">Master Panel</h2>
        <Sheet>
          <SheetTrigger asChild>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] p-0 bg-tayaria-darkgray border-r border-tayaria-gray">
            <SheetHeader className="p-4 border-b border-tayaria-gray">
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MasterSideMenu; 
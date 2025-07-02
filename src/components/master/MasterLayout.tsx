import React, { useState } from 'react';
import MasterSideMenu from './MasterSideMenu';

interface MasterLayoutProps {
  children: React.ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({ children }) => {
  const [isSideMenuCollapsed, setIsSideMenuCollapsed] = useState(true);

  return (
    <div className="flex min-h-screen bg-tayaria-black">
      <MasterSideMenu onCollapseChange={setIsSideMenuCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${
        isSideMenuCollapsed ? 'md:ml-16' : 'md:ml-64'
      }`}>
        <div className="pt-14 md:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MasterLayout; 
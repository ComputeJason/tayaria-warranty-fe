import React, { useState } from 'react';
import AdminSideMenu from './AdminSideMenu';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSideMenuCollapsed, setIsSideMenuCollapsed] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideMenu onCollapseChange={setIsSideMenuCollapsed} />
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

export default AdminLayout;

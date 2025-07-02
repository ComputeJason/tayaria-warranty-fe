import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
  token: string;
}

interface MasterUser {
    id: string;
    username: string;
  role: 'master';
    token: string;
}

interface AuthContextType {
  adminSession: AdminUser | null;
  masterSession: MasterUser | null;
  setAdminSession: (session: AdminUser | null) => void;
  setMasterSession: (session: MasterUser | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminSession, setAdminSession] = useState<AdminUser | null>(null);
  const [masterSession, setMasterSession] = useState<MasterUser | null>(null);

  const signOut = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('masterToken');
    localStorage.removeItem('masterInfo');
    setAdminSession(null);
    setMasterSession(null);
  };

  return (
    <AuthContext.Provider value={{ 
      adminSession, 
      masterSession, 
      setAdminSession, 
      setMasterSession,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

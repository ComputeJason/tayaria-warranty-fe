import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type LoginResponse } from '@/services/authApi';

interface AuthContextType {
  adminSession: LoginResponse | null;
  masterSession: LoginResponse | null;
  setAdminSession: (session: LoginResponse | null) => void;
  setMasterSession: (session: LoginResponse | null) => void;
  isAuthenticated: boolean;
  isMasterAuthenticated: boolean;
  isLoading: boolean;
  signOut: (role?: 'admin' | 'master') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminSession, setAdminSession] = useState<LoginResponse | null>(null);
  const [masterSession, setMasterSession] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Check admin session
      const adminToken = localStorage.getItem('adminToken');
      const adminShopData = localStorage.getItem('adminShop');
      
      if (adminToken && adminShopData) {
        try {
          const shop = JSON.parse(adminShopData);
          setAdminSession({ token: adminToken, shop });
        } catch (error) {
          console.error('Failed to parse admin session:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminShop');
        }
      }

      // Check master session
      const masterToken = localStorage.getItem('masterToken');
      const masterShopData = localStorage.getItem('masterShop');
      
      if (masterToken && masterShopData) {
        try {
          const shop = JSON.parse(masterShopData);
          setMasterSession({ token: masterToken, shop });
        } catch (error) {
          console.error('Failed to parse master session:', error);
          localStorage.removeItem('masterToken');
          localStorage.removeItem('masterShop');
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signOut = (role: 'admin' | 'master' = 'admin') => {
    if (role === 'admin' || !role) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminShop');
      setAdminSession(null);
    }
    if (role === 'master' || !role) {
      localStorage.removeItem('masterToken');
      localStorage.removeItem('masterShop');
      setMasterSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      adminSession,
      masterSession,
      setAdminSession,
      setMasterSession,
      isAuthenticated: !!adminSession?.token,
      isMasterAuthenticated: !!masterSession?.token,
      isLoading,
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

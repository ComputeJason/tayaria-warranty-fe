import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Shop {
  id: string;
  shop_name: string;
  address: string;
  contact: string;
  username: string;
  role: "admin" | "master";
  created_at: string;
  updated_at: string;
}

interface AdminSession {
  token: string;
  shop: Shop;
}

interface AuthContextType {
  adminSession: AdminSession | null;
  setAdminSession: (session: AdminSession | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  // Initialize session from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const shopData = localStorage.getItem('adminShop');
      
      if (token && shopData) {
        try {
          const shop = JSON.parse(shopData);
          setAdminSession({ token, shop });
        } catch (error) {
          console.error('Failed to parse admin session:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminShop');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signOut = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminShop');
    setAdminSession(null);
  };

  return (
    <AuthContext.Provider value={{ 
      adminSession,
      setAdminSession,
      isAuthenticated: !!adminSession?.token,
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

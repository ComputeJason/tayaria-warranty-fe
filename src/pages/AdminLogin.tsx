import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/authApi';
import { Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setAdminSession } = useAuth();

  // Get the page that the user tried to visit
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/claims';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authApi.adminLogin({ username, password });
      
      // Store token and shop info in localStorage
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminShop', JSON.stringify(response.shop));
      
      // Update auth context
      setAdminSession(response);
      
      toast({ 
        title: 'Success', 
        description: `Welcome back, ${response.shop.shop_name}!` 
      });
      
      // Navigate to the page they tried to visit or claims page
      navigate(from);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-400 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border-2 border-yellow-300">
        <h1 className="text-2xl font-bold text-red-700 mb-6 text-center">Tayaria Warranty Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">Username</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="bg-white text-gray-900 border-gray-300 focus:border-red-500 focus:ring-red-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-white text-gray-900 border-gray-300 focus:border-red-500 focus:ring-red-500"
              required
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login as Admin'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

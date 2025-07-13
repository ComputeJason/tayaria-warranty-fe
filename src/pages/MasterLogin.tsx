import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/authApi';
import { Loader2 } from 'lucide-react';

const MasterLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setMasterSession } = useAuth();

  // Get the page that the user tried to visit
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/master/claims';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authApi.masterLogin({ username, password });
      
      // Store token and shop info in localStorage
      localStorage.setItem('masterToken', response.token);
      localStorage.setItem('masterShop', JSON.stringify(response.shop));
      
      // Update auth context
      setMasterSession(response);
      
      toast({ 
        title: 'Success', 
        description: `Welcome back, ${response.shop.shopName}!` 
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
    <div className="min-h-screen bg-tayaria-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-tayaria-darkgray rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-tayaria-yellow mb-6 text-center">Master Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-white mb-2">Username</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter master username"
              className="bg-tayaria-gray text-white border-tayaria-gray"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-white mb-2">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-tayaria-gray text-white border-tayaria-gray"
              required
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-tayaria-yellow hover:bg-tayaria-yellow/90 text-black"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login as Master'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MasterLogin; 
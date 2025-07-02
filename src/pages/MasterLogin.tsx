import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const MasterLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setMasterSession } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful login response
      const mockResponse = {
        id: '1',
        username: username,
        role: 'master' as const,
        token: 'mock-token-' + Date.now()
      };

      // Store token and master info in localStorage
      localStorage.setItem('masterToken', mockResponse.token);
      localStorage.setItem('masterInfo', JSON.stringify(mockResponse));
      setMasterSession(mockResponse);
      
      toast({ title: 'Success', description: 'Logged in as master!' });
      navigate('/master/claims');
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
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
        <p className="text-gray-400 text-sm mb-4 text-center">
          For demo purposes, any username and password will work
        </p>
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
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-tayaria-yellow hover:bg-tayaria-yellow/90 text-black"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Master'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MasterLogin; 
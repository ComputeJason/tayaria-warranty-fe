import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAdminSession } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      // Store token and admin info in localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminInfo', JSON.stringify(data.admin));
      setAdminSession({ ...data.admin, token: data.token });
      toast({ title: 'Success', description: 'Logged in as admin!' });
      navigate('/admin/claims');
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
        <h1 className="text-2xl font-bold text-tayaria-yellow mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-white mb-2">Username</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
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
            {loading ? 'Logging in...' : 'Login as Admin'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 
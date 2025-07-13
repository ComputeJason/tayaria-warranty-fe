import { getApiUrl } from '@/config/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Shop {
  id: string;
  shopName: string;
  address: string;
  contact: string;
  username: string;
  role: "admin" | "master";
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  shop: Shop;
}

class AuthApi {
  async adminLogin(request: LoginRequest): Promise<LoginResponse> {
    if (import.meta.env.DEV) {
      console.log('🔄 Admin login attempt:', { username: request.username });
    }

    const response = await fetch(getApiUrl('admin/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid credentials');
      }
      if (response.status === 400) {
        throw new Error('Invalid request');
      }
      
      if (import.meta.env.DEV) {
        console.error('❌ Admin login failed:', { status: response.status });
      }
      
      throw new Error('Failed to login');
    }

    const result = await response.json();
    
    if (import.meta.env.DEV) {
      console.log('✅ Admin login successful');
    }
    
    return result;
  }

  async masterLogin(request: LoginRequest): Promise<LoginResponse> {
    if (import.meta.env.DEV) {
      console.log('🔄 Master login attempt:', { username: request.username });
    }

    const response = await fetch(getApiUrl('master/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid credentials');
      }
      if (response.status === 400) {
        throw new Error('Invalid request');
      }
      
      if (import.meta.env.DEV) {
        console.error('❌ Master login failed:', { status: response.status });
      }
      
      throw new Error('Failed to login');
    }

    const result = await response.json();
    
    if (import.meta.env.DEV) {
      console.log('✅ Master login successful');
    }
    
    return result;
  }

  // Helper to get auth headers for protected routes
  getAuthHeaders(role: 'admin' | 'master' = 'admin'): HeadersInit {
    const token = localStorage.getItem(`${role}Token`);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Check if the current token is valid
  async validateToken(role: 'admin' | 'master' = 'admin'): Promise<boolean> {
    const token = localStorage.getItem(`${role}Token`);
    if (!token) return false;

    try {
      const response = await fetch(getApiUrl(`${role}/validate`), {
        headers: this.getAuthHeaders(role),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const authApi = new AuthApi(); 
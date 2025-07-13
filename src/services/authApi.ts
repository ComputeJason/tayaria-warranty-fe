import { API_BASE_URL } from '@/config';

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
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL || 'http://localhost:8080';
  }

  async adminLogin(request: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/admin/login`, {
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
      throw new Error('Failed to login');
    }

    return response.json();
  }

  async masterLogin(request: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/master/login`, {
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
      throw new Error('Failed to login');
    }

    return response.json();
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
      const response = await fetch(`${this.baseUrl}/api/${role}/validate`, {
        headers: this.getAuthHeaders(role),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const authApi = new AuthApi(); 
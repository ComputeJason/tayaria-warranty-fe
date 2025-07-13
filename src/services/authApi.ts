import { API_BASE_URL } from '@/config';

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  shop: {
    id: string;
    shop_name: string;
    address: string;
    contact: string;
    username: string;
    role: "admin" | "master";
    created_at: string;
    updated_at: string;
  }
}

class AuthApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL || 'http://localhost:8080';
  }

  async adminLogin(request: AdminLoginRequest): Promise<AdminLoginResponse> {
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

  // Helper to get auth headers for protected routes
  getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Check if the current token is valid
  async validateToken(): Promise<boolean> {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;

    try {
      const response = await fetch(`${this.baseUrl}/api/admin/validate`, {
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const authApi = new AuthApi(); 
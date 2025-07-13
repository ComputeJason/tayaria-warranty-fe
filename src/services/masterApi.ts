import { getApiUrl } from '@/config/api';
import { authApi } from '@/services/authApi';

// Types matching the backend API
export interface CreateRetailAccountRequest {
  shop_name: string;
  address: string;
  contact?: string;
  username: string;
  password: string;
}

export interface CreateRetailAccountResponse {
  id: string;
  shop_name: string;
  address: string;
  contact: string;
  username: string;
  role: "admin";
  created_at: string;
}

export interface RetailAccount {
  id: string;
  shop_name: string;
  address: string;
  contact: string;
  username: string;
  password: string;
  role: "admin";
  created_at: string;
  updated_at: string;
}

// Frontend types (camelCase)
export interface FrontendRetailAccount {
  id: string;
  shopName: string;
  address: string;
  contact: string;
  username: string;
  password: string;
  dateCreated: string;
  status: 'Active' | 'Inactive';
}

export interface FrontendFormData {
  shopName: string;
  address: string;
  contact: string;
  username: string;
  password: string;
}

// Helper function to convert frontend form data to backend format
export const convertFormDataToApiRequest = (formData: FrontendFormData): CreateRetailAccountRequest => {
  return {
    shop_name: formData.shopName,
    address: formData.address,
    contact: formData.contact || undefined,
    username: formData.username,
    password: formData.password
  };
};

// Helper function to convert backend account to frontend format
export const convertApiAccountToFrontend = (account: RetailAccount): FrontendRetailAccount => {
  return {
    id: account.id,
    shopName: account.shop_name,
    address: account.address,
    contact: account.contact || '', // Handle null/undefined contact
    username: account.username,
    password: account.password,
    dateCreated: formatDateToDDMMYYYY(account.created_at),
    status: 'Active' // Default to Active since backend doesn't provide status yet
  };
};

// Helper function to format ISO timestamp to DD-MM-YYYY
const formatDateToDDMMYYYY = (isoString: string): string => {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// API Functions
export const masterApi = {
  // Create a new retail account
  async createRetailAccount(data: CreateRetailAccountRequest): Promise<CreateRetailAccountResponse> {
    const url = getApiUrl('master/account');
    
    if (import.meta.env.DEV) {
      console.log('🔄 Creating retail account:', { url, data });
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: authApi.getAuthHeaders('master'),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to create retail accounts.');
      }
      if (response.status === 409) {
        throw new Error('Username already exists. Please choose a different username.');
      }
      if (response.status === 400) {
        throw new Error('Invalid request. Please check your input.');
      }
      
      const error = errorData.error || `Failed to create retail account: ${response.status}`;
      
      if (import.meta.env.DEV) {
        console.error('❌ Create account failed:', { status: response.status, error, errorData });
      }
      
      throw new Error(error);
    }

    const result = await response.json();
    
    if (import.meta.env.DEV) {
      console.log('✅ Account created successfully:', result);
    }
    
    return result;
  },

  // Get all retail accounts
  async getRetailAccounts(): Promise<RetailAccount[]> {
    const url = getApiUrl('master/account');
    
    if (import.meta.env.DEV) {
      console.log('🔄 Fetching retail accounts:', { url });
    }
    
    const response = await fetch(url, {
      headers: authApi.getAuthHeaders('master')
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to view retail accounts.');
      }
      
      const error = errorData.error || `Failed to fetch retail accounts: ${response.status}`;
      
      if (import.meta.env.DEV) {
        console.error('❌ Fetch accounts failed:', { status: response.status, error, errorData });
      }
      
      throw new Error(error);
    }

    const result = await response.json();
    
    if (import.meta.env.DEV) {
      console.log('✅ Accounts fetched successfully:', { count: result.length, accounts: result });
    }
    
    return result;
  }
}; 
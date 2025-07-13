import { getApiUrl } from '@/config/api';
import { authApi } from '@/services/authApi';

// Types matching the backend API
export interface CreateClaimRequest {
  customer_name: string;
  phone_number: string;
  email?: string;
  car_plate: string;
}

export interface ClaimResponse {
  id: string;
  warranty_id: string;
  shop_id: string;
  status: 'unacknowledged' | 'pending' | 'approved' | 'rejected';
  rejection_reason: string;
  date_settled: string | null;
  date_closed: string | null;
  customer_name: string;
  phone_number: string;
  email: string;
  car_plate: string;
  created_at: string;
  updated_at: string;
}

// Frontend types
export interface Claim {
  id: string;
  customer_name: string;
  phone_number: string;
  email: string;
  car_plate: string;
  status: 'unacknowledged' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  date_settled?: string;
  rejection_reason?: string;
  date_closed?: string;
}

// Helper function to convert frontend form data to backend API format
export const convertFormDataToCreateClaimRequest = (formData: {
  customer_name: string;
  phone_number: string;
  email: string;
  car_plate: string;
}): CreateClaimRequest => {
  return {
    customer_name: formData.customer_name,
    phone_number: formData.phone_number,
    email: formData.email || undefined,
    car_plate: formData.car_plate,
  };
};

// Helper function to convert backend API response to frontend format
export const convertApiResponseToFrontendClaim = (apiResponse: ClaimResponse): Claim => {
  return {
    id: apiResponse.id,
    customer_name: apiResponse.customer_name,
    phone_number: apiResponse.phone_number,
    email: apiResponse.email,
    car_plate: apiResponse.car_plate,
    status: apiResponse.status,
    created_at: apiResponse.created_at,
    date_settled: apiResponse.date_settled || undefined,
    rejection_reason: apiResponse.rejection_reason || undefined,
    date_closed: apiResponse.date_closed || undefined,
  };
};

// API Functions
export const claimsApi = {
  // Create a new claim
  async createClaim(data: CreateClaimRequest): Promise<ClaimResponse> {
    if (import.meta.env.DEV) {
      console.log('🔄 Creating claim:', { data });
    }

    const response = await fetch(getApiUrl('admin/claim'), {
      method: 'POST',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }
      const errorData = await response.json().catch(() => ({}));
      
      if (import.meta.env.DEV) {
        console.error('❌ Create claim failed:', { status: response.status, error: errorData });
      }
      
      throw new Error(errorData.error || `Failed to create claim: ${response.status}`);
    }

    const result = await response.json();
    
    if (import.meta.env.DEV) {
      console.log('✅ Claim created successfully:', result);
    }
    
    return result;
  },

  // Get all claims for the current shop (from JWT)
  async getCurrentShopClaims(): Promise<ClaimResponse[]> {
    if (import.meta.env.DEV) {
      console.log('🔄 Fetching claims');
    }

    const response = await fetch(getApiUrl('admin/claims'), {
      method: 'GET',
      headers: authApi.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to view claims.');
      }
      const errorData = await response.json().catch(() => ({}));
      
      if (import.meta.env.DEV) {
        console.error('❌ Fetch claims failed:', { status: response.status, error: errorData });
      }
      
      throw new Error(errorData.error || `Failed to fetch claims: ${response.status}`);
    }

    const result = await response.json();
    
    if (import.meta.env.DEV) {
      console.log('✅ Claims fetched successfully:', { count: result.length });
    }
    
    return result;
  },

  // Close a claim
  async closeClaim(claimId: string): Promise<ClaimResponse> {
    if (import.meta.env.DEV) {
      console.log('🔄 Closing claim:', { claimId });
    }

    const response = await fetch(getApiUrl(`admin/claim/${claimId}/close`), {
      method: 'POST',
      headers: authApi.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to close this claim.');
      }
      if (response.status === 400) {
        throw new Error('Can only close approved or rejected claims.');
      }
      if (response.status === 404) {
        throw new Error('Claim not found.');
      }
      const errorData = await response.json().catch(() => ({}));
      
      if (import.meta.env.DEV) {
        console.error('❌ Close claim failed:', { status: response.status, error: errorData });
      }
      
      throw new Error(errorData.error || `Failed to close claim: ${response.status}`);
    }

    const result = await response.json();
    
    if (import.meta.env.DEV) {
      console.log('✅ Claim closed successfully:', result);
    }
    
    return result;
  },
}; 
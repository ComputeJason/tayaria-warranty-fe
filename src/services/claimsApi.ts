import { API_BASE_URL } from '@/config';
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
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string;
  dateSettled: string | null;
  dateClosed: string | null;
  customerName: string;
  phoneNumber: string;
  email: string;
  carPlate: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend types
export interface Claim {
  id: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  carPlate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  dateSettled?: string;
  rejectionReason?: string;
  dateClosed?: string;
}

// Helper function to convert frontend form data to backend API format
export const convertFormDataToCreateClaimRequest = (formData: {
  customerName: string;
  phoneNumber: string;
  email: string;
  carPlate: string;
}): CreateClaimRequest => {
  return {
    customer_name: formData.customerName,
    phone_number: formData.phoneNumber,
    email: formData.email || undefined,
    car_plate: formData.carPlate,
  };
};

// Helper function to convert backend API response to frontend format
export const convertApiResponseToFrontendClaim = (apiResponse: ClaimResponse): Claim => {
  return {
    id: apiResponse.id,
    customerName: apiResponse.customerName,
    phoneNumber: apiResponse.phoneNumber,
    email: apiResponse.email,
    carPlate: apiResponse.carPlate,
    status: apiResponse.status,
    createdAt: apiResponse.createdAt,
    dateSettled: apiResponse.dateSettled || undefined,
    rejectionReason: apiResponse.rejectionReason || undefined,
    dateClosed: apiResponse.dateClosed || undefined,
  };
};

// API Functions
export const claimsApi = {
  // Create a new claim
  async createClaim(data: CreateClaimRequest): Promise<ClaimResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/claim`, {
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
      throw new Error(errorData.error || `Failed to create claim: ${response.status}`);
    }

    return response.json();
  },

  // Get all claims for the current shop (from JWT)
  async getCurrentShopClaims(): Promise<ClaimResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/claims`, {
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
      throw new Error(errorData.error || `Failed to fetch claims: ${response.status}`);
    }

    return response.json();
  },
}; 
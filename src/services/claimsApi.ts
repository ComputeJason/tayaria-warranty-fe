import { getApiUrl } from '@/config/api';

// Types matching the backend API
export interface CreateClaimRequest {
  customer_name: string;
  phone_number: string;
  email?: string;
  car_plate: string;
  shop_id: string;
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

// Frontend types (existing interface from AllClaims.tsx)
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

// Constants
const HARDCODED_SHOP_ID = '0b472d1e-888f-4924-9679-3faf77e6420d';

// Helper function to get shop ID (prepared for future configurability)
export const getShopId = (): string => {
  // TODO: In future, this could come from localStorage, context, or user session
  // For now, return hardcoded shop ID
  return HARDCODED_SHOP_ID;
};

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
    shop_id: getShopId(),
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

// Helper function to get auth headers (prepared for future authentication)
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // TODO: In future, add admin token authentication
  // const adminToken = localStorage.getItem('adminToken');
  // if (adminToken) {
  //   headers['Authorization'] = `Bearer ${adminToken}`;
  // }
  
  return headers;
};

// API Functions
export const claimsApi = {
  // Create a new claim
  async createClaim(data: CreateClaimRequest): Promise<ClaimResponse> {
    const response = await fetch(getApiUrl('user/claim'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create claim: ${response.status}`);
    }

    return response.json();
  },

  // Get all claims for a shop
  async getShopClaims(shopId: string): Promise<ClaimResponse[]> {
    const response = await fetch(getApiUrl(`user/claims/${shopId}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch claims: ${response.status}`);
    }

    return response.json();
  },

  // Convenience method to get claims for current shop
  async getCurrentShopClaims(): Promise<ClaimResponse[]> {
    return this.getShopClaims(getShopId());
  },
}; 
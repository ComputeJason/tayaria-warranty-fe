import { getApiUrl } from '@/config/api';

// Types matching the backend API
export interface CreateWarrantyRequest {
  name: string;
  phone_number: string;
  email?: string;
  purchase_date: string;
  car_plate: string;
  receipt: string;
}

export interface Warranty {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  purchase_date: string;
  expiry_date: string;
  car_plate: string;
  receipt: string;
  created_at: string;
  updated_at: string;
  is_used: boolean;
}

// Helper function to convert frontend form data to backend format
export const convertFormDataToApiRequest = (formData: any): CreateWarrantyRequest => {
  return {
    name: formData.name,
    phone_number: formData.contactNumber,
    email: formData.email,
    purchase_date: new Date(formData.purchaseDate).toISOString(),
    car_plate: formData.carPlate.toUpperCase(),
    receipt: formData.receipt || "https://example.com/receipt.pdf" // Fake URL for now
  };
};

// Helper function to convert backend warranty to frontend format
export const convertApiWarrantyToFrontend = (warranty: Warranty) => {
  return {
    id: warranty.id,
    carPlate: warranty.car_plate,
    registrationDate: warranty.created_at,
    expiryDate: warranty.expiry_date,
    purchaseDate: warranty.purchase_date,
    status: getWarrantyStatus(warranty.expiry_date),
    tyreDetails: "Tyre details not available", // Backend doesn't provide this yet
    notes: `Customer: ${warranty.name}, Phone: ${warranty.phone_number}`
  };
};

// Helper function to determine warranty status
const getWarrantyStatus = (expiryDate: string): 'active' | 'expired' | 'used' => {  
  const expiry = new Date(expiryDate);
  const now = new Date();
  
  if (expiry < now) {
    return 'expired';
  }
  
  // For now, assume all active warranties are not used
  // This logic can be enhanced when backend provides usage status
  return 'active';
};

// API Functions
export const warrantyApi = {
  // Register a new warranty
  async registerWarranty(data: CreateWarrantyRequest): Promise<Warranty> {
    const response = await fetch(getApiUrl('user/warranty'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create warranty: ${response.status}`);
    }

    return response.json();
  },

  // Get warranties by car plate
  async getWarrantiesByCarPlate(carPlate: string): Promise<Warranty[]> {
    const response = await fetch(getApiUrl(`user/warranties/car-plate/${encodeURIComponent(carPlate.toUpperCase())}`));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch warranties: ${response.status}`);
    }

    return response.json();
  }
}; 
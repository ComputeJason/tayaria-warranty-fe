import { getApiUrl } from '@/config/api';

export interface MasterClaim {
  id: string;
  warranty_id: string | null;
  shop_id: string;
  status: 'unacknowledged' | 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  dateSettled: string | null;
  dateClosed: string | null;
  customerName: string;
  phoneNumber: string;
  email: string | null;
  carPlate: string;
  createdAt: string;
  updatedAt: string;
  // Additional frontend fields
  shopName: string;
  shopContact: string;
  taggedWarrantyId?: string;
  tyreDetails?: TyreDetail[];
}

export interface TyreDetail {
  id: string;
  brand: string;
  size: string;
  cost: number;
}

class MasterClaimsApi {
  private getHeaders() {
    const token = localStorage.getItem('masterToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Transform API response to include frontend-specific fields
  private transformClaimResponse(claim: any): MasterClaim {
    return {
      ...claim,
      // Map warranty_id to taggedWarrantyId if exists
      taggedWarrantyId: claim.warranty_id || undefined,
      // TODO: Get shop details from a separate API call or context
      shopName: claim.shop_name || 'Tayaria Shop', // Use shop_name from API if available
      shopContact: claim.shop_contact || '+60321234567', // Use shop_contact from API if available
    };
  }

  async getMasterClaims(status: 'unacknowledged' | 'pending' | 'history'): Promise<MasterClaim[]> {
    if (import.meta.env.DEV) {
      console.log('🔄 Fetching master claims:', { status });
    }

    const response = await fetch(getApiUrl(`master/claims?status=${status}`), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to view claims.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch claims');
    }

    const claims = await response.json();
    return claims.map(this.transformClaimResponse);
  }

  async getMasterClaimById(claimId: string): Promise<MasterClaim> {
    if (import.meta.env.DEV) {
      console.log('🔄 Fetching master claim details:', { claimId });
    }

    const response = await fetch(getApiUrl(`master/claim/${claimId}`), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Claim not found');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch claim details');
    }

    const claim = await response.json();
    return this.transformClaimResponse(claim);
  }
}

export const masterClaimsApi = new MasterClaimsApi(); 
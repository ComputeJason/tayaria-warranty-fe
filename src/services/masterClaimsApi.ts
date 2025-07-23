import { getApiUrl } from '@/config/api';

export interface MasterClaim {
  id: string;
  warranty_id: string | null;
  shop_id: string;
  status: 'unacknowledged' | 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  date_settled: string | null;
  date_closed: string | null;
  customer_name: string;
  phone_number: string;
  email: string | null;
  car_plate: string;
  created_at: string;
  updated_at: string;
  // Additional frontend fields
  shop_name: string;
  shop_contact: string;
  tagged_warranty_id?: string;
  tyre_details?: TyreDetail[];
  supporting_doc_url?: string;
}

export interface TyreDetail {
  id: string;
  brand: string;
  size: string;
  tread_pattern: string;
}

export interface Warranty {
  id: string;
  name: string;
  phone_number: string;
  email: string | null;
  purchase_date: string;
  expiry_date: string;
  car_plate: string;
  receipt: string;
  created_at: string;
  updated_at: string;
}

export interface DetailedClaimResponse {
  claim: MasterClaim;
  warranty: Warranty | null;
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
      id: claim.id,
      warranty_id: claim.warranty_id,
      shop_id: claim.shop_id,
      status: claim.status,
      rejection_reason: claim.rejection_reason,
      date_settled: claim.date_settled,
      date_closed: claim.date_closed,
      customer_name: claim.customer_name,
      phone_number: claim.phone_number,
      email: claim.email || '-',
      car_plate: claim.car_plate,
      created_at: claim.created_at,
      updated_at: claim.updated_at,
      // Frontend specific fields
      shop_name: claim.shop_name || '-',
      shop_contact: claim.contact || '-',
      tagged_warranty_id: claim.warranty_id || undefined,
      tyre_details: claim.tyre_details,
      supporting_doc_url: claim.supporting_doc_url
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

  async getClaimDetails(claimId: string): Promise<DetailedClaimResponse> {
    if (import.meta.env.DEV) {
      console.log('🔄 Fetching claim details:', { claimId });
    }

    const response = await fetch(getApiUrl(`master/claim/${claimId}`), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Claim not found');
      }
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to view this claim.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch claim details');
    }

    const data = await response.json();
    return {
      claim: this.transformClaimResponse(data.claim),
      warranty: data.warranty
    };
  }
}

export const masterClaimsApi = new MasterClaimsApi(); 
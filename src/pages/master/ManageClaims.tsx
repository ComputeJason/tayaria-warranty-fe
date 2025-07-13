import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Tag, Check, X, Eye, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { masterClaimsApi, type MasterClaim, type TyreDetail } from '@/services/masterClaimsApi';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/config/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MasterLayout from '@/components/master/MasterLayout';
import MasterHeader from '@/components/master/MasterHeader';
import { type DetailedClaimResponse } from '@/services/masterClaimsApi';

// Remove the mock data and interfaces since we're using the ones from masterClaimsApi

const ManageClaims = () => {
  const [claims, setClaims] = useState<MasterClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'unacknowledged' | 'pending' | 'history'>('unacknowledged');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isViewWarrantyModalOpen, setIsViewWarrantyModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<MasterClaim | null>(null);
  const [selectedWarranty, setSelectedWarranty] = useState<any | null>(null); // Changed type to any as mockWarranties is removed
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null);
  const REJECTION_REASONS = [
    "Mechanical Failure",
    "Over Warranty Period",
    "Not Compliant - No Marking",
    "Not Compliant - Remaining Tread Depth <6mm"
  ] as const;
  const [rejectionReason, setRejectionReason] = useState<typeof REJECTION_REASONS[number]>("Mechanical Failure");
  
  // Tyre details form state
  const [tyreQuantity, setTyreQuantity] = useState<number>(1);
  const [tyreDetails, setTyreDetails] = useState<TyreDetail[]>([
    { id: '1', brand: '', size: '', cost: 0 }
  ]);

  // Add this to the state declarations at the top
  const [warranties, setWarranties] = useState<any[]>([]);
  const [loadingWarranties, setLoadingWarranties] = useState(false);
  const [loadingClaimDetails, setLoadingClaimDetails] = useState(false);
  const [detailedClaim, setDetailedClaim] = useState<DetailedClaimResponse | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Truncate text utility
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Handle auth errors
  const handleAuthError = (error: Error) => {
    if (error.message.includes('Authentication required') || 
        error.message.includes('permission')) {
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
      signOut();
      navigate('/master/login');
      return;
    }
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  };

  // Fetch claims based on current tab
  const fetchClaims = async (status: typeof currentTab) => {
    setLoading(true);
    try {
      const fetchedClaims = await masterClaimsApi.getMasterClaims(status);
      setClaims(fetchedClaims);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
      handleAuthError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch claims when tab changes
  useEffect(() => {
    fetchClaims(currentTab);
  }, [currentTab]);

  const handleTabChange = (value: string) => {
    setCurrentTab(value as typeof currentTab);
  };

  // Get warranties by car plate
  const getWarrantiesByCarPlate = async (carPlate: string) => {
    try {
      const response = await fetch(getApiUrl(`master/warranties/valid/${encodeURIComponent(carPlate)}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('masterToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No warranties found is a valid state
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch warranties: ${response.status}`);
      }

      const data = await response.json();
      return data.warranties;
    } catch (error) {
      console.error('Failed to fetch warranties:', error);
      handleAuthError(error as Error);
      return [];
    }
  };

  // Get warranty by ID
  const getWarrantyById = (warrantyId: string) => {
    // This function is no longer needed as mockWarranties is removed
    // If BE integration is ready, this will fetch from API
    return null; 
  };

  // Handle moving claim to pending
  const handleMoveToPending = async (claimId: string) => {
    try {
      const response = await fetch(getApiUrl(`master/claim/${claimId}/pending`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('masterToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to move claim to pending: ${response.status}`);
      }

      await response.json();
      
      // Refresh the claims list
      await fetchClaims(currentTab);
      
      toast({
        title: "Success",
        description: "Claim has been moved to pending status.",
      });
    } catch (error) {
      console.error('Failed to move claim to pending:', error);
      handleAuthError(error as Error);
    }
  };

  // Handle opening tag warranty modal
  const handleOpenTagModal = async (claim: MasterClaim) => {
    setSelectedClaim(claim);
    setIsTagModalOpen(true);
    setLoadingWarranties(true);
    
    try {
      const fetchedWarranties = await getWarrantiesByCarPlate(claim.car_plate);
      setWarranties(fetchedWarranties);
    } catch (error) {
      console.error('Failed to fetch warranties:', error);
    } finally {
      setLoadingWarranties(false);
    }
  };

  // Update handleTagWarranty to use the real API
  const handleTagWarranty = async (warrantyId: string) => {
    if (!selectedClaim) return;

    try {
      const response = await fetch(getApiUrl(`master/claim/${selectedClaim.id}/tag-warranty`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('masterToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ warranty_id: warrantyId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to tag warranty: ${response.status}`);
      }

      await response.json();
      
      // Refresh the claims list and close the modal
      await fetchClaims(currentTab);
      setIsTagModalOpen(false);
      setSelectedClaim(null);
      
      toast({
        title: "Success",
        description: "Warranty has been tagged to the claim.",
      });
    } catch (error) {
      console.error('Failed to tag warranty:', error);
      handleAuthError(error as Error);
    }
  };

  // Handle opening view warranty modal
  const handleViewWarranty = (warrantyId: string) => {
    const warranty = getWarrantyById(warrantyId);
    if (warranty) {
      setSelectedWarranty(warranty);
      setIsViewWarrantyModalOpen(true);
    }
  };

  // Handle opening confirmation modal
  const handleOpenConfirmModal = (claim: MasterClaim, action: 'accept' | 'reject') => {
    setSelectedClaim(claim);
    setConfirmAction(action);
    setRejectionReason("Mechanical Failure"); // Set default value
    if (action === 'accept') {
      resetTyreForm();
    }
    setIsConfirmModalOpen(true);
  };

  // Update the handleConfirmAction function to use real APIs
  const handleConfirmAction = async () => {
    if (!selectedClaim || !confirmAction) return;

    try {
      let response;
      
      if (confirmAction === 'accept') {
        // Validate tyre details
        if (!isTyreDetailsComplete()) return;

        // Transform tyre details to match API format
        const apiTyreDetails = tyreDetails.map(tyre => ({
          brand: tyre.brand,
          size: tyre.size,
          cost: tyre.cost
        }));

        response = await fetch(getApiUrl(`master/claim/${selectedClaim.id}/accept`), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('masterToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tyre_details: apiTyreDetails })
        });
      } else {
        // Validate rejection reason
        if (!REJECTION_REASONS.includes(rejectionReason)) return;

        response = await fetch(getApiUrl(`master/claim/${selectedClaim.id}/reject`), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('masterToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rejection_reason: rejectionReason })
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${confirmAction} claim: ${response.status}`);
      }

      await response.json();
      
      // Refresh the claims list
      await fetchClaims(currentTab);
      
      // Show success message
      toast({
        title: "Success",
        description: `Claim has been ${confirmAction}ed successfully.`,
      });

      // Reset state
      setIsConfirmModalOpen(false);
      setSelectedClaim(null);
      setConfirmAction(null);
      setRejectionReason("Mechanical Failure");
      resetTyreForm();
    } catch (error) {
      console.error(`Failed to ${confirmAction} claim:`, error);
      handleAuthError(error as Error);
    }
  };

  // Handle opening history detail modal
  const handleOpenHistoryDetail = async (claim: MasterClaim) => {
    setLoadingClaimDetails(true);
    setSelectedClaim(claim);
    setIsHistoryDetailModalOpen(true);
    
    try {
      const details = await masterClaimsApi.getClaimDetails(claim.id);
      setDetailedClaim(details);
    } catch (error) {
      console.error('Failed to fetch claim details:', error);
      handleAuthError(error as Error);
      // Close the modal if there's an error
      setIsHistoryDetailModalOpen(false);
      setSelectedClaim(null);
    } finally {
      setLoadingClaimDetails(false);
    }
  };

  // Handle viewing warranty receipt
  const handleViewReceipt = (receiptUrl: string) => {
    // TODO: Replace with dynamic URL when BE is ready
    window.open(receiptUrl, '_blank');
  };

  // Handle tyre quantity change
  const handleTyreQuantityChange = (quantity: number) => {
    setTyreQuantity(quantity);
    const newTyreDetails: TyreDetail[] = [];
    for (let i = 0; i < quantity; i++) {
      newTyreDetails.push({
        id: (i + 1).toString(),
        brand: '',
        size: '',
        cost: 0
      });
    }
    setTyreDetails(newTyreDetails);
  };

  // Handle tyre detail change
  const handleTyreDetailChange = (index: number, field: keyof TyreDetail, value: string | number) => {
    const updatedTyreDetails = [...tyreDetails];
    updatedTyreDetails[index] = {
      ...updatedTyreDetails[index],
      [field]: value
    };
    setTyreDetails(updatedTyreDetails);
  };

  // Check if all tyre details are filled
  const isTyreDetailsComplete = () => {
    return tyreDetails.every(tyre => 
      tyre.brand.trim() !== '' && 
      tyre.size.trim() !== '' && 
      tyre.cost > 0
    );
  };

  // Reset tyre form
  const resetTyreForm = () => {
    setTyreQuantity(1);
    setTyreDetails([{ id: '1', brand: '', size: '', cost: 0 }]);
  };

  const filteredClaims = () => {
    return claims.filter(claim => {
      if (!claim) return false;
      
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (claim.customer_name?.toLowerCase() || '').includes(searchTermLower) ||
        (claim.phone_number || '').includes(searchTerm) ||
        (claim.email?.toLowerCase() || '').includes(searchTermLower);
      
      return matchesSearch;
    });
  };

  const ClaimsTable = ({ claims, tabType }: { claims: MasterClaim[], tabType: 'unacknowledged' | 'pending' | 'history' }) => (
    <div className="tayaria-card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-tayaria-darkgray">
            <TableRow className="hover:bg-transparent border-tayaria-gray">
              <TableHead className="text-gray-400">Customer Name</TableHead>
              <TableHead className="text-gray-400">Phone No.</TableHead>
              <TableHead className="text-gray-400">Email</TableHead>
              <TableHead className="text-gray-400">Car Plate</TableHead>
              <TableHead className="text-gray-400">Shop Name</TableHead>
              <TableHead className="text-gray-400">Shop Contact</TableHead>
              <TableHead className="text-gray-400">Created Date</TableHead>
              {tabType === 'history' && (
                <TableHead className="text-gray-400">Date Settled</TableHead>
              )}
              {(tabType === 'pending' || tabType === 'history') && (
                <TableHead className="text-gray-400">Warranty Tagged</TableHead>
              )}
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.length > 0 ? (
              claims.map(claim => (
                <TableRow 
                  key={claim.id} 
                  className={`border-tayaria-gray hover:bg-tayaria-darkgray ${
                    tabType === 'history' ? 'cursor-pointer' : ''
                  }`}
                  onClick={tabType === 'history' ? () => handleOpenHistoryDetail(claim) : undefined}
                >
                  <TableCell className="text-white font-medium">
                    {tabType === 'history' ? truncateText(claim.customer_name, 20) : claim.customer_name}
                  </TableCell>
                  <TableCell className="text-white">{claim.phone_number}</TableCell>
                  <TableCell className="text-white">{claim.email}</TableCell>
                  <TableCell className="text-white font-medium">{claim.car_plate}</TableCell>
                  <TableCell className="text-white font-medium">
                    {tabType === 'history' ? truncateText(claim.shop_name, 25) : claim.shop_name}
                  </TableCell>
                  <TableCell className="text-white text-sm">
                    {claim.shop_contact}
                  </TableCell>
                  <TableCell className="text-white text-sm">{formatDate(claim.created_at)}</TableCell>
                  {tabType === 'history' && (
                    <TableCell className="text-white text-sm">
                      {claim.date_settled ? formatDate(claim.date_settled) : '-'}
                    </TableCell>
                  )}
                  {(tabType === 'pending' || tabType === 'history') && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {claim.tagged_warranty_id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewWarranty(claim.tagged_warranty_id!)}
                          className="text-white border-tayaria-gray hover:bg-tayaria-gray"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      claim.status === 'approved' 
                        ? 'bg-green-500/10 text-green-500' 
                        : claim.status === 'rejected'
                        ? 'bg-red-500/10 text-red-500'
                        : claim.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                      {tabType === 'unacknowledged' && (
                        <Button
                          size="sm"
                          onClick={() => handleMoveToPending(claim.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Pending
                        </Button>
                      )}
                      {tabType === 'pending' && (
                        <>
                          {!claim.tagged_warranty_id ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenTagModal(claim)}
                                className="text-white border-tayaria-gray hover:bg-tayaria-gray"
                              >
                                <Tag className="h-4 w-4 mr-1" />
                                Tag Warranty
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenConfirmModal(claim, 'reject')}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleOpenConfirmModal(claim, 'accept')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenConfirmModal(claim, 'reject')}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      {tabType === 'history' && (
                        <span className="text-gray-400 text-sm italic">Click row for details</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={
                    tabType === 'unacknowledged' ? 9 : 
                    tabType === 'pending' ? 10 : 
                    11 // history tab has one extra column (Date Settled)
                  } 
                  className="text-center py-8"
                >
                  <p className="text-white">No claims found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <MasterLayout>
      <MasterHeader title="Manage Claims" />
      
      <main className="p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center bg-tayaria-darkgray rounded-lg p-2 w-full md:w-[70%]">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              placeholder="Search claims by name, phone or email"
              className="border-0 bg-transparent text-white focus-visible:ring-0 placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="bg-tayaria-darkgray">
            <TabsTrigger value="unacknowledged" className="data-[state=active]:bg-tayaria-yellow data-[state=active]:text-black">
              Unacknowledged
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-tayaria-yellow data-[state=active]:text-black">
              Pending
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-tayaria-yellow data-[state=active]:text-black">
              History
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-tayaria-yellow" />
              <span className="ml-2 text-white">Loading claims...</span>
            </div>
          ) : (
            <>
              <TabsContent value="unacknowledged">
                <ClaimsTable claims={filteredClaims()} tabType="unacknowledged" />
              </TabsContent>

              <TabsContent value="pending">
                <ClaimsTable claims={filteredClaims()} tabType="pending" />
              </TabsContent>

              <TabsContent value="history">
                <ClaimsTable claims={filteredClaims()} tabType="history" />
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Tag Warranty Modal */}
        <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-white">Tag Warranty to Claim</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {selectedClaim && (
                <div className="mb-4">
                  <p className="text-gray-400">Car Plate: <span className="text-white font-medium">{selectedClaim.car_plate}</span></p>
                  <p className="text-gray-400">Matching warranties:</p>
                </div>
              )}
              <Table>
                <TableHeader className="bg-tayaria-gray">
                  <TableRow className="hover:bg-transparent border-tayaria-gray">
                    <TableHead className="text-gray-400">Customer Name</TableHead>
                    <TableHead className="text-gray-400">Purchase Date</TableHead>
                    <TableHead className="text-gray-400">Expiration Date</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingWarranties ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin text-tayaria-yellow" />
                          <span className="ml-2 text-white">Loading warranties...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : warranties.length > 0 ? (
                    warranties.map(warranty => (
                      <TableRow key={warranty.id} className="border-tayaria-gray hover:bg-tayaria-gray">
                        <TableCell className="text-white font-medium">{warranty.name}</TableCell>
                        <TableCell className="text-white">{formatDate(warranty.purchase_date)}</TableCell>
                        <TableCell className="text-white">{formatDate(warranty.expiry_date)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewReceipt(warranty.receipt)}
                              className="text-white border-tayaria-gray hover:bg-tayaria-darkgray"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Receipt
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleTagWarranty(warranty.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Select Warranty
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <p className="text-white">No warranties found for this car plate</p>
                        <p className="text-gray-400 text-sm">Contact customer to verify warranty details</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTagModalOpen(false)}
                className="border-tayaria-gray text-white hover:bg-tayaria-gray"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Warranty Modal */}
        <Dialog open={isViewWarrantyModalOpen} onOpenChange={setIsViewWarrantyModalOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Warranty Details</DialogTitle>
            </DialogHeader>
            {selectedWarranty && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Warranty ID
                    </label>
                    <p className="text-white">{selectedWarranty.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Customer Name
                    </label>
                    <p className="text-white">{selectedWarranty.customer_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Car Plate
                    </label>
                    <p className="text-white">{selectedWarranty.car_plate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Purchase Date
                    </label>
                    <p className="text-white">{formatDate(selectedWarranty.purchase_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Expiration Date
                    </label>
                    <p className="text-white">{formatDate(selectedWarranty.expiry_date)}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    onClick={() => handleViewReceipt(selectedWarranty.receipt_url)}
                    className="bg-tayaria-yellow text-black hover:bg-tayaria-yellow/90"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Warranty Receipt
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewWarrantyModalOpen(false)}
                className="border-tayaria-gray text-white hover:bg-tayaria-gray"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Modal */}
        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                Confirm {confirmAction === 'accept' ? 'Accept' : 'Reject'} Claim
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-400">
                Are you sure you want to {confirmAction} this claim?
              </p>
              {selectedClaim && (
                <div className="p-4 bg-tayaria-gray rounded-lg">
                  <p className="text-white"><strong>Customer:</strong> {selectedClaim.customer_name}</p>
                  <p className="text-white"><strong>Car Plate:</strong> {selectedClaim.car_plate}</p>
                  <p className="text-white"><strong>Shop:</strong> {selectedClaim.shop_name}</p>
                </div>
              )}
              
              {confirmAction === 'accept' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Tyre Details</h3>
                    <div className="mb-4">
                      <label className="block text-white font-medium mb-2">
                        Number of Tyres *
                      </label>
                      <Select value={tyreQuantity.toString()} onValueChange={(value) => handleTyreQuantityChange(parseInt(value))}>
                        <SelectTrigger className="bg-tayaria-gray border-tayaria-gray text-white">
                          <SelectValue placeholder="Select quantity" />
                        </SelectTrigger>
                        <SelectContent className="bg-tayaria-gray border-tayaria-gray">
                          {[1, 2, 3, 4].map(num => (
                            <SelectItem key={num} value={num.toString()} className="text-white hover:bg-tayaria-darkgray">
                              {num} {num === 1 ? 'Tyre' : 'Tyres'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      {tyreDetails.map((tyre, index) => (
                        <div key={tyre.id} className="p-4 bg-tayaria-gray rounded-lg">
                          <h4 className="text-white font-medium mb-3">Tyre {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">
                                Brand *
                              </label>
                              <Input
                                value={tyre.brand}
                                onChange={(e) => handleTyreDetailChange(index, 'brand', e.target.value)}
                                className="bg-tayaria-darkgray border-tayaria-gray text-white placeholder-gray-400"
                                placeholder="e.g., Michelin, Bridgestone"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">
                                Size *
                              </label>
                              <Input
                                value={tyre.size}
                                onChange={(e) => handleTyreDetailChange(index, 'size', e.target.value)}
                                className="bg-tayaria-darkgray border-tayaria-gray text-white placeholder-gray-400"
                                placeholder="e.g., 205/55R16"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">
                                Cost (RM) *
                              </label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={tyre.cost || ''}
                                onChange={(e) => handleTyreDetailChange(index, 'cost', parseFloat(e.target.value) || 0)}
                                className="bg-tayaria-darkgray border-tayaria-gray text-white placeholder-gray-400"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {!isTyreDetailsComplete() && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">
                          Please fill in all tyre details (brand, size, and cost) for all {tyreQuantity} tyre{tyreQuantity > 1 ? 's' : ''}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {confirmAction === 'reject' && (
                <div>
                  <label htmlFor="rejectionReason" className="block text-white font-medium mb-2">
                    Reason for Rejection *
                  </label>
                  <Select 
                    value={rejectionReason} 
                    onValueChange={(value) => setRejectionReason(value as typeof REJECTION_REASONS[number])}
                  >
                    <SelectTrigger className="bg-tayaria-gray border-tayaria-gray text-white">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent className="bg-tayaria-gray border-tayaria-gray">
                      {REJECTION_REASONS.map((reason) => (
                        <SelectItem 
                          key={reason} 
                          value={reason}
                          className="text-white hover:bg-tayaria-darkgray"
                        >
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setRejectionReason("Mechanical Failure");
                  resetTyreForm();
                }}
                className="border-tayaria-gray text-white hover:bg-tayaria-gray"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={
                  (confirmAction === 'reject' && !REJECTION_REASONS.includes(rejectionReason)) ||
                  (confirmAction === 'accept' && !isTyreDetailsComplete())
                }
                className={`${
                  confirmAction === 'accept' 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {confirmAction === 'accept' ? 'Accept' : 'Reject'} Claim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Detail Modal */}
        <Dialog open={isHistoryDetailModalOpen} onOpenChange={setIsHistoryDetailModalOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Claim Details</DialogTitle>
            </DialogHeader>
            {loadingClaimDetails ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-tayaria-yellow" />
                <span className="ml-2 text-white">Loading claim details...</span>
              </div>
            ) : detailedClaim ? (
              <div className="space-y-6">
                {/* Claim Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Claim Information</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-tayaria-gray rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
                      <p className="text-white">{detailedClaim.claim.customer_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                      <p className="text-white">{detailedClaim.claim.phone_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                      <p className="text-white">{detailedClaim.claim.email || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Car Plate</label>
                      <p className="text-white">{detailedClaim.claim.car_plate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Shop Name</label>
                      <p className="text-white">{detailedClaim.claim.shop_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Shop Contact</label>
                      <p className="text-white">{detailedClaim.claim.shop_contact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Created Date</label>
                      <p className="text-white">{formatDate(detailedClaim.claim.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Date Settled</label>
                      <p className="text-white">{detailedClaim.claim.date_settled ? formatDate(detailedClaim.claim.date_settled) : '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        detailedClaim.claim.status === 'approved' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {detailedClaim.claim.status.charAt(0).toUpperCase() + detailedClaim.claim.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason - Only show if claim was rejected */}
                {detailedClaim.claim.status === 'rejected' && detailedClaim.claim.rejection_reason && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Rejection Details</h3>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <label className="block text-sm font-medium text-gray-400 mb-1">Reason for Rejection</label>
                      <p className="text-white">{detailedClaim.claim.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {/* Warranty Information - Only show if claim has warranty */}
                {detailedClaim.warranty && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Tagged Warranty Information</h3>
                    <div className="p-4 bg-tayaria-gray rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Warranty ID</label>
                          <p className="text-white">{detailedClaim.warranty.id}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
                          <p className="text-white">{detailedClaim.warranty.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Car Plate</label>
                          <p className="text-white">{detailedClaim.warranty.car_plate}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Purchase Date</label>
                          <p className="text-white">{formatDate(detailedClaim.warranty.purchase_date)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Date</label>
                          <p className="text-white">{formatDate(detailedClaim.warranty.expiry_date)}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewReceipt(detailedClaim.warranty.receipt)}
                        className="bg-tayaria-yellow text-black hover:bg-tayaria-yellow/90"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Warranty Receipt
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tyre Details - Only show if claim was approved */}
                {detailedClaim.claim.status === 'approved' && detailedClaim.claim.tyre_details && detailedClaim.claim.tyre_details.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Claimed Tyre Details</h3>
                    <div className="space-y-4">
                      {detailedClaim.claim.tyre_details.map((tyre, index) => (
                        <div key={tyre.id} className="p-4 bg-tayaria-gray rounded-lg">
                          <h4 className="text-white font-medium mb-2">Tyre {index + 1}</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Brand</label>
                              <p className="text-white">{tyre.brand}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Size</label>
                              <p className="text-white">{tyre.size}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Cost</label>
                              <p className="text-white">RM {tyre.cost.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Cost:</span>
                          <span className="text-green-400 font-medium">
                            RM {detailedClaim.claim.tyre_details.reduce((total, tyre) => total + tyre.cost, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-white">Failed to load claim details</p>
                <p className="text-gray-400 text-sm">Please try again later</p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsHistoryDetailModalOpen(false);
                  setDetailedClaim(null);
                }}
                className="border-tayaria-gray text-white hover:bg-tayaria-gray"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </MasterLayout>
  );
};

export default ManageClaims; 
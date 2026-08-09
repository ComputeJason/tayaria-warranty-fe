import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, ChevronDown, ChevronUp, ArrowUpDown, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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
import {
  claimsApi,
  convertFormDataToCreateClaimRequest,
  convertApiResponseToFrontendClaim,
  type Claim
} from '@/services/claimsApi';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/config/api';
import { getTreadPatternsForBrand } from '@/constants/tyreBrands';

// Claims interface and mock data are now imported from claimsApi service

const AllClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closeTargetId, setCloseTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone_number: '',
    email: '',
    car_plate: ''
  });

  // Create Claim modal: 2-step flow state
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [verifiedCarPlate, setVerifiedCarPlate] = useState<string | null>(null);
  const [verifiedBrands, setVerifiedBrands] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [tyreFormData, setTyreFormData] = useState({
    brand: '',
    quantity: 1,
    size: '',
    tread_pattern: '',
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  // Fetch claims on component mount
  useEffect(() => {
    fetchClaims();
  }, []);

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
      navigate('/admin/login');
      return;
    }
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  };

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const apiClaims = await claimsApi.getCurrentShopClaims();
      const frontendClaims = apiClaims.map(convertApiResponseToFrontendClaim);
      setClaims(frontendClaims);
    } catch (error) {
      console.error('Error fetching claims:', error);
      handleAuthError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreateClaimForm = () => {
    setFormData({
      customer_name: '',
      phone_number: '',
      email: '',
      car_plate: ''
    });
    setTyreFormData({ brand: '', quantity: 1, size: '', tread_pattern: '' });
    setCreateStep(1);
    setVerifiedCarPlate(null);
    setVerifiedBrands([]);
    setVerifyError(null);
  };

  const handleVerifyCarPlate = async () => {
    if (!formData.car_plate.trim()) return;

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const result = await claimsApi.verifyCarPlateBrands(formData.car_plate);
      if (!result.valid || result.brands.length === 0) {
        setVerifyError('No warranties tagged to entered car plate');
        setVerifiedCarPlate(null);
        setVerifiedBrands([]);
        return;
      }

      setVerifiedBrands(result.brands);
      setVerifiedCarPlate(formData.car_plate);
      // Default to the latest brand (already sorted latest-first by the backend)
      setTyreFormData(prev => ({ ...prev, brand: result.brands[0], tread_pattern: '' }));
    } catch (error) {
      console.error('Failed to verify car plate:', error);
      setVerifyError(error instanceof Error ? error.message : 'Failed to verify car plate');
      setVerifiedCarPlate(null);
      setVerifiedBrands([]);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number - must be at least 8 digits
    const phoneDigits = formData.phone_number.replace(/\D/g, ''); // Remove non-digits
    if (phoneDigits.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Phone number must be at least 8 digits long.',
        variant: 'destructive',
      });
      return;
    }

    if (!tyreFormData.brand || !tyreFormData.size.trim() || !tyreFormData.tread_pattern) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in quantity, size and tread pattern.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert form data to API request format
      const apiRequest = convertFormDataToCreateClaimRequest({ ...formData, ...tyreFormData });

      // Create claim via API
      const apiResponse = await claimsApi.createClaim(apiRequest);

      // Convert API response to frontend format and add to claims list
      const newClaim = convertApiResponseToFrontendClaim(apiResponse);
      setClaims(prevClaims => [newClaim, ...prevClaims]);

      // Reset form and show success
      resetCreateClaimForm();
      setIsCreateModalOpen(false);
      setIsSuccessModalOpen(true);

      toast({
        title: 'Success',
        description: 'Claim created successfully!',
      });

    } catch (error) {
      console.error('Error creating claim:', error);
      handleAuthError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Any edit to the car plate after verification invalidates it, forcing re-verify
    if (name === 'car_plate') {
      setVerifiedCarPlate(null);
      setVerifiedBrands([]);
      setVerifyError(null);
    }
  };

  // Sort toggle function
  const handleSortToggle = () => {
    if (sortOrder === null) {
      setSortOrder('desc'); // Most recent first
    } else if (sortOrder === 'desc') {
      setSortOrder('asc'); // Least recent first
    } else {
      setSortOrder(null); // No sorting
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filter and sort claims based on search term, status, and date
  const filteredClaims = claims
    .filter(claim => {
      const matchesSearch = 
        claim.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.phone_number.includes(searchTerm) ||
        claim.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.car_plate.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesStatus = false;
      if (statusFilter === 'all') {
        matchesStatus = true;
      } else if (statusFilter === 'open') {
        matchesStatus = !claim.date_closed;
      } else {
        matchesStatus = claim.status === statusFilter;
      }
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      if (sortOrder === 'desc') {
        return dateB - dateA; // Most recent first
      } else {
        return dateA - dateB; // Least recent first
      }
    });

  // Handler for closing a claim
  const handleCloseClaim = async (id: string) => {
    try {
      const updatedClaim = await claimsApi.closeClaim(id);
      
      // Update the claims list with the updated claim, preserving supporting_doc_url
      setClaims(prevClaims => prevClaims.map(claim => {
        if (claim.id === id) {
          const convertedClaim = convertApiResponseToFrontendClaim(updatedClaim);
          // Preserve the existing supporting_doc_url if the API response doesn't include it
          return {
            ...convertedClaim,
            supporting_doc_url: convertedClaim.supporting_doc_url || claim.supporting_doc_url
          };
        }
        return claim;
      }));
      
      toast({
        title: "Success",
        description: "Claim has been closed successfully.",
      });
      
      setIsCloseModalOpen(false);
      setCloseTargetId(null);
    } catch (error) {
      console.error('Failed to close claim:', error);
      handleAuthError(error as Error);
    }
  };

  // Handler for viewing supporting document
  const handleViewSupportingDocument = async (claimId: string) => {
    try {
      // Fetch the pre-signed URL from the API
      const response = await fetch(getApiUrl(`user/claim/${claimId}/supporting-doc`));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch document URL: ${response.status}`);
      }

      const data = await response.json();
      
      // Open the document in a new tab
      window.open(data.supporting_doc_url, '_blank');
    } catch (error) {
      console.error('Failed to fetch document URL:', error);
      
      // Show specific error messages based on API response
      let errorMessage = "Failed to fetch document. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("No supporting document found")) {
          errorMessage = "No supporting document found for this claim.";
        } else if (error.message.includes("Claim not found")) {
          errorMessage = "Claim not found.";
        } else if (error.message.includes("Failed to generate pre-signed URL")) {
          errorMessage = "Failed to generate document URL. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <AdminHeader title="All Claims" />
      
      <main className="p-4 md:p-6">
        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row justify-start mb-6 space-y-3 md:space-y-0">
          <div className="flex flex-col md:flex-row items-stretch md:items-center w-full md:w-[70%] space-y-3 md:space-y-0">
            <div className="flex items-center bg-white rounded-lg p-2 flex-1 border border-red-300">
              <Search className="h-5 w-5 text-gray-600 mr-2" />
              <Input
                placeholder="Search claims by name, phone, email or car plate"
                className="border-0 bg-transparent text-gray-900 focus-visible:ring-0 placeholder:text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 p-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[140px] bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">All Status</SelectItem>
                  <SelectItem value="open" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">Open</SelectItem>
                  <SelectItem value="pending" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">Pending</SelectItem>
                  <SelectItem value="approved" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">Approved</SelectItem>
                  <SelectItem value="rejected" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-gray-900 flex-1 md:flex-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Create Claim</span>
                <span className="md:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Claims List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-300">
            <h3 className="text-gray-900 font-semibold">
              Claims List ({filteredClaims.length})
            </h3>
          </div>
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <span className="ml-2 text-gray-900">Loading claims...</span>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent border-gray-300">
                      <TableHead className="text-gray-600">Customer Name</TableHead>
                      <TableHead className="text-gray-600">Phone No.</TableHead>
                      <TableHead className="text-gray-600">Email</TableHead>
                      <TableHead className="text-gray-600">Car Plate</TableHead>
                      <TableHead 
                        className="text-gray-600 cursor-pointer select-none hover:text-gray-900 transition-colors"
                        onClick={handleSortToggle}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created Date</span>
                          {sortOrder === null && <ArrowUpDown className="h-4 w-4" />}
                          {sortOrder === 'desc' && <ChevronDown className="h-4 w-4" />}
                          {sortOrder === 'asc' && <ChevronUp className="h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-600">Date Settled</TableHead>
                      <TableHead className="text-gray-600">Date Closed</TableHead>
                      <TableHead className="text-gray-600">Claim Status</TableHead>
                      <TableHead className="text-gray-600">Supporting Document</TableHead>
                      <TableHead className="text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length > 0 ? (
                      filteredClaims.map(claim => (
                        <TableRow key={claim.id} className="border-gray-300 hover:bg-white">
                          <TableCell className="text-gray-900 font-medium">{claim.customer_name}</TableCell>
                          <TableCell className="text-gray-900">{claim.phone_number}</TableCell>
                          <TableCell className="text-gray-900">{claim.email}</TableCell>
                          <TableCell className="text-gray-900 font-medium">{claim.car_plate}</TableCell>
                          <TableCell className="text-gray-900 text-sm">{formatDate(claim.created_at)}</TableCell>
                          <TableCell className="text-gray-900 text-sm">
                            {claim.date_settled ? formatDate(claim.date_settled) : '-'}
                          </TableCell>
                          <TableCell className="text-gray-900 text-sm">
                            {claim.date_closed ? formatDate(claim.date_closed) : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              claim.status === 'approved' 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : claim.status === 'rejected'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            }`}>
                              {claim.status === 'pending' || claim.status === 'unacknowledged' 
                                ? 'Pending'
                                : claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-900 text-sm">
                            {claim.supporting_doc_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewSupportingDocument(claim.id)}
                                className="bg-white text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                View
                              </Button>
                            )}
                            {!claim.supporting_doc_url && '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-nowrap gap-1 min-w-fit">
                              {(claim.status === 'approved' || claim.status === 'rejected') && !claim.date_closed && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setCloseTargetId(claim.id);
                                    setIsCloseModalOpen(true);
                                  }}
                                  className="bg-red-600 text-white hover:bg-red-700 border border-red-600 px-2 py-0.5 h-6 min-h-0 text-xs font-semibold rounded transition-colors duration-150 whitespace-nowrap"
                                >
                                  Close
                                </Button>
                              )}
                              {claim.status === 'rejected' && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setSelectedClaim(claim);
                                    setIsRejectionModalOpen(true);
                                  }}
                                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 px-2 py-0.5 h-6 min-h-0 text-xs font-semibold rounded transition-colors duration-150 whitespace-nowrap"
                                >
                                  View Reason
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <p className="text-gray-900">No claims found</p>
                          <p className="text-gray-600 text-sm">Try adjusting your search criteria</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Mobile Card View */}
          {!isLoading && (
            <div className="md:hidden divide-y divide-gray-300">
              {filteredClaims.length > 0 ? (
                filteredClaims.map(claim => (
                  <div key={claim.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-gray-900 font-medium">{claim.customer_name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        claim.status === 'approved' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : claim.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}>
                        {claim.status === 'pending' || claim.status === 'unacknowledged' 
                          ? 'Pending'
                          : claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-600 text-sm">Phone: <span className="text-gray-900">{claim.phone_number}</span></p>
                      <p className="text-gray-600 text-sm">Email: <span className="text-gray-900">{claim.email}</span></p>
                      <p className="text-gray-600 text-sm">Car Plate: <span className="text-gray-900 font-medium">{claim.car_plate}</span></p>
                      <p className="text-gray-600 text-sm">Created: <span className="text-gray-900">{formatDate(claim.created_at)}</span></p>
                      <p className="text-gray-600 text-sm">Settled: <span className="text-gray-900">{claim.date_settled ? formatDate(claim.date_settled) : '-'}</span></p>
                      <p className="text-gray-600 text-sm">Closed: <span className="text-gray-900">{claim.date_closed ? formatDate(claim.date_closed) : '-'}</span></p>
                      <p className="text-gray-600 text-sm">
                        Supporting Document: {' '}
                        {claim.supporting_doc_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSupportingDocument(claim.id)}
                            className="bg-white text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-0.5 h-6 min-h-0 text-xs"
                          >
                            View
                          </Button>
                        )}
                        {!claim.supporting_doc_url && <span className="text-gray-900">-</span>}
                      </p>
                      {(claim.status === 'approved' || claim.status === 'rejected') && !claim.date_closed && (
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setCloseTargetId(claim.id);
                            setIsCloseModalOpen(true);
                          }}
                          className="bg-red-600 text-white hover:bg-red-700 border border-red-600 px-2 py-0.5 h-6 min-h-0 text-xs font-semibold rounded transition-colors duration-150 mt-1 mr-2"
                        >
                          Close
                        </Button>
                      )}
                      {claim.status === 'rejected' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setIsRejectionModalOpen(true);
                          }}
                          className="bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 px-2 py-0.5 h-6 min-h-0 text-xs font-semibold rounded transition-colors duration-150 mt-1"
                        >
                          View Reason
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-900">No claims found</p>
                  <p className="text-gray-600 text-sm">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Claim Modal */}
        <Dialog
          open={isCreateModalOpen}
          onOpenChange={(open) => {
            setIsCreateModalOpen(open);
            if (!open) resetCreateClaimForm();
          }}
        >
          <DialogContent className="bg-white border-gray-300 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                Create New Claim {createStep === 2 && '- Tyre Details'}
              </DialogTitle>
            </DialogHeader>

            {createStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-600 mb-1">
                    Customer Name *
                  </label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="bg-white border-gray-300 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-600 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="bg-white border-gray-300 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                    Email (Optional)
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="car_plate" className="block text-sm font-medium text-gray-600 mb-1">
                    Car Plate *
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="car_plate"
                      name="car_plate"
                      value={formData.car_plate}
                      onChange={handleInputChange}
                      className="bg-white border-gray-300 text-gray-900"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyCarPlate}
                      disabled={isVerifying || !formData.car_plate.trim()}
                      className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                    >
                      {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify
                    </Button>
                  </div>
                  {verifyError && (
                    <p className="text-red-600 text-xs mt-1">{verifyError}</p>
                  )}
                  {verifiedCarPlate === formData.car_plate && verifiedBrands.length > 0 && (
                    <p className="text-green-600 text-xs mt-1">Car plate verified.</p>
                  )}
                </div>

                {verifiedCarPlate === formData.car_plate && verifiedBrands.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Tyre Brand *
                    </label>
                    <Select
                      value={tyreFormData.brand}
                      onValueChange={(value) => setTyreFormData(prev => ({ ...prev, brand: value, tread_pattern: '' }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {verifiedBrands.map((brand) => (
                          <SelectItem key={brand} value={brand} className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCreateStep(2)}
                    disabled={
                      !verifiedCarPlate ||
                      verifiedCarPlate !== formData.car_plate ||
                      verifiedBrands.length === 0 ||
                      !tyreFormData.brand
                    }
                    className="bg-green-600 hover:bg-green-700 text-gray-900"
                  >
                    Add Claim Details
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tyre Brand
                  </label>
                  <Input
                    value={tyreFormData.brand}
                    disabled
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Quantity Claiming *
                  </label>
                  <Select
                    value={tyreFormData.quantity.toString()}
                    onValueChange={(value) => setTyreFormData(prev => ({ ...prev, quantity: parseInt(value) }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {[1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={n.toString()} className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">
                          {n} {n === 1 ? 'Tyre' : 'Tyres'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-600 mb-1">
                    Size *
                  </label>
                  <Input
                    id="size"
                    value={tyreFormData.size}
                    onChange={(e) => setTyreFormData(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="e.g., 205/55R16"
                    className="bg-white border-gray-300 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tread Pattern *
                  </label>
                  <Select
                    value={tyreFormData.tread_pattern}
                    onValueChange={(value) => setTyreFormData(prev => ({ ...prev, tread_pattern: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select tread pattern" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {getTreadPatternsForBrand(tyreFormData.brand).map((pattern) => (
                        <SelectItem key={pattern} value={pattern} className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">
                          {pattern}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateStep(1)}
                    className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-gray-900"
                    disabled={isSubmitting || !tyreFormData.size.trim() || !tyreFormData.tread_pattern}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Creating...' : 'Create Claim'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="bg-white border-gray-300 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Success</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">Claim has been created successfully.</p>
            <DialogFooter>
              <Button
                onClick={() => setIsSuccessModalOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-gray-900"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Reason Modal */}
        <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
          <DialogContent className="bg-white border-gray-300 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Rejection Details</DialogTitle>
            </DialogHeader>
            {selectedClaim && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date Settled</label>
                  <p className="text-gray-900">{formatDate(selectedClaim.date_settled!)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Reason for Rejection</label>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-gray-900">{selectedClaim.rejection_reason}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setIsRejectionModalOpen(false)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Close Claim Modal */}
        <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
          <DialogContent className="bg-white border-gray-300 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Close Claim</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-gray-900 text-sm mb-2">Closing this means you have settled the claim details with the customer.</p>
              <p className="text-gray-900 font-semibold">Are you sure you want to close this claim?</p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (closeTargetId) handleCloseClaim(closeTargetId);
                }}
                className="bg-green-600 hover:bg-green-700 text-gray-900"
              >
                Yes, Close
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCloseModalOpen(false)}
                className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
              >
                No
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AdminLayout>
  );
};

export default AllClaims; 
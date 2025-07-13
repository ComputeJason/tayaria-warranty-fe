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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert form data to API request format
      const apiRequest = convertFormDataToCreateClaimRequest(formData);
      
      // Create claim via API
      const apiResponse = await claimsApi.createClaim(apiRequest);
      
      // Convert API response to frontend format and add to claims list
      const newClaim = convertApiResponseToFrontendClaim(apiResponse);
      setClaims(prevClaims => [newClaim, ...prevClaims]);
      
      // Reset form and show success
      setFormData({
        customer_name: '',
        phone_number: '',
        email: '',
        car_plate: ''
      });
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      
      // Update the claims list with the updated claim
      setClaims(prevClaims => prevClaims.map(claim =>
        claim.id === id ? convertApiResponseToFrontendClaim(updatedClaim) : claim
      ));
      
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

  return (
    <AdminLayout>
      <AdminHeader title="All Claims" />
      
      <main className="p-4 md:p-6">
        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row justify-start mb-6 space-y-3 md:space-y-0">
          <div className="flex flex-col md:flex-row items-stretch md:items-center w-full md:w-[70%] space-y-3 md:space-y-0">
            <div className="flex items-center bg-tayaria-darkgray rounded-lg p-2 flex-1">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <Input
                placeholder="Search claims by name, phone, email or car plate"
                className="border-0 bg-transparent text-white focus-visible:ring-0 placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 p-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[140px] bg-tayaria-darkgray border-tayaria-gray text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-tayaria-darkgray border-tayaria-gray">
                  <SelectItem value="all" className="text-white hover:bg-tayaria-gray focus:bg-tayaria-gray">All Status</SelectItem>
                  <SelectItem value="open" className="text-white hover:bg-tayaria-gray focus:bg-tayaria-gray">Open</SelectItem>
                  <SelectItem value="pending" className="text-white hover:bg-tayaria-gray focus:bg-tayaria-gray">Pending</SelectItem>
                  <SelectItem value="approved" className="text-white hover:bg-tayaria-gray focus:bg-tayaria-gray">Approved</SelectItem>
                  <SelectItem value="rejected" className="text-white hover:bg-tayaria-gray focus:bg-tayaria-gray">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Create Claim</span>
                <span className="md:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Claims List */}
        <div className="tayaria-card p-0 overflow-hidden">
          <div className="p-4 border-b border-tayaria-gray">
            <h3 className="text-white font-semibold">
              Claims List ({filteredClaims.length})
            </h3>
          </div>
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-tayaria-yellow" />
              <span className="ml-2 text-white">Loading claims...</span>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-tayaria-darkgray">
                    <TableRow className="hover:bg-transparent border-tayaria-gray">
                      <TableHead className="text-gray-400">Customer Name</TableHead>
                      <TableHead className="text-gray-400">Phone No.</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Car Plate</TableHead>
                      <TableHead 
                        className="text-gray-400 cursor-pointer select-none hover:text-white transition-colors"
                        onClick={handleSortToggle}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created Date</span>
                          {sortOrder === null && <ArrowUpDown className="h-4 w-4" />}
                          {sortOrder === 'desc' && <ChevronDown className="h-4 w-4" />}
                          {sortOrder === 'asc' && <ChevronUp className="h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-400">Date Settled</TableHead>
                      <TableHead className="text-gray-400">Date Closed</TableHead>
                      <TableHead className="text-gray-400">Claim Status</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length > 0 ? (
                      filteredClaims.map(claim => (
                        <TableRow key={claim.id} className="border-tayaria-gray hover:bg-tayaria-darkgray">
                          <TableCell className="text-white font-medium">{claim.customer_name}</TableCell>
                          <TableCell className="text-white">{claim.phone_number}</TableCell>
                          <TableCell className="text-white">{claim.email}</TableCell>
                          <TableCell className="text-white font-medium">{claim.car_plate}</TableCell>
                          <TableCell className="text-white text-sm">{formatDate(claim.created_at)}</TableCell>
                          <TableCell className="text-white text-sm">
                            {claim.date_settled ? formatDate(claim.date_settled) : '-'}
                          </TableCell>
                          <TableCell className="text-white text-sm">
                            {claim.date_closed ? formatDate(claim.date_closed) : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              claim.status === 'approved' 
                                ? 'bg-green-500/10 text-green-500' 
                                : claim.status === 'rejected'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {claim.status === 'pending' || claim.status === 'unacknowledged' 
                                ? 'Pending'
                                : claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="space-x-2">
                            {(claim.status === 'approved' || claim.status === 'rejected') && !claim.date_closed && (
                              <Button
                                type="button"
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setCloseTargetId(claim.id);
                                  setIsCloseModalOpen(true);
                                }}
                                className="bg-tayaria-yellow text-black hover:bg-yellow-400 border border-tayaria-yellow px-2 py-0.5 h-6 min-h-0 text-xs font-semibold rounded transition-colors duration-150"
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
                                className="bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 px-2 py-0.5 h-6 min-h-0 text-xs font-semibold rounded transition-colors duration-150"
                              >
                                View Reason
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <p className="text-white">No claims found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
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
            <div className="md:hidden divide-y divide-tayaria-gray">
              {filteredClaims.length > 0 ? (
                filteredClaims.map(claim => (
                  <div key={claim.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{claim.customer_name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        claim.status === 'approved' 
                          ? 'bg-green-500/10 text-green-500' 
                          : claim.status === 'rejected'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {claim.status === 'pending' || claim.status === 'unacknowledged' 
                          ? 'Pending'
                          : claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Phone: <span className="text-white">{claim.phone_number}</span></p>
                      <p className="text-gray-400 text-sm">Email: <span className="text-white">{claim.email}</span></p>
                      <p className="text-gray-400 text-sm">Car Plate: <span className="text-white font-medium">{claim.car_plate}</span></p>
                      <p className="text-gray-400 text-sm">Created: <span className="text-white">{formatDate(claim.created_at)}</span></p>
                      <p className="text-gray-400 text-sm">Settled: <span className="text-white">{claim.date_settled ? formatDate(claim.date_settled) : '-'}</span></p>
                      <p className="text-gray-400 text-sm">Closed: <span className="text-white">{claim.date_closed ? formatDate(claim.date_closed) : '-'}</span></p>
                      {(claim.status === 'approved' || claim.status === 'rejected') && !claim.date_closed && (
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setCloseTargetId(claim.id);
                            setIsCloseModalOpen(true);
                          }}
                          className="bg-tayaria-yellow text-black hover:bg-yellow-400 border border-tayaria-yellow px-2 py-0.5 h-6 min-h-0 text-xs font-semibold rounded transition-colors duration-150 mt-1 mr-2"
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
                  <p className="text-white">No claims found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Claim Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Claim</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-400 mb-1">
                  Customer Name *
                </label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="bg-tayaria-gray border-tayaria-gray text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-400 mb-1">
                  Phone Number *
                </label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="bg-tayaria-gray border-tayaria-gray text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email (Optional)
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-tayaria-gray border-tayaria-gray text-white"
                />
              </div>
              <div>
                <label htmlFor="car_plate" className="block text-sm font-medium text-gray-400 mb-1">
                  Car Plate *
                </label>
                <Input
                  id="car_plate"
                  name="car_plate"
                  value={formData.car_plate}
                  onChange={handleInputChange}
                  className="bg-tayaria-gray border-tayaria-gray text-white"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-tayaria-gray text-white hover:bg-tayaria-gray"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Creating...' : 'Create Claim'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Success</DialogTitle>
            </DialogHeader>
            <p className="text-gray-400">Claim has been created successfully.</p>
            <DialogFooter>
              <Button
                onClick={() => setIsSuccessModalOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Reason Modal */}
        <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Rejection Details</DialogTitle>
            </DialogHeader>
            {selectedClaim && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date Settled</label>
                  <p className="text-white">{formatDate(selectedClaim.date_settled!)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Reason for Rejection</label>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-white">{selectedClaim.rejection_reason}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setIsRejectionModalOpen(false)}
                className="bg-tayaria-yellow text-black hover:bg-tayaria-yellow/90"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Close Claim Modal */}
        <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Close Claim</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-gray-300 text-sm mb-2">Closing this means you have settled the claim details with the customer.</p>
              <p className="text-white font-semibold">Are you sure you want to close this claim?</p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (closeTargetId) handleCloseClaim(closeTargetId);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Yes, Close
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCloseModalOpen(false)}
                className="border-tayaria-gray text-white hover:bg-tayaria-gray"
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
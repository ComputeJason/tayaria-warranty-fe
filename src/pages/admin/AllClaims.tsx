import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
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

// TODO: Replace with actual API types when BE is ready
interface Claim {
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

// TODO: Replace with actual API calls when BE is ready
const mockClaims: Claim[] = [
  {
    id: '1',
    customerName: 'John Doe',
    phoneNumber: '+60123456789',
    email: 'john@example.com',
    carPlate: 'ABC123',
    status: 'pending',
    createdAt: '2024-03-20T10:00:00Z'
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    phoneNumber: '+60198765432',
    email: 'jane@example.com',
    carPlate: 'XYZ789',
    status: 'approved',
    createdAt: '2024-03-19T15:30:00Z',
    dateSettled: '2024-03-20T09:15:00Z'
  },
  {
    id: '3',
    customerName: 'Michael Brown',
    phoneNumber: '+60123456790',
    email: 'michael@example.com',
    carPlate: 'DEF456',
    status: 'approved',
    createdAt: '2024-03-18T09:15:00Z',
    dateSettled: '2024-03-19T14:30:00Z',
    dateClosed: '2024-03-20T10:00:00Z',
    rejectionReason: 'Warranty expired and customer provided insufficient documentation for claim verification.'

  },
  {
    id: '4',
    customerName: 'Sarah Wilson',
    phoneNumber: '+60198765433',
    email: 'sarah@example.com',
    carPlate: 'GHI789',
    status: 'approved',
    createdAt: '2024-03-17T14:20:00Z',
    dateSettled: '2024-03-18T11:45:00Z'
  },
  {
    id: '5',
    customerName: 'David Lee',
    phoneNumber: '+60123456791',
    email: 'david@example.com',
    carPlate: 'JKL012',
    status: 'rejected',
    createdAt: '2024-03-16T11:45:00Z',
    dateSettled: '2024-03-17T16:30:00Z',
    rejectionReason: 'Warranty expired and customer provided insufficient documentation for claim verification.'
  },
  {
    id: '6',
    customerName: 'Emily Chen',
    phoneNumber: '+60198765434',
    email: 'emily@example.com',
    carPlate: 'MNO345',
    status: 'rejected',
    createdAt: '2024-03-15T16:30:00Z',
    dateSettled: '2024-03-16T10:15:00Z',
    rejectionReason: 'Claim was submitted after the warranty period had ended.'
  }
];

const AllClaims = () => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
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
    customerName: '',
    phoneNumber: '',
    email: '',
    carPlate: ''
  });
  const { toast } = useToast();

  // TODO: Replace with actual API call when BE is ready
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new claim with pending status
    const newClaim: Claim = {
      id: Date.now().toString(), // Temporary ID generation
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Add to claims list
    setClaims(prevClaims => [newClaim, ...prevClaims]);
    
    // Reset form and show success
    setFormData({
      customerName: '',
      phoneNumber: '',
      email: '',
      carPlate: ''
    });
    setIsCreateModalOpen(false);
    setIsSuccessModalOpen(true);
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
        claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.phoneNumber.includes(searchTerm) ||
        claim.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.carPlate.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesStatus = false;
      if (statusFilter === 'all') {
        matchesStatus = true;
      } else if (statusFilter === 'open') {
        matchesStatus = !claim.dateClosed;
      } else {
        matchesStatus = claim.status === statusFilter;
      }
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortOrder === 'desc') {
        return dateB - dateA; // Most recent first
      } else {
        return dateA - dateB; // Least recent first
      }
    });

  // Handler for closing a claim
  const handleCloseClaim = (id: string) => {
    setClaims(prevClaims => prevClaims.map(claim =>
      claim.id === id ? { ...claim, dateClosed: new Date().toISOString() } : claim
    ));
    setIsCloseModalOpen(false);
    setCloseTargetId(null);
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
                      <TableCell className="text-white font-medium">{claim.customerName}</TableCell>
                      <TableCell className="text-white">{claim.phoneNumber}</TableCell>
                      <TableCell className="text-white">{claim.email}</TableCell>
                      <TableCell className="text-white font-medium">{claim.carPlate}</TableCell>
                      <TableCell className="text-white text-sm">{formatDate(claim.createdAt)}</TableCell>
                      <TableCell className="text-white text-sm">
                        {claim.dateSettled ? formatDate(claim.dateSettled) : '-'}
                      </TableCell>
                      <TableCell className="text-white text-sm">
                        {claim.dateClosed ? formatDate(claim.dateClosed) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          claim.status === 'approved' 
                            ? 'bg-green-500/10 text-green-500' 
                            : claim.status === 'rejected'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        {(claim.status === 'approved' || claim.status === 'rejected') && !claim.dateClosed && (
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

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-tayaria-gray">
            {filteredClaims.length > 0 ? (
              filteredClaims.map(claim => (
                <div key={claim.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">{claim.customerName}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      claim.status === 'approved' 
                        ? 'bg-green-500/10 text-green-500' 
                        : claim.status === 'rejected'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">Phone: <span className="text-white">{claim.phoneNumber}</span></p>
                    <p className="text-gray-400 text-sm">Email: <span className="text-white">{claim.email}</span></p>
                    <p className="text-gray-400 text-sm">Car Plate: <span className="text-white font-medium">{claim.carPlate}</span></p>
                    <p className="text-gray-400 text-sm">Created: <span className="text-white">{formatDate(claim.createdAt)}</span></p>
                    <p className="text-gray-400 text-sm">Settled: <span className="text-white">{claim.dateSettled ? formatDate(claim.dateSettled) : '-'}</span></p>
                    <p className="text-gray-400 text-sm">Closed: <span className="text-white">{claim.dateClosed ? formatDate(claim.dateClosed) : '-'}</span></p>
                    {(claim.status === 'approved' || claim.status === 'rejected') && !claim.dateClosed && (
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
        </div>

        {/* Create Claim Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Claim</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-400 mb-1">
                  Customer Name *
                </label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="bg-tayaria-gray border-tayaria-gray text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-400 mb-1">
                  Phone Number *
                </label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
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
                <label htmlFor="carPlate" className="block text-sm font-medium text-gray-400 mb-1">
                  Car Plate *
                </label>
                <Input
                  id="carPlate"
                  name="carPlate"
                  value={formData.carPlate}
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Create Claim
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
                  <p className="text-white">{formatDate(selectedClaim.dateSettled!)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Reason for Rejection</label>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-white">{selectedClaim.rejectionReason}</p>
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
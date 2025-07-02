import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Tag, Check, X, Eye } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import MasterLayout from '@/components/master/MasterLayout';
import MasterHeader from '@/components/master/MasterHeader';

// TODO: Replace with actual API types when BE is ready
interface Claim {
  id: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  carPlate: string;
  shopName: string;
  shopContact: string;
  status: 'unacknowledged' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  taggedWarrantyId?: string;
  dateSettled?: string;
  rejectionReason?: string;
  tyreDetails?: TyreDetail[];
}

interface TyreDetail {
  id: string;
  brand: string;
  size: string;
  cost: number;
}

interface Warranty {
  id: string;
  customerName: string;
  carPlate: string;
  purchaseDate: string;
  expirationDate: string;
  receiptUrl: string;
}

// TODO: Replace with actual API calls when BE is ready
const mockClaims: Claim[] = [
  {
    id: '1',
    customerName: 'John Doe',
    phoneNumber: '+60123456789',
    email: 'john@example.com',
    carPlate: 'ABC123',
    shopName: 'Tayaria Main Shop',
    shopContact: '+60321234567',
    status: 'unacknowledged',
    createdAt: '2024-03-20T10:00:00Z'
  },
  {
    id: '2',
    customerName: 'Ahmad Rahman',
    phoneNumber: '+60123456791',
    email: 'ahmad@example.com',
    carPlate: 'DEF456',
    shopName: 'Tayaria Branch KL',
    shopContact: '+60321234568',
    status: 'unacknowledged',
    createdAt: '2024-03-20T14:00:00Z'
  },
  {
    id: '3',
    customerName: 'Jane Smith',
    phoneNumber: '+60198765432',
    email: 'jane@example.com',
    carPlate: 'XYZ789',
    shopName: 'Tayaria Branch KL',
    shopContact: '+60321234568',
    status: 'pending',
    createdAt: '2024-03-19T15:30:00Z'
  },
  {
    id: '4',
    customerName: 'Lisa Chen',
    phoneNumber: '+60123456792',
    email: 'lisa@example.com',
    carPlate: 'GHI789',
    shopName: 'Tayaria Branch Selangor',
    shopContact: '+60321234569',
    status: 'pending',
    createdAt: '2024-03-19T11:00:00Z',
    taggedWarrantyId: 'W003'
  },
  {
    id: '5',
    customerName: 'Michael Brown',
    phoneNumber: '+60123456790',
    email: 'michael@example.com',
    carPlate: 'DEF456',
    shopName: 'Tayaria Branch Selangor',
    shopContact: '+60321234569',
    status: 'approved',
    createdAt: '2024-03-18T09:15:00Z',
    taggedWarrantyId: 'W002',
    dateSettled: '2024-03-19T10:30:00Z',
    tyreDetails: [
      { id: '1', brand: 'Michelin', size: '205/55R16', cost: 450 },
      { id: '2', brand: 'Michelin', size: '205/55R16', cost: 450 }
    ]
  },
  {
    id: '6',
    customerName: 'Sarah Wilson',
    phoneNumber: '+60198765433',
    email: 'sarah@example.com',
    carPlate: 'JKL012',
    shopName: 'Tayaria Branch Johor',
    shopContact: '+60321234570',
    status: 'rejected',
    createdAt: '2024-03-17T14:20:00Z',
    dateSettled: '2024-03-18T16:45:00Z',
    rejectionReason: 'Warranty expired and customer provided insufficient documentation for claim verification.'
  }
];

// TODO: Replace with actual API calls when BE is ready
const mockWarranties: Warranty[] = [
  {
    id: 'W001',
    customerName: 'John Doe',
    carPlate: 'ABC123',
    purchaseDate: '2023-01-15T10:00:00Z',
    expirationDate: '2025-01-15T10:00:00Z',
    receiptUrl: '/app_assets/tayaria_sample_receipt.jpg'
  },
  {
    id: 'W002',
    customerName: 'Michael Brown',
    carPlate: 'DEF456',
    purchaseDate: '2023-06-20T14:00:00Z',
    expirationDate: '2025-06-20T14:00:00Z',
    receiptUrl: '/app_assets/tayaria_sample_receipt.jpg'
  },
  {
    id: 'W003',
    customerName: 'Lisa Chen',
    carPlate: 'GHI789',
    purchaseDate: '2023-09-10T11:30:00Z',
    expirationDate: '2025-09-10T11:30:00Z',
    receiptUrl: '/app_assets/tayaria_sample_receipt.jpg'
  },
  {
    id: 'W004',
    customerName: 'Jane Smith',
    carPlate: 'XYZ789',
    purchaseDate: '2023-03-25T16:45:00Z',
    expirationDate: '2025-03-25T16:45:00Z',
    receiptUrl: '/app_assets/tayaria_sample_receipt.jpg'
  },
  {
    id: 'W005',
    customerName: 'Ahmad Rahman',
    carPlate: 'DEF456',
    purchaseDate: '2023-12-05T13:20:00Z',
    expirationDate: '2025-12-05T13:20:00Z',
    receiptUrl: '/app_assets/tayaria_sample_receipt.jpg'
  },
  {
    id: 'W006',
    customerName: 'Jane Smith',
    carPlate: 'XYZ789',
    purchaseDate: '2024-01-10T09:15:00Z',
    expirationDate: '2026-01-10T09:15:00Z',
    receiptUrl: '/app_assets/tayaria_sample_receipt.jpg'
  }
];

const ManageClaims = () => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isViewWarrantyModalOpen, setIsViewWarrantyModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Tyre details form state
  const [tyreQuantity, setTyreQuantity] = useState<number>(1);
  const [tyreDetails, setTyreDetails] = useState<TyreDetail[]>([
    { id: '1', brand: '', size: '', cost: 0 }
  ]);

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

  // Get warranties by car plate
  const getWarrantiesByCarPlate = (carPlate: string) => {
    return mockWarranties.filter(warranty => warranty.carPlate === carPlate);
  };

  // Get warranty by ID
  const getWarrantyById = (warrantyId: string) => {
    return mockWarranties.find(warranty => warranty.id === warrantyId);
  };

  // Handle moving claim to pending
  const handleMoveToPending = (claimId: string) => {
    setClaims(prevClaims => 
      prevClaims.map(claim => 
        claim.id === claimId ? { ...claim, status: 'pending' } : claim
      )
    );
  };

  // Handle opening tag warranty modal
  const handleOpenTagModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsTagModalOpen(true);
  };

  // Handle tagging warranty to claim
  const handleTagWarranty = (warrantyId: string) => {
    if (selectedClaim) {
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === selectedClaim.id 
            ? { ...claim, taggedWarrantyId: warrantyId } 
            : claim
        )
      );
      setIsTagModalOpen(false);
      setSelectedClaim(null);
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
  const handleOpenConfirmModal = (claim: Claim, action: 'accept' | 'reject') => {
    setSelectedClaim(claim);
    setConfirmAction(action);
    setRejectionReason('');
    if (action === 'accept') {
      resetTyreForm();
    }
    setIsConfirmModalOpen(true);
  };

  // Handle confirming action
  const handleConfirmAction = () => {
    if (selectedClaim && confirmAction) {
      // Validate rejection reason if rejecting
      if (confirmAction === 'reject' && !rejectionReason.trim()) {
        return; // Don't proceed if rejection reason is empty
      }

      // Validate tyre details if accepting
      if (confirmAction === 'accept' && !isTyreDetailsComplete()) {
        return; // Don't proceed if tyre details are incomplete
      }

      const newStatus = confirmAction === 'accept' ? 'approved' : 'rejected';
      const currentDate = new Date().toISOString();
      
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === selectedClaim.id 
            ? { 
                ...claim, 
                status: newStatus, 
                dateSettled: currentDate,
                rejectionReason: confirmAction === 'reject' ? rejectionReason : undefined,
                tyreDetails: confirmAction === 'accept' ? tyreDetails : undefined
              } 
            : claim
        )
      );
      setIsConfirmModalOpen(false);
      setSelectedClaim(null);
      setConfirmAction(null);
      setRejectionReason('');
      resetTyreForm();
    }
  };

  // Handle opening history detail modal
  const handleOpenHistoryDetail = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsHistoryDetailModalOpen(true);
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

  const filteredClaims = (status: Claim['status'][] | 'all') => {
    return claims.filter(claim => {
      const matchesSearch = 
        claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.phoneNumber.includes(searchTerm) ||
        claim.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = status === 'all' || status.includes(claim.status);
      
      return matchesSearch && matchesStatus;
    });
  };

  const ClaimsTable = ({ claims, tabType }: { claims: Claim[], tabType: 'unacknowledged' | 'pending' | 'history' }) => (
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
                    {tabType === 'history' ? truncateText(claim.customerName, 20) : claim.customerName}
                  </TableCell>
                  <TableCell className="text-white">{claim.phoneNumber}</TableCell>
                  <TableCell className="text-white">{claim.email}</TableCell>
                  <TableCell className="text-white font-medium">{claim.carPlate}</TableCell>
                  <TableCell className="text-white font-medium">
                    {tabType === 'history' ? truncateText(claim.shopName, 25) : claim.shopName}
                  </TableCell>
                  <TableCell className="text-white text-sm">
                    {claim.shopContact}
                  </TableCell>
                  <TableCell className="text-white text-sm">{formatDate(claim.createdAt)}</TableCell>
                  {tabType === 'history' && (
                    <TableCell className="text-white text-sm">
                      {claim.dateSettled ? formatDate(claim.dateSettled) : '-'}
                    </TableCell>
                  )}
                  {(tabType === 'pending' || tabType === 'history') && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {claim.taggedWarrantyId ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewWarranty(claim.taggedWarrantyId!)}
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
                          {!claim.taggedWarrantyId ? (
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

        <Tabs defaultValue="unacknowledged" className="space-y-4">
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

          <TabsContent value="unacknowledged">
            <ClaimsTable claims={filteredClaims(['unacknowledged'])} tabType="unacknowledged" />
          </TabsContent>

          <TabsContent value="pending">
            <ClaimsTable claims={filteredClaims(['pending'])} tabType="pending" />
          </TabsContent>

          <TabsContent value="history">
            <ClaimsTable claims={filteredClaims(['approved', 'rejected'])} tabType="history" />
          </TabsContent>
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
                  <p className="text-gray-400">Car Plate: <span className="text-white font-medium">{selectedClaim.carPlate}</span></p>
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
                  {selectedClaim && getWarrantiesByCarPlate(selectedClaim.carPlate).map(warranty => (
                    <TableRow key={warranty.id} className="border-tayaria-gray hover:bg-tayaria-gray">
                      <TableCell className="text-white font-medium">{warranty.customerName}</TableCell>
                      <TableCell className="text-white">{formatDate(warranty.purchaseDate)}</TableCell>
                      <TableCell className="text-white">{formatDate(warranty.expirationDate)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReceipt(warranty.receiptUrl)}
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
                  ))}
                  {selectedClaim && getWarrantiesByCarPlate(selectedClaim.carPlate).length === 0 && (
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
                    <p className="text-white">{selectedWarranty.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Car Plate
                    </label>
                    <p className="text-white">{selectedWarranty.carPlate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Purchase Date
                    </label>
                    <p className="text-white">{formatDate(selectedWarranty.purchaseDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Expiration Date
                    </label>
                    <p className="text-white">{formatDate(selectedWarranty.expirationDate)}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    onClick={() => handleViewReceipt(selectedWarranty.receiptUrl)}
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
                  <p className="text-white"><strong>Customer:</strong> {selectedClaim.customerName}</p>
                  <p className="text-white"><strong>Car Plate:</strong> {selectedClaim.carPlate}</p>
                  <p className="text-white"><strong>Shop:</strong> {selectedClaim.shopName}</p>
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
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 bg-tayaria-gray border border-tayaria-gray rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tayaria-yellow"
                    placeholder="Please provide a detailed reason for rejecting this claim..."
                    rows={4}
                    required
                  />
                  {rejectionReason.trim() === '' && (
                    <p className="text-red-400 text-sm mt-1">Rejection reason is required</p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setRejectionReason('');
                  resetTyreForm();
                }}
                className="border-tayaria-gray text-white hover:bg-tayaria-gray"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={
                  (confirmAction === 'reject' && !rejectionReason.trim()) ||
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
            {selectedClaim && (
              <div className="space-y-4">
                {/* Claim Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Claim Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-0.5">Customer Name</label>
                      <p className="text-white text-sm">{selectedClaim.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-0.5">Phone Number</label>
                      <p className="text-white text-sm">{selectedClaim.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-0.5">Email</label>
                      <p className="text-white text-sm">{selectedClaim.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-0.5">Car Plate</label>
                      <p className="text-white text-sm">{selectedClaim.carPlate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-0.5">Shop Name</label>
                      <p className="text-white text-sm">{selectedClaim.shopName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-0.5">Shop Contact</label>
                      <p className="text-white text-sm">{selectedClaim.shopContact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-0.5">Created Date</label>
                      <p className="text-white text-sm">{formatDate(selectedClaim.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-0.5">Date Settled</label>
                      <p className="text-white text-sm">{selectedClaim.dateSettled ? formatDate(selectedClaim.dateSettled) : '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-0.5">Status</label>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedClaim.status === 'approved' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedClaim.rejectionReason && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Rejection Reason</h3>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-white text-sm">{selectedClaim.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Warranty Information */}
                {selectedClaim.taggedWarrantyId && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Tagged Warranty</h3>
                    {(() => {
                      const warranty = getWarrantyById(selectedClaim.taggedWarrantyId);
                      return warranty ? (
                        <div className="p-3 bg-tayaria-gray rounded-lg">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-0.5">Warranty ID</label>
                              <p className="text-white text-sm">{warranty.id}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-0.5">Customer Name</label>
                              <p className="text-white text-sm">{warranty.customerName}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-0.5">Car Plate</label>
                              <p className="text-white text-sm">{warranty.carPlate}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-0.5">Purchase Date</label>
                              <p className="text-white text-sm">{formatDate(warranty.purchaseDate)}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-0.5">Expiration Date</label>
                              <p className="text-white text-sm">{formatDate(warranty.expirationDate)}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleViewReceipt(warranty.receiptUrl)}
                            className="bg-tayaria-yellow text-black hover:bg-tayaria-yellow/90 text-sm"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Warranty Receipt
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Warranty information not found</p>
                      );
                    })()}
                  </div>
                )}

                {/* Tyre Details */}
                {selectedClaim.tyreDetails && selectedClaim.tyreDetails.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Tyre Details</h3>
                    <div className="space-y-3">
                      {selectedClaim.tyreDetails.map((tyre, index) => (
                        <div key={tyre.id} className="p-3 bg-tayaria-gray rounded-lg">
                          <h4 className="text-white font-medium mb-2">Tyre {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-0.5">Brand</label>
                              <p className="text-white text-sm">{tyre.brand}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-0.5">Size</label>
                              <p className="text-white text-sm">{tyre.size}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-0.5">Cost</label>
                              <p className="text-white text-sm">RM {tyre.cost.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 text-sm font-medium">
                          Total Cost: RM {selectedClaim.tyreDetails.reduce((sum, tyre) => sum + tyre.cost, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsHistoryDetailModalOpen(false)}
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
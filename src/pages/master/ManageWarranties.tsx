import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MasterLayout from '@/components/master/MasterLayout';
import MasterHeader from '@/components/master/MasterHeader';

// TODO: Replace with actual API types when BE is ready
interface Warranty {
  id: string;
  shopName: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  carPlate: string;
  status: 'active' | 'expired' | 'used';
  purchasedDate: string;
  createdDate: string;
  expirationDate: string;
}

interface ShopSummary {
  shopName: string;
  activeCount: number;
  totalCount: number;
  warranties: Warranty[];
}

// TODO: Replace with actual API calls when BE is ready
const mockWarranties: Warranty[] = [
  {
    id: '1',
    shopName: 'Tayaria Main Shop',
    customerName: 'John Doe',
    phoneNumber: '+60123456789',
    email: 'john@example.com',
    carPlate: 'ABC123',
    status: 'active',
    purchasedDate: '2024-01-15T10:00:00Z',
    createdDate: '2024-01-15T10:00:00Z',
    expirationDate: '2026-01-15T10:00:00Z'
  },
  {
    id: '2',
    shopName: 'Tayaria Branch KL',
    customerName: 'Jane Smith',
    phoneNumber: '+60198765432',
    email: 'jane@example.com',
    carPlate: 'XYZ789',
    status: 'expired',
    purchasedDate: '2022-06-20T15:30:00Z',
    createdDate: '2022-06-20T15:30:00Z',
    expirationDate: '2024-06-20T15:30:00Z'
  },
  {
    id: '3',
    shopName: 'Tayaria Main Shop',
    customerName: 'Michael Brown',
    phoneNumber: '+60123456790',
    email: 'michael@example.com',
    carPlate: 'DEF456',
    status: 'used',
    purchasedDate: '2023-03-10T09:15:00Z',
    createdDate: '2023-03-10T09:15:00Z',
    expirationDate: '2025-03-10T09:15:00Z'
  },
  {
    id: '4',
    shopName: 'Tayaria Branch Selangor',
    customerName: 'Sarah Wilson',
    phoneNumber: '+60198765433',
    email: 'sarah@example.com',
    carPlate: 'GHI789',
    status: 'active',
    purchasedDate: '2024-02-25T14:20:00Z',
    createdDate: '2024-02-25T14:20:00Z',
    expirationDate: '2026-02-25T14:20:00Z'
  },
  {
    id: '5',
    shopName: 'Tayaria Branch KL',
    customerName: 'David Lee',
    phoneNumber: '+60123456791',
    email: 'david@example.com',
    carPlate: 'JKL012',
    status: 'active',
    purchasedDate: '2024-03-01T11:00:00Z',
    createdDate: '2024-03-01T11:00:00Z',
    expirationDate: '2026-03-01T11:00:00Z'
  }
];

const ManageWarranties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'warranties' | 'shops'>('warranties');
  const [expandedShops, setExpandedShops] = useState<Set<string>>(new Set());

  const toggleShopExpansion = (shopName: string) => {
    const newExpanded = new Set(expandedShops);
    if (newExpanded.has(shopName)) {
      newExpanded.delete(shopName);
    } else {
      newExpanded.add(shopName);
    }
    setExpandedShops(newExpanded);
  };

  const filteredWarranties = mockWarranties.filter(warranty => {
    const searchLower = searchTerm.toLowerCase();
    return (
      warranty.shopName.toLowerCase().includes(searchLower) ||
      warranty.customerName.toLowerCase().includes(searchLower) ||
      warranty.phoneNumber.includes(searchTerm) ||
      warranty.email.toLowerCase().includes(searchLower) ||
      warranty.carPlate.toLowerCase().includes(searchLower)
    );
  });

  const getShopSummaries = (): ShopSummary[] => {
    const shopMap = new Map<string, ShopSummary>();
    
    filteredWarranties.forEach(warranty => {
      if (!shopMap.has(warranty.shopName)) {
        shopMap.set(warranty.shopName, {
          shopName: warranty.shopName,
          activeCount: 0,
          totalCount: 0,
          warranties: []
        });
      }
      
      const shop = shopMap.get(warranty.shopName)!;
      shop.warranties.push(warranty);
      shop.totalCount++;
      if (warranty.status === 'active') {
        shop.activeCount++;
      }
    });
    
    return Array.from(shopMap.values());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusBadge = (status: Warranty['status']) => {
    const statusConfig = {
      active: { bg: 'bg-green-500/10', text: 'text-green-500' },
      expired: { bg: 'bg-red-500/10', text: 'text-red-500' },
      used: { bg: 'bg-gray-500/10', text: 'text-gray-500' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const WarrantiesTable = ({ warranties }: { warranties: Warranty[] }) => (
    <div className="tayaria-card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-tayaria-darkgray">
            <TableRow className="hover:bg-transparent border-tayaria-gray">
              <TableHead className="text-gray-400">Shop Name</TableHead>
              <TableHead className="text-gray-400">Customer Name</TableHead>
              <TableHead className="text-gray-400">Phone No.</TableHead>
              <TableHead className="text-gray-400">Email</TableHead>
              <TableHead className="text-gray-400">Car Plate</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Purchased Date</TableHead>
              <TableHead className="text-gray-400">Created Date</TableHead>
              <TableHead className="text-gray-400">Expiration Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warranties.length > 0 ? (
              warranties.map(warranty => (
                <TableRow key={warranty.id} className="border-tayaria-gray hover:bg-tayaria-darkgray">
                  <TableCell className="text-white font-medium">{warranty.shopName}</TableCell>
                  <TableCell className="text-white">{warranty.customerName}</TableCell>
                  <TableCell className="text-white">{warranty.phoneNumber}</TableCell>
                  <TableCell className="text-white">{warranty.email}</TableCell>
                  <TableCell className="text-white">{warranty.carPlate}</TableCell>
                  <TableCell>{getStatusBadge(warranty.status)}</TableCell>
                  <TableCell className="text-white">{formatDate(warranty.purchasedDate)}</TableCell>
                  <TableCell className="text-white">{formatDate(warranty.createdDate)}</TableCell>
                  <TableCell className="text-white">{formatDate(warranty.expirationDate)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <p className="text-white">No warranties found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const ShopsView = () => {
    const shopSummaries = getShopSummaries();
    
    return (
      <div className="space-y-4">
        {shopSummaries.length > 0 ? (
          shopSummaries.map(shop => (
            <div key={shop.shopName} className="tayaria-card">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-tayaria-gray/5 transition-colors"
                onClick={() => toggleShopExpansion(shop.shopName)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {expandedShops.has(shop.shopName) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{shop.shopName}</h3>
                  </div>
                </div>
                <div className="flex space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-500 font-semibold text-lg">{shop.activeCount}</div>
                    <div className="text-gray-400">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">{shop.totalCount}</div>
                    <div className="text-gray-400">Total</div>
                  </div>
                </div>
              </div>
              
              {expandedShops.has(shop.shopName) && (
                <div className="border-t border-tayaria-gray">
                  <WarrantiesTable warranties={shop.warranties} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="tayaria-card text-center py-8">
            <p className="text-white">No shops found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <MasterLayout>
      <MasterHeader title="Manage Warranties" />
      
      <main className="p-4 md:p-6">
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center bg-tayaria-darkgray rounded-lg p-2 w-full md:w-[70%]">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              placeholder="Search warranties by shop, customer, phone, email or car plate"
              className="border-0 bg-transparent text-white focus-visible:ring-0 placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'warranties' ? 'default' : 'outline'}
              onClick={() => setViewMode('warranties')}
              className={viewMode === 'warranties' 
                ? "bg-tayaria-yellow text-black hover:bg-tayaria-yellow/90" 
                : "border-tayaria-gray text-white hover:bg-tayaria-gray/10"
              }
            >
              View by Warranties
            </Button>
            <Button
              variant={viewMode === 'shops' ? 'default' : 'outline'}
              onClick={() => setViewMode('shops')}
              className={viewMode === 'shops' 
                ? "bg-tayaria-yellow text-black hover:bg-tayaria-yellow/90" 
                : "border-tayaria-gray text-white hover:bg-tayaria-gray/10"
              }
            >
              View by Shops
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'warranties' ? (
          <WarrantiesTable warranties={filteredWarranties} />
        ) : (
          <ShopsView />
        )}
      </main>
    </MasterLayout>
  );
};

export default ManageWarranties; 
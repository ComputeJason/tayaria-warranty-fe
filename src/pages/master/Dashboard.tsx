import React, { useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import MasterHeader from '@/components/master/MasterHeader';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data - replace with actual data from API
const mockShops = [
  { id: '1', name: 'Shop A' },
  { id: '2', name: 'Shop B' },
  { id: '3', name: 'Shop C' },
];

const mockTopClaims = [
  { id: '1', name: 'John Doe', phone: '1234567890', totalClaims: 5 },
  { id: '2', name: 'Jane Smith', phone: '0987654321', totalClaims: 4 },
  // ... more data
];

const mockShopStats = [
  { shopName: 'Shop A', totalWarranties: 100, totalClaims: 20, claimPercentage: 20 },
  { shopName: 'Shop B', totalWarranties: 150, totalClaims: 30, claimPercentage: 20 },
  { shopName: 'Shop C', totalWarranties: 200, totalClaims: 50, claimPercentage: 25 },
];

const mockSupplierAmounts = [
  { supplier: 'Supplier A', amount: 5000 },
  { supplier: 'Supplier B', amount: 3000 },
  { supplier: 'Supplier C', amount: 2000 },
];

const mockHistoricalData = [
  { month: 'Jan', warranties: 100, claims: 20 },
  { month: 'Feb', warranties: 120, claims: 25 },
  { month: 'Mar', warranties: 150, claims: 30 },
  // ... more data
];

const Dashboard = () => {
  const [selectedShop, setSelectedShop] = useState('');

  return (
    <MasterLayout>
      <MasterHeader title="Dashboard" />
      
      <main className="p-4 md:p-6">
        {/* Shop Selection */}
        <div className="mb-6">
          <Select value={selectedShop} onValueChange={setSelectedShop}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a shop" />
            </SelectTrigger>
            <SelectContent>
              {mockShops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Per Shop Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Per Shop Statistics</h2>
          
          {/* Top 10 Claims Table */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Top 10 Claims</h3>
            <div className="bg-tayaria-darkgray rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Phone</TableHead>
                    <TableHead className="text-white">Total Claims</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTopClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="text-white">{claim.name}</TableCell>
                      <TableCell className="text-white">{claim.phone}</TableCell>
                      <TableCell className="text-white">{claim.totalClaims}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Shop Statistics Table */}
          <div className="bg-tayaria-darkgray rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Shop Name</TableHead>
                  <TableHead className="text-white">Total Warranties</TableHead>
                  <TableHead className="text-white">Total Claims</TableHead>
                  <TableHead className="text-white">Claim Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockShopStats.map((stat) => (
                  <TableRow key={stat.shopName}>
                    <TableCell className="text-white">{stat.shopName}</TableCell>
                    <TableCell className="text-white">{stat.totalWarranties}</TableCell>
                    <TableCell className="text-white">{stat.totalClaims}</TableCell>
                    <TableCell className="text-white">{stat.claimPercentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Overall Statistics</h2>
          
          {/* Supplier Amount Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {mockSupplierAmounts.map((supplier) => (
              <Card key={supplier.supplier} className="bg-tayaria-darkgray border-tayaria-gray">
                <CardHeader>
                  <CardTitle className="text-white">{supplier.supplier}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-tayaria-yellow">
                    ${supplier.amount.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Historical Trend Chart */}
          <div className="bg-tayaria-darkgray rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Historical Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockHistoricalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="warranties" 
                    stroke="#EAB308" 
                    name="Warranties"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="claims" 
                    stroke="#EF4444" 
                    name="Claims"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </MasterLayout>
  );
};

export default Dashboard; 
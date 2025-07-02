import React, { useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import MasterHeader from '@/components/master/MasterHeader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Eye, EyeOff, Search, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// TODO: Replace with actual API types when BE is ready
interface RetailAccount {
  id: string;
  shopName: string;
  address: string;
  contact: string;
  username: string;
  dateCreated: string;
  status: 'Active' | 'Inactive';
}

// TODO: Replace with actual data from API when BE is ready
const initialMockAccounts: RetailAccount[] = [
  {
    id: '1',
    shopName: 'Shop A',
    address: '123 Main St',
    contact: '+60123456789',
    username: 'shopa',
    dateCreated: '2024-01-01',
    status: 'Active'
  },
  {
    id: '2',
    shopName: 'Shop B',
    address: '456 Oak St',
    contact: '+60123456790',
    username: 'shopb',
    dateCreated: '2024-01-15',
    status: 'Active'
  },
  {
    id: '3',
    shopName: 'Tyre Centre C',
    address: '789 Pine Ave',
    contact: '+60123456791',
    username: 'tyrecentrec',
    dateCreated: '2024-02-01',
    status: 'Inactive'
  },
  {
    id: '4',
    shopName: 'Auto Shop D',
    address: '321 Elm St',
    contact: '+60123456792',
    username: 'autoshopd',
    dateCreated: '2024-02-15',
    status: 'Active'
  },
];

const CreateRetailAccount = () => {
  const [accounts, setAccounts] = useState<RetailAccount[]>(initialMockAccounts);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    contact: '',
    username: '',
    password: ''
  });
  const { toast } = useToast();

  const filteredAccounts = accounts.filter(account => 
    account.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Check if username already exists
      const usernameExists = accounts.some(account => 
        account.username.toLowerCase() === formData.username.toLowerCase()
      );
      
      if (usernameExists) {
        toast({
          title: "Error",
          description: "Username already exists. Please choose a different username.",
          variant: "destructive",
        });
        return;
      }

      // TODO: Replace with actual API call when BE is ready
      // const response = await fetch('/api/retail-accounts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // if (!response.ok) throw new Error('Failed to create account');
      // const newAccount = await response.json();
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create new account object
      const newAccount: RetailAccount = {
        id: Date.now().toString(), // TODO: Replace with actual ID from backend
        shopName: formData.shopName,
        address: formData.address,
        contact: formData.contact,
        username: formData.username,
        dateCreated: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        status: 'Active'
      };

      // Add to accounts list
      setAccounts(prevAccounts => [newAccount, ...prevAccounts]);
      
      // Reset form and close dialog
      setFormData({
        shopName: '',
        address: '',
        contact: '',
        username: '',
        password: ''
      });
      setIsCreateDialogOpen(false);
      setIsSuccessDialogOpen(true);
      
      // Show success toast
      toast({
        title: "Account Created",
        description: `Retail account for ${formData.shopName} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (id: string) => {
    // TODO: Implement edit logic
    console.log('Editing account:', id);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete logic
    console.log('Deleting account:', id);
  };

  const handleToggleStatus = (id: string) => {
    // TODO: Implement status toggle logic
    console.log('Toggling status for account:', id);
  };

  return (
    <MasterLayout>
      <MasterHeader title="Create Retail Account" />
      
      <main className="p-4 md:p-6">
        {/* Create Account Button and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-3 md:space-y-0">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-tayaria-yellow hover:bg-tayaria-yellow/90 text-black">
                Create New Retail Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-tayaria-darkgray border-tayaria-gray">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Retail Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="shopName" className="block text-white mb-2">Shop Name</label>
                  <Input
                    id="shopName"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    className="bg-tayaria-gray text-white border-tayaria-gray"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-white mb-2">Address</label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-tayaria-gray text-white border-tayaria-gray"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact" className="block text-white mb-2">Contact</label>
                  <Input
                    id="contact"
                    name="contact"
                    type="tel"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="bg-tayaria-gray text-white border-tayaria-gray"
                    placeholder="+60123456789"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-white mb-2">Username</label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="bg-tayaria-gray text-white border-tayaria-gray"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-white mb-2">Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-tayaria-gray text-white border-tayaria-gray pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-tayaria-gray text-white hover:bg-tayaria-gray"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-tayaria-yellow hover:bg-tayaria-yellow/90 text-black disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Search Bar */}
          <div className="flex items-center bg-tayaria-darkgray rounded-lg p-2 w-full md:w-[40%]">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              placeholder="Search accounts by shop name, address, contact, or username"
              className="border-0 bg-transparent text-white focus-visible:ring-0 placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Existing Accounts Table */}
        <div className="bg-tayaria-darkgray rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Shop Name</TableHead>
                <TableHead className="text-white">Address</TableHead>
                <TableHead className="text-white">Contact</TableHead>
                <TableHead className="text-white">Username</TableHead>
                <TableHead className="text-white">Date Created</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="text-white">{account.shopName}</TableCell>
                    <TableCell className="text-white">{account.address}</TableCell>
                    <TableCell className="text-white">{account.contact}</TableCell>
                    <TableCell className="text-white">{account.username}</TableCell>
                    <TableCell className="text-white">{account.dateCreated}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        account.status === 'Active' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {account.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(account.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(account.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {account.status === 'Active' ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(account.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-white">No accounts found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Success Modal */}
        <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
          <DialogContent className="bg-tayaria-darkgray border-tayaria-gray text-white">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                Account Created Successfully
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-gray-400">
                The retail account has been created and added to the system.
              </p>
              <div className="bg-tayaria-gray p-4 rounded-lg">
                <p className="text-white">
                  <strong>Account Details:</strong>
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  The new account will appear at the top of the accounts table.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsSuccessDialogOpen(false)}
                className="bg-tayaria-yellow hover:bg-tayaria-yellow/90 text-black"
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

export default CreateRetailAccount; 
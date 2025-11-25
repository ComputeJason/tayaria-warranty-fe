import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TermsAndConditions, { TermsAndConditionsContent } from './TermsAndConditions';
import { warrantyApi, convertApiWarrantyToFrontend } from '@/services/warrantyApi';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';

// Mock data types
interface Warranty {
  id: string;
  carPlate: string;
  registrationDate: string;
  expiryDate: string;
  purchaseDate: string;
  status: 'active' | 'expired' | 'used';
  tyreDetails: string;
  notes?: string;
}

const formSchema = z.object({
  carPlate: z.string().min(1, "Car plate is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CheckWarrantyStatusProps {
  initialCarPlate?: string;
  onNavigateToRegister?: () => void;
}

export function CheckWarrantyStatus({ initialCarPlate, onNavigateToRegister }: CheckWarrantyStatusProps) {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carPlate: initialCarPlate || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    // 1. If car plate field is empty, show error and return
    if (!data.carPlate || data.carPlate.trim() === "") {
      toast({
        title: "Error",
        description: "Carplate field is empty",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // Call the backend API
      const apiWarranties = await warrantyApi.getWarrantiesByCarPlate(data.carPlate.toUpperCase());
      
      // If null or not an array, treat as no warranties found
      if (!Array.isArray(apiWarranties) || apiWarranties.length === 0) {
        setWarranties([]);
        toast({
          title: "No Warranties Found",
          description: "This Carplate has no warranties registered",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      // Convert backend format to frontend format
      const frontendWarranties = apiWarranties.map(convertApiWarrantyToFrontend);
      setWarranties(frontendWarranties);
      
    } catch (error) {
      // 4. Hide technical errors, show generic error
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      setWarranties([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="carPlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black font-medium">Car Plate</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter car plate" 
                    {...field} 
                    className="bg-white text-black border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-lg" 
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Check Status"}
          </Button>
        </form>
      </Form>

      {hasSearched && warranties.length > 0 ? (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Warranties Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-red-700">Warranties</h2>
              {onNavigateToRegister && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToRegister}
                  className="text-xs bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Register New Warranty
                </Button>
              )}
            </div>
            {warranties.length > 0 ? (
              warranties.map((warranty) => (
                <Card
                  key={warranty.id}
                  className={`p-4 transition-all duration-200 shadow-lg border-2 ${
                    warranty.status === 'active' 
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' 
                      : 'bg-gray-50 border-gray-300 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="text-lg font-semibold text-red-700">
                        Tayaria Issued Warranty
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        warranty.status === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-200 text-gray-700 border border-gray-300'
                      }`}>
                        {warranty.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <strong className="text-red-700">Purchase Date:</strong> {warranty.purchaseDate ? format(new Date(warranty.purchaseDate), 'dd-MM-yyyy') : ''}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong className="text-red-700">Valid until:</strong> {warranty.expiryDate ? format(new Date(warranty.expiryDate), 'dd-MM-yyyy') : ''}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-yellow-200">
                      <p className="text-xs text-gray-500 italic">
                        *Refer to your receipt or contact your retailer for details of your purchase
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTermsModal(true)}
                        className="bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        View Terms & Conditions
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 shadow-lg">
                <p className="text-yellow-800 text-center font-medium">No warranties found</p>
              </Card>
            )}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 shadow-lg rounded-xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-red-700 text-lg font-medium mb-2">No matching warranties found</p>
                <p className="text-yellow-800 text-sm">This Car Plate has no warranties registered</p>
              </div>
              {onNavigateToRegister && (
                <Button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Register New Warranty
                </Button>
              )}
            </div>
          </Card>
        </div>
      ) : null}

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="bg-white border-2 border-yellow-300 max-h-[80vh] w-[90%] md:w-[900px] max-w-[900px] flex flex-col p-0 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 pb-4 rounded-t-lg relative">
            <DialogTitle className="text-red-700 text-center text-2xl mb-4 font-bold">Tayaria 360 Warranty Terms & Conditions</DialogTitle>
            <div className="border-t border-yellow-300 w-full" />
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <TermsAndConditionsContent />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
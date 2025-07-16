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
                <FormLabel>Car Plate</FormLabel>
                <FormControl>
                  <Input placeholder="Enter car plate" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Checking..." : "Check Status"}
          </Button>
        </form>
      </Form>

      {hasSearched && warranties.length > 0 ? (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Warranties Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Warranties</h2>
              {onNavigateToRegister && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToRegister}
                  className="text-xs"
                >
                  Register New Warranty
                </Button>
              )}
            </div>
            {warranties.length > 0 ? (
              warranties.map((warranty) => (
                <Card
                  key={warranty.id}
                  className={`p-4 transition-all duration-200 shadow-[0_2px_8px_rgba(255,255,255,0.2)] ${
                    warranty.status === 'active' ? 'bg-gray-50' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="text-lg font-semibold text-gray-900">
                        Tayaria Issued Warranty
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        warranty.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {warranty.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Purchase Date:</strong> {warranty.purchaseDate ? format(new Date(warranty.purchaseDate), 'dd-MM-yyyy') : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Valid until:</strong> {warranty.expiryDate ? format(new Date(warranty.expiryDate), 'dd-MM-yyyy') : ''}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 italic">
                        *Refer to your receipt or contact your retailer for details of your purchase
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTermsModal(true)}
                      >
                        View Terms & Conditions
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4 bg-gray-50 shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                <p className="text-gray-500 text-center">No warranties found</p>
              </Card>
            )}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="p-6 bg-gray-50 shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
            <p className="text-gray-700 text-center text-lg mb-4">No matching warranties registered to this Car Plate</p>
            {onNavigateToRegister && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Register New Warranty
                </Button>
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="bg-tayaria-darkgray border-tayaria-gray max-h-[80vh] w-[90%] md:w-[900px] max-w-[900px] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-white text-center text-2xl mb-4">TERMS AND CONDITIONS</DialogTitle>
            <div className="border-t border-tayaria-gray w-full" />
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6">
            <TermsAndConditionsContent />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
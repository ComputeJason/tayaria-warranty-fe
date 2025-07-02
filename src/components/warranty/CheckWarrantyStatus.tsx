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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carPlate: initialCarPlate || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setHasSearched(true);
    // TODO: Replace with actual API call
    // Mock data for demonstration
    const mockWarranties: Warranty[] = [
      // Active warranties
      {
        id: "W001",
        carPlate: "SKA1234A",
        registrationDate: "2024-01-15",
        expiryDate: "2025-01-15",
        purchaseDate: "2024-01-10",
        status: "active",
        tyreDetails: "Michelin Pilot Sport 4 (225/45R17)",
        notes: "Regular maintenance required. Next check due in 3 months."
      },
      {
        id: "W002",
        carPlate: "SKA1234A",
        registrationDate: "2024-02-01",
        expiryDate: "2025-02-01",
        purchaseDate: "2024-01-25",
        status: "active",
        tyreDetails: "Bridgestone Potenza RE003 (235/40R18)",
        notes: "High-performance tyres. Monitor wear pattern."
      },
      // Expired warranty
      {
        id: "W003",
        carPlate: "SKA1234A",
        registrationDate: "2023-01-01",
        expiryDate: "2024-01-01",
        purchaseDate: "2022-12-20",
        status: "expired",
        tyreDetails: "Goodyear Eagle F1 (215/45R17)",
        notes: "Warranty expired. Consider replacement."
      },
      // Used warranty (claim made)
      {
        id: "W004",
        carPlate: "SKA1234A",
        registrationDate: "2023-06-01",
        expiryDate: "2024-06-01",
        purchaseDate: "2023-05-25",
        status: "used",
        tyreDetails: "Continental PremiumContact 6 (225/45R17)",
        notes: "Warranty used for puncture repair on 2024-01-15"
      },
      // Different car plate - only active warranties
      {
        id: "W005",
        carPlate: "SCC9012C",
        registrationDate: "2024-01-01",
        expiryDate: "2025-01-01",
        purchaseDate: "2023-12-20",
        status: "active",
        tyreDetails: "Yokohama Advan Sport V105 (245/40R18)",
        notes: "Premium performance tyres. Regular rotation recommended."
      },
      {
        id: "W006",
        carPlate: "SCC9012C",
        registrationDate: "2024-02-15",
        expiryDate: "2025-02-15",
        purchaseDate: "2024-02-10",
        status: "active",
        tyreDetails: "Pirelli P Zero (255/35R19)",
        notes: "Ultra high-performance tyres. Monitor pressure weekly."
      }
    ];

    // Filter based on car plate
    const filteredWarranties = mockWarranties.filter(w => w.carPlate === data.carPlate);

    setWarranties(filteredWarranties);
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
          <Button type="submit" className="w-full">
            Check Status
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
                        <strong>Purchase Date:</strong> {warranty.purchaseDate}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Valid until:</strong> {warranty.expiryDate}
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
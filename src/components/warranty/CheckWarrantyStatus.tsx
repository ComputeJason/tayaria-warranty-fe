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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TermsAndConditionsContent } from './TermsAndConditions';
import { warrantyApi, convertApiWarrantyToFrontend } from '@/services/warrantyApi';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { FileSearch, Loader2, ShieldCheck } from 'lucide-react';
import { COLORS, fieldInputClass, fieldLabelClass, primaryButtonClass, secondaryButtonClass } from './appleTheme';
import { cn } from '@/lib/utils';

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

function StatusPill({ status }: { status: Warranty['status'] }) {
  const isActive = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-gray-200 bg-gray-100 text-gray-500'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
      />
      {status}
    </span>
  );
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
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="carPlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>Car Plate</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. SBA1234A" {...field} className={fieldInputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className={primaryButtonClass}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking&hellip;
              </>
            ) : (
              <>
                <FileSearch className="h-4 w-4" />
                Check Status
              </>
            )}
          </Button>
        </form>
      </Form>

      {hasSearched && warranties.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0A0A0A]">Your Warranties</h2>
            {onNavigateToRegister && (
              <button
                type="button"
                onClick={onNavigateToRegister}
                className={secondaryButtonClass}
              >
                Register New Warranty
              </button>
            )}
          </div>

          <div className="space-y-3">
            {warranties.map((warranty) => (
              <div
                key={warranty.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: COLORS.redTint }}
                    >
                      <ShieldCheck className="h-4 w-4" style={{ color: COLORS.red }} />
                    </span>
                    <span className="font-semibold text-[#0A0A0A]">Tayaria Issued Warranty</span>
                  </div>
                  <StatusPill status={warranty.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Purchase Date</p>
                    <p className="mt-0.5 font-medium text-[#0A0A0A]">
                      {warranty.purchaseDate ? format(new Date(warranty.purchaseDate), 'dd MMM yyyy') : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Valid Until</p>
                    <p className="mt-0.5 font-medium text-[#0A0A0A]">
                      {warranty.expiryDate ? format(new Date(warranty.expiryDate), 'dd MMM yyyy') : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <p className="text-xs italic text-gray-400">
                    Refer to your receipt or contact your retailer for purchase details
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="flex-shrink-0 text-xs font-medium underline decoration-gray-300 underline-offset-4"
                    style={{ color: COLORS.redHover }}
                  >
                    Terms &amp; Conditions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <FileSearch className="h-6 w-6 text-gray-300" />
          </div>
          <p className="mt-4 text-base font-semibold text-[#0A0A0A]">No matching warranties found</p>
          <p className="mt-1 text-sm text-gray-500">This car plate has no warranties registered yet.</p>
          {onNavigateToRegister && (
            <button
              type="button"
              onClick={onNavigateToRegister}
              className={cn(primaryButtonClass, 'mx-auto mt-6 w-auto px-6')}
            >
              Register New Warranty
            </button>
          )}
        </div>
      ) : null}

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="flex max-h-[80vh] w-[92%] max-w-[820px] flex-col rounded-3xl border border-gray-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-gray-100 p-6 pb-5">
            <DialogTitle className="text-lg font-semibold text-[#0A0A0A]">Tayaria 360 Warranty Terms &amp; Conditions</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TermsAndConditionsContent />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

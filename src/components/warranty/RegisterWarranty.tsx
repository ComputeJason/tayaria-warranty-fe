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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Eye, Upload, FileText, Image, Loader2 } from "lucide-react";
import { warrantyApi } from '@/services/warrantyApi';
import { useToast } from "@/components/ui/use-toast";
import { isAfter, isBefore, subDays, startOfDay, parseISO } from 'date-fns';
import { BRANDS } from '@/constants/tyreBrands';
import { TermsAndConditionsContent } from './TermsAndConditions';
import { PDPAContent } from './PDPAContent';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactNumber: z.string().regex(/^[0-9]{8,}$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  carPlate: z.string().min(1, "Car plate is required"),
  brand: z.string().min(1, "Please select a tyre brand"),
  receipt: z.string().min(1, "Receipt upload is required"),
  agreeTerms: z.boolean().refine((v) => v === true, "You must agree to the Terms and Conditions"),
  agreePdpa: z.boolean().refine((v) => v === true, "You must agree to the PDPA Policy"),
});

type FormData = z.infer<typeof formSchema>;

interface RegisterWarrantyProps {
  onSuccess: (carPlate: string) => void;
}

// Helper to get today in Singapore time (UTC+8)
function getTodaySgt() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return startOfDay(new Date(utc + 8 * 60 * 60000));
}
// Helper to format date as YYYY-MM-DD
function formatDateYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function RegisterWarranty({ onSuccess }: RegisterWarrantyProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showPdpaPopup, setShowPdpaPopup] = useState(false);
  const { toast } = useToast();

  const today = getTodaySgt();
  const minDate = subDays(today, 14); // 8 days including today

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactNumber: "",
      email: "",
      purchaseDate: formatDateYYYYMMDD(today),
      carPlate: "",
      brand: "",
      agreeTerms: false,
      agreePdpa: false,
    },
  });

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return "Please upload a valid image (JPG, PNG, GIF) or PDF file";
    }

    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    return null;
  };

  const handleFileUpload = (file: File) => {
    const error = validateFile(file);
    if (error) {
      form.setError("receipt", { message: error });
      return;
    }

    setUploadedFile(file);
    
    // Generate a fake URL for the backend API since file upload isn't implemented yet
    const fakeUrl = `https://example.com/receipts/${file.name}`;
    form.setValue("receipt", fakeUrl);
    form.clearErrors("receipt");

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    form.setValue("receipt", undefined as any);
    // Reset the file input
    const fileInput = document.getElementById('receipt-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handlePreview = () => {
    if (!uploadedFile) return;

    const url = URL.createObjectURL(uploadedFile);
    window.open(url, '_blank');
  };

  const onSubmit = async (data: FormData) => {
    if (!uploadedFile) {
      form.setError("receipt", { message: "Receipt upload is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.name);
      formDataToSend.append('phone_number', data.contactNumber);
      formDataToSend.append('email', data.email || '');
      formDataToSend.append('purchase_date', new Date(data.purchaseDate).toISOString());
      formDataToSend.append('car_plate', data.carPlate.toUpperCase());
      formDataToSend.append('brand', data.brand);
      formDataToSend.append('receipt', uploadedFile);

      await warrantyApi.registerWarranty(formDataToSend);
      onSuccess(data.carPlate.toUpperCase());
    } catch (error) {
      console.error("Error registering warranty:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register warranty",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Full-page loading overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black font-medium">Name *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your name" 
                  {...field} 
                  className="bg-white text-black border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black font-medium">Contact Number *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your contact number" 
                  {...field} 
                  className="bg-white text-black border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black font-medium">Email (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your email (optional)" 
                  type="email" 
                  {...field} 
                  className="bg-white text-black border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black font-medium">Purchase Date *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter purchase date"
                    type="date"
                    min={formatDateYYYYMMDD(minDate)}
                    max={formatDateYYYYMMDD(today)}
                    className="bg-white text-black border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                    {...field}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const selected = startOfDay(parseISO(value));
                        if (isBefore(selected, minDate) || isAfter(selected, today)) {
                          form.setError("purchaseDate", {
                            message: "Cannot register warranty more than 14 days after purchase",
                          });
                        } else {
                          form.clearErrors("purchaseDate");
                        }
                      }
                      field.onBlur && field.onBlur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="carPlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black font-medium">Car Plate *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your car plate"
                  {...field}
                  className="bg-white text-black border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black font-medium">Tyre Brand *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white text-black border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors">
                    <SelectValue placeholder="Select tyre brand" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-gray-300">
                  {BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand} className="text-black hover:bg-gray-50 focus:bg-gray-50">
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

          {/* Disclaimer */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4 flex items-start space-x-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1 text-red-700">Important Notice</p>
              <p className="mb-3">
                Your warranty is only valid if the uploaded receipt is clear and includes all required information. 
                Warranties may be deemed invalid during claims if the receipt lacks essential details.
              </p>
              
              <div className="mt-4 pt-3 border-t border-yellow-400">
                <p className="font-bold text-red-700 mb-2">IMPORTANT WARRANTY TERMS:</p>
                <div className="space-y-1 text-xs text-yellow-900">
                  <p>1) Valid until 6 months from the date of purchase</p>
                  <p>2) Valid only if tyre has above 6mm of tread depth left</p>
                  <p>3) Valid only after a minimum purchase of 2 pcs in single receipt</p>
                  <p>4) Valid only for digital receipt</p>
                  <p>5) Valid only for tyre damages that are beyond repair</p>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="text-base text-black font-medium">Receipt Upload *</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSampleModal(true)}
                className="text-xs bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                View Sample Receipts
              </Button>
            </div>

            <FormField
              control={form.control}
              name="receipt"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                        isDragOver 
                          ? 'border-red-400 bg-red-50 scale-[1.02]' 
                          : uploadedFile 
                            ? 'border-yellow-400 bg-yellow-50' 
                            : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {uploadedFile ? (
                        // File uploaded state
                        <div className="space-y-4">
                          <div className="flex items-center justify-center space-x-3">
                            {uploadedFile.type.startsWith('image/') ? (
                              <Image className="h-8 w-8 text-yellow-600" />
                            ) : (
                              <FileText className="h-8 w-8 text-red-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>

                          {/* Image Preview */}
                          {previewUrl && (
                            <div className="flex justify-center">
                              <img
                                src={previewUrl}
                                alt="Receipt preview"
                                className="max-h-32 rounded border border-yellow-300"
                              />
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex justify-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handlePreview}
                              className="flex items-center space-x-1 bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Preview</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveFile}
                              className="flex items-center space-x-1 bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            >
                              <span>Remove</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Upload prompt state
                        <>
                          <Upload className="h-8 w-8 text-red-400 mx-auto mb-2" />
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                              {isDragOver ? 'Drop your receipt here' : 'Click to upload or drag and drop your receipt'}
                            </p>
                            <p className="text-xs text-gray-500 pb-4">
                              Supports: JPG, PNG, GIF, PDF (Max 10MB)
                            </p>
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileInputChange}
                              className="hidden"
                              id="receipt-upload"
                            />
                            <label htmlFor="receipt-upload" className="cursor-pointer" >
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                asChild
                                className="bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                              >
                                <span>Choose File</span>
                              </Button>
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Terms & Conditions / PDPA acknowledgement */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4 space-y-3 shadow-sm">
            <FormField
              control={form.control}
              name="agreeTerms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <label className="text-sm text-yellow-900">
                      I have read and agree to the{' '}
                      <span
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowTermsPopup(true);
                        }}
                        className="text-red-700 font-semibold underline cursor-pointer"
                      >
                        Tayaria 360 Warranty Terms &amp; Conditions
                      </span>
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agreePdpa"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <label className="text-sm text-yellow-900">
                      I have read and agree to the{' '}
                      <span
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPdpaPopup(true);
                        }}
                        className="text-red-700 font-semibold underline cursor-pointer"
                      >
                        PDPA Privacy Policy
                      </span>
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Registering...' : 'Register Warranty'}
        </Button>
      </form>
    </Form>

      {/* Sample Receipts Modal */}
      <Dialog open={showSampleModal} onOpenChange={setShowSampleModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-yellow-300 bg-white shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-t-lg p-4">
            <DialogTitle className="text-red-700 font-bold">Sample Receipt Requirements</DialogTitle>
            <button
              onClick={() => setShowSampleModal(false)}
              className="absolute top-1 right-1 p-2  border-gray-300 transition-colors z-10"
            >
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </DialogHeader>
          
          <div className="space-y-6 p-4">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">Required Information</h3>
              <p className="text-sm text-red-800">
                Your receipt must clearly show: <strong>Shop name</strong>, <strong>Tyre quantity</strong>, 
                <strong>Tyre width size</strong>, <strong>Profile & rim size</strong>, and <strong>Tyre model</strong>.
              </p>
            </div>

            <div className="space-y-8">
              {/* PDF Sample */}
              <div className="space-y-3">
                <h4 className="font-medium text-red-700">PDF Receipt Sample</h4>
                <div className="border border-yellow-300 rounded-lg p-4 bg-yellow-50 text-center">
                  <p className="text-sm text-yellow-800 mb-3">PDF Receipt Sample</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open('/app_assets/tayaria_sample_receipt.pdf', '_blank')}
                    className="bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    View PDF Sample
                  </Button>
                </div>
              </div>

              {/* Image Sample */}
              <div className="space-y-3">
                <h4 className="font-medium text-red-700">Image Receipt Sample</h4>
                <div className="border border-yellow-300 rounded-lg overflow-hidden">
                  <img
                    src="/app_assets/tayaria_sample_receipt.jpg"
                    alt="Sample receipt image"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions read-only popup */}
      <Dialog open={showTermsPopup} onOpenChange={setShowTermsPopup}>
        <DialogContent className="bg-white border-2 border-yellow-300 max-h-[80vh] w-[90%] md:w-[900px] max-w-[900px] flex flex-col p-0 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 pb-4 rounded-t-lg">
            <DialogTitle className="text-red-700 text-center text-2xl mb-4 font-bold">Tayaria 360 Warranty Terms &amp; Conditions</DialogTitle>
            <div className="border-t border-yellow-300 w-full" />
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <TermsAndConditionsContent />
          </div>
        </DialogContent>
      </Dialog>

      {/* PDPA Policy read-only popup */}
      <Dialog open={showPdpaPopup} onOpenChange={setShowPdpaPopup}>
        <DialogContent className="bg-white border-2 border-yellow-300 max-h-[80vh] w-[90%] md:w-[900px] max-w-[900px] flex flex-col p-0 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 pb-4 rounded-t-lg">
            <DialogTitle className="text-red-700 text-center text-2xl mb-4 font-bold">PDPA Privacy Policy</DialogTitle>
            <div className="border-t border-yellow-300 w-full" />
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <PDPAContent />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

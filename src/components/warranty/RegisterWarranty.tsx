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
import { AlertTriangle, Eye, Upload, FileText, Image } from "lucide-react";
import { warrantyApi, convertFormDataToApiRequest } from '@/services/warrantyApi';
import { isAfter, isBefore, subDays, startOfDay, parseISO } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactNumber: z.string().regex(/^[0-9]{8,}$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  carPlate: z.string().min(1, "Car plate is required"),
  receipt: z.string().min(1, "Receipt upload is required"),
});

type FormData = z.infer<typeof formSchema>;

// Extended type for internal use that includes the actual file
interface ExtendedFormData {
  name?: string;
  contactNumber?: string;
  email?: string;
  purchaseDate?: string;
  carPlate?: string;
  receipt?: string;
  receiptFile?: File;
}

interface RegisterWarrantyProps {
  onSuccess: (carPlate: string) => void;
  onShowTerms: (data: ExtendedFormData) => void;
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

export function RegisterWarranty({ onSuccess, onShowTerms }: RegisterWarrantyProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const today = getTodaySgt();
  const minDate = subDays(today, 7); // 8 days including today

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactNumber: "",
      email: "",
      purchaseDate: formatDateYYYYMMDD(today),
      carPlate: "",
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
    // For now, we'll still show terms first, but we could also submit directly
    // The actual API call will happen in the parent component after terms acceptance
    const extendedData: ExtendedFormData = {
      ...data,
      receiptFile: uploadedFile || undefined
    };
    onShowTerms(extendedData);
  };

  return (
    <div className="space-y-6">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} className="bg-white text-black"/>
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
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your contact number" {...field} className="bg-white text-black" />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} className="bg-white text-black" />
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
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter purchase date"
                    type="date"
                    min={formatDateYYYYMMDD(minDate)}
                    max={formatDateYYYYMMDD(today)}
                    className="bg-white text-black"
                    {...field}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const selected = startOfDay(parseISO(value));
                        if (isBefore(selected, minDate) || isAfter(selected, today)) {
                          form.setError("purchaseDate", {
                            message: "Cannot register warranty more than 7 days after purchase",
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
              <FormLabel>Car Plate</FormLabel>
              <FormControl>
                <Input placeholder="Enter your car plate" {...field} className="bg-white text-black"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Notice</p>
              <p className="mb-3">
                Your warranty is only valid if the uploaded receipt is clear and includes all required information. 
                Warranties may be deemed invalid during claims if the receipt lacks essential details.
              </p>
              
              <div className="mt-4 pt-3 border-t border-amber-300">
                <p className="font-bold text-amber-900 mb-2">IMPORTANT WARRANTY TERMS:</p>
                <div className="space-y-1 text-xs">
                  <p>1) Valid until 6 months from the date of purchase</p>
                  <p>2) Valid only if tyre has above 6mm of tread depth left</p>
                  <p>3) Valid only after a minimum purchase of 2 pcs in single receipt</p>
                  <p>4) Valid only for digital receipt</p>
                  <p>5) Invalid for tyre damages that are beyond repair</p>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="text-base">Receipt Upload *</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSampleModal(true)}
                className="text-xs"
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
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragOver 
                          ? 'border-blue-400 bg-blue-50' 
                          : uploadedFile 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
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
                              <Image className="h-8 w-8 text-green-600" />
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
                                className="max-h-32 rounded border"
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
                              className="flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Preview</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveFile}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                            >
                              <span>Remove</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Upload prompt state
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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
                              capture="environment"
                              onChange={handleFileInputChange}
                              className="hidden"
                              id="receipt-upload"
                            />
                            <label htmlFor="receipt-upload" className="cursor-pointer" >
                              <Button type="button" variant="outline" size="sm" asChild>
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

        <Button type="submit" className="w-full">
          Register Warranty
        </Button>
      </form>
    </Form>

      {/* Sample Receipts Modal */}
      <Dialog open={showSampleModal} onOpenChange={setShowSampleModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sample Receipt Requirements</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Required Information</h3>
              <p className="text-sm text-blue-800">
                Your receipt must clearly show: <strong>Shop name</strong>, <strong>Tyre quantity</strong>, 
                <strong>Tyre width size</strong>, <strong>Profile & rim size</strong>, and <strong>Tyre model</strong>.
              </p>
            </div>

            <div className="space-y-8">
              {/* PDF Sample */}
              <div className="space-y-3">
                <h4 className="font-medium text-white">PDF Receipt Sample</h4>
                <div className="border rounded-lg p-4 bg-gray-50 text-center">
                  <p className="text-sm text-gray-600 mb-3">PDF Receipt Sample</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open('/app_assets/tayaria_sample_receipt.pdf', '_blank')}
                  >
                    View PDF Sample
                  </Button>
                </div>
              </div>

              {/* Image Sample */}
              <div className="space-y-3">
                <h4 className="font-medium text-white">Image Receipt Sample</h4>
                <div className="border rounded-lg overflow-hidden">
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
    </div>
  );
} 
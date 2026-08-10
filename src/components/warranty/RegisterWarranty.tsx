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
import {
  AlertTriangle,
  Eye,
  Upload,
  FileText,
  Image,
  Loader2,
  X,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  Calendar,
  ReceiptText,
  ClipboardCheck,
} from "lucide-react";
import { warrantyApi } from '@/services/warrantyApi';
import { useToast } from "@/components/ui/use-toast";
import { isAfter, isBefore, subDays, startOfDay, parseISO, format } from 'date-fns';
import { BRANDS } from '@/constants/tyreBrands';
import { TermsAndConditionsContent } from './TermsAndConditions';
import { PDPAContent } from './PDPAContent';
import { WizardStepper } from './WizardStepper';
import { COLORS, fieldInputClass, fieldLabelClass, primaryButtonClass, secondaryButtonClass } from './appleTheme';
import { cn } from '@/lib/utils';

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

// Wizard phases — each phase reveals a subset of the single form's fields.
// Mirrors the same 4-phase breakdown used across the other warranty page designs.
const STEPS: {
  key: string;
  label: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  fields: (keyof FormData)[];
}[] = [
  {
    key: 'about',
    label: 'About you',
    title: "Let's start with you",
    subtitle: "We'll use this to keep you posted about your warranty.",
    icon: User,
    fields: ['name', 'contactNumber', 'email'],
  },
  {
    key: 'purchase',
    label: 'Purchase',
    title: 'Tell us about your purchase',
    subtitle: 'These details help us match your warranty to your receipt.',
    icon: Calendar,
    fields: ['purchaseDate', 'carPlate', 'brand'],
  },
  {
    key: 'receipt',
    label: 'Receipt',
    title: 'Upload your receipt',
    subtitle: 'A clear photo or PDF keeps your claim hassle-free later on.',
    icon: ReceiptText,
    fields: ['receipt'],
  },
  {
    key: 'review',
    label: 'Review',
    title: 'Review & confirm',
    subtitle: 'Make sure everything looks right, then send it our way.',
    icon: ClipboardCheck,
    fields: ['agreeTerms', 'agreePdpa'],
  },
];

export function RegisterWarranty({ onSuccess }: RegisterWarrantyProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showPdpaPopup, setShowPdpaPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
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

  const isLastStep = currentStep === STEPS.length - 1;
  const values = form.watch();

  const goNext = async () => {
    const valid = await form.trigger(STEPS[currentStep].fields);
    if (!valid) return;
    setDirection('forward');
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection('back');
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Prevent Enter from attempting a full-form submit before the final step.
    if (e.key === 'Enter' && !isLastStep) {
      e.preventDefault();
      goNext();
    }
  };

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

  const transitionClass =
    direction === 'forward'
      ? 'animate-in fade-in slide-in-from-right-4 duration-300'
      : 'animate-in fade-in slide-in-from-left-4 duration-300';

  return (
    <div className="relative">
      {/* Full-page loading overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: COLORS.red }} />
        </div>
      )}

      <WizardStepper steps={STEPS.map((s) => s.label)} currentStep={currentStep} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="space-y-8">
          <div key={currentStep} className={transitionClass}>
            <div className="mb-6 flex items-start gap-3">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: COLORS.redTint }}
              >
                {React.createElement(STEPS[currentStep].icon, {
                  className: 'h-4.5 w-4.5',
                  style: { color: COLORS.red },
                })}
              </span>
              <div>
                <h2 className="text-xl font-semibold leading-tight" style={{ color: COLORS.ink }}>
                  {STEPS[currentStep].title}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">{STEPS[currentStep].subtitle}</p>
              </div>
            </div>

            {/* Step 1: About you */}
            {currentStep === 0 && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fieldLabelClass}>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Tan Wei Ming" {...field} className={fieldInputClass} />
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
                      <FormLabel className={fieldLabelClass}>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 91234567" {...field} className={fieldInputClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className={fieldLabelClass}>Email (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" type="email" {...field} className={fieldInputClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Purchase details */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fieldLabelClass}>Purchase Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter purchase date"
                          type="date"
                          min={formatDateYYYYMMDD(minDate)}
                          max={formatDateYYYYMMDD(today)}
                          className={fieldInputClass}
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
                      <FormLabel className={fieldLabelClass}>Car Plate</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SBA1234A" {...field} className={fieldInputClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className={fieldLabelClass}>Tyre Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={fieldInputClass}>
                            <SelectValue placeholder="Select tyre brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-gray-200">
                          {BRANDS.map((brand) => (
                            <SelectItem key={brand} value={brand} className="text-[#0A0A0A] hover:bg-gray-50 focus:bg-gray-50">
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Receipt upload */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Disclaimer */}
                <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-[#FAFAFA] p-5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: COLORS.yellow }} />
                  <div className="text-sm text-gray-600">
                    <p className="mb-1 font-semibold text-[#0A0A0A]">Important notice</p>
                    <p className="mb-3 leading-relaxed">
                      Your warranty is only valid if the uploaded receipt is clear and includes all required information.
                      Warranties may be deemed invalid during claims if the receipt lacks essential details.
                    </p>

                    <div className="mt-4 space-y-1 border-t border-gray-200 pt-3 text-[13px] leading-relaxed text-gray-500">
                      <p className="mb-1 font-semibold text-gray-700">Warranty terms</p>
                      <p>1) Valid until 6 months from the date of purchase</p>
                      <p>2) Valid only if tyre has above 6mm of tread depth left</p>
                      <p>3) Valid only after a minimum purchase of 2 pcs in single receipt</p>
                      <p>4) Valid only for digital receipt</p>
                      <p>5) Valid only for tyre damages that are beyond repair</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel className={cn(fieldLabelClass, 'text-[15px] text-[#0A0A0A]')}>Receipt Upload</FormLabel>
                    <button
                      type="button"
                      onClick={() => setShowSampleModal(true)}
                      className="text-[13px] font-medium underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-500"
                      style={{ color: COLORS.redHover }}
                    >
                      View sample receipts
                    </button>
                  </div>

                  <FormField
                    control={form.control}
                    name="receipt"
                    render={({ field: { onChange, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <div
                            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                              isDragOver
                                ? 'scale-[1.01] bg-[#FBEAE8]'
                                : uploadedFile
                                  ? 'border-gray-200 bg-[#FAFAFA]'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            style={isDragOver ? { borderColor: COLORS.red } : undefined}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            {uploadedFile ? (
                              // File uploaded state
                              <div className="space-y-4">
                                <div className="flex items-center justify-center gap-3">
                                  {uploadedFile.type.startsWith('image/') ? (
                                    <Image className="h-7 w-7" style={{ color: COLORS.yellow }} />
                                  ) : (
                                    <FileText className="h-7 w-7" style={{ color: COLORS.red }} />
                                  )}
                                  <div className="text-left">
                                    <p className="text-sm font-medium text-[#0A0A0A]">{uploadedFile.name}</p>
                                    <p className="text-xs text-gray-400">
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
                                      className="max-h-32 rounded-xl border border-gray-200"
                                    />
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-2">
                                  <button type="button" onClick={handlePreview} className={secondaryButtonClass}>
                                    <Eye className="h-3.5 w-3.5" />
                                    Preview
                                  </button>
                                  <button type="button" onClick={handleRemoveFile} className={secondaryButtonClass}>
                                    <X className="h-3.5 w-3.5" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Upload prompt state
                              <>
                                <Upload className="mx-auto mb-3 h-7 w-7 text-gray-300" />
                                <div className="space-y-3">
                                  <p className="text-sm text-gray-600">
                                    {isDragOver ? 'Drop your receipt here' : 'Click to upload or drag and drop your receipt'}
                                  </p>
                                  <p className="pb-1 text-xs text-gray-400">
                                    JPG, PNG, GIF or PDF &middot; Max 10MB
                                  </p>
                                  <Input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                    id="receipt-upload"
                                  />
                                  <label htmlFor="receipt-upload" className="inline-block cursor-pointer">
                                    <span className={secondaryButtonClass}>Choose File</span>
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
              </div>
            )}

            {/* Step 4: Review & confirm */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-3 rounded-2xl border border-gray-200 bg-[#FAFAFA] p-5">
                  <ReviewRow label="Name" value={values.name} />
                  <ReviewRow label="Contact" value={values.contactNumber} />
                  <ReviewRow label="Email" value={values.email || '—'} />
                  <ReviewRow
                    label="Purchase Date"
                    value={values.purchaseDate ? format(parseISO(values.purchaseDate), 'dd MMM yyyy') : '—'}
                  />
                  <ReviewRow label="Car Plate" value={values.carPlate?.toUpperCase()} />
                  <ReviewRow label="Tyre Brand" value={values.brand} />
                  <ReviewRow label="Receipt" value={uploadedFile?.name || '—'} />
                </div>

                <div className="space-y-3 rounded-2xl border border-gray-200 bg-[#FAFAFA] p-5">
                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-2.5">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 border-gray-300 data-[state=checked]:border-[#A6291F] data-[state=checked]:bg-[#A6291F] data-[state=checked]:text-white"
                            />
                          </FormControl>
                          <label className="text-sm text-gray-600">
                            I have read and agree to the{' '}
                            <span
                              role="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowTermsPopup(true);
                              }}
                              className="cursor-pointer font-medium underline decoration-gray-300 underline-offset-4"
                              style={{ color: COLORS.redHover }}
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
                        <div className="flex items-start gap-2.5">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 border-gray-300 data-[state=checked]:border-[#A6291F] data-[state=checked]:bg-[#A6291F] data-[state=checked]:text-white"
                            />
                          </FormControl>
                          <label className="text-sm text-gray-600">
                            I have read and agree to the{' '}
                            <span
                              role="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowPdpaPopup(true);
                              }}
                              className="cursor-pointer font-medium underline decoration-gray-300 underline-offset-4"
                              style={{ color: COLORS.redHover }}
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
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {currentStep > 0 ? (
              <button type="button" onClick={goBack} className={secondaryButtonClass}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : (
              <span />
            )}

            {isLastStep ? (
              <Button type="submit" disabled={isSubmitting} className={cn(primaryButtonClass, 'w-auto px-6')}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering&hellip;
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Register Warranty
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" onClick={goNext} className={cn(primaryButtonClass, 'w-auto px-6')}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* Sample Receipts Modal */}
      <Dialog open={showSampleModal} onOpenChange={setShowSampleModal}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-gray-100 p-6 pb-5">
            <DialogTitle className="text-lg font-semibold text-[#0A0A0A]">Sample Receipt Requirements</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-6">
            <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-4">
              <h3 className="mb-1.5 text-sm font-semibold text-[#0A0A0A]">Required information</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Your receipt must clearly show: <strong className="text-[#0A0A0A]">Shop name</strong>, <strong className="text-[#0A0A0A]">Tyre quantity</strong>,{' '}
                <strong className="text-[#0A0A0A]">Tyre width size</strong>, <strong className="text-[#0A0A0A]">Profile &amp; rim size</strong>, and <strong className="text-[#0A0A0A]">Tyre model</strong>.
              </p>
            </div>

            <div className="space-y-6">
              {/* PDF Sample */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-[#0A0A0A]">PDF receipt sample</h4>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
                  <button
                    type="button"
                    onClick={() => window.open('/app_assets/tayaria_sample_receipt.pdf', '_blank')}
                    className={`${secondaryButtonClass} mx-auto`}
                  >
                    View PDF sample
                  </button>
                </div>
              </div>

              {/* Image Sample */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-[#0A0A0A]">Image receipt sample</h4>
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <img
                    src="/app_assets/tayaria_sample_receipt.jpg"
                    alt="Sample receipt"
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions read-only popup */}
      <Dialog open={showTermsPopup} onOpenChange={setShowTermsPopup}>
        <DialogContent className="flex max-h-[80vh] w-[92%] max-w-[820px] flex-col rounded-3xl border border-gray-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-gray-100 p-6 pb-5">
            <DialogTitle className="text-lg font-semibold text-[#0A0A0A]">Tayaria 360 Warranty Terms &amp; Conditions</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TermsAndConditionsContent />
          </div>
        </DialogContent>
      </Dialog>

      {/* PDPA Policy read-only popup */}
      <Dialog open={showPdpaPopup} onOpenChange={setShowPdpaPopup}>
        <DialogContent className="flex max-h-[80vh] w-[92%] max-w-[820px] flex-col rounded-3xl border border-gray-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-gray-100 p-6 pb-5">
            <DialogTitle className="text-lg font-semibold text-[#0A0A0A]">PDPA Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <PDPAContent />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="font-medium text-gray-500">{label}</span>
      <span className="max-w-[60%] truncate text-right font-semibold text-[#0A0A0A]">
        {value && value.length > 0 ? value : '—'}
      </span>
    </div>
  );
}

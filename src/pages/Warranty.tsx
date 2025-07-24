import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { CheckWarrantyStatus } from '@/components/warranty/CheckWarrantyStatus';
import { RegisterWarranty } from '@/components/warranty/RegisterWarranty';
import TermsAndConditions from '@/components/warranty/TermsAndConditions';
import { warrantyApi, convertFormDataToApiRequest } from '@/services/warrantyApi';
import { testEnvironmentConfig } from '@/utils/envTest';

// Type for the warranty form data
interface WarrantyFormData {
  name?: string;
  contactNumber?: string;
  email?: string;
  purchaseDate?: string;
  carPlate?: string;
  receipt?: string;
  receiptFile?: File;
}

export default function Warranty() {
  const [activeTab, setActiveTab] = useState("register");
  const [carPlate, setCarPlate] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState<WarrantyFormData | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Test environment configuration on component mount
  React.useEffect(() => {
    testEnvironmentConfig();
  }, []);

  // Check if we have a car plate from registration
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plate = params.get('carPlate');
    if (plate) {
      setCarPlate(plate);
      setActiveTab("check");
    }
  }, [location]);

  // Trigger animations on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timer);
  }, []);

  const handleTermsAccept = async () => {
    setShowTerms(false);
    if (formData) {
      setIsRegistering(true);
      try {
        // Build FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name || '');
        formDataToSend.append('phone_number', formData.contactNumber || '');
        formDataToSend.append('email', formData.email || '');
        formDataToSend.append('purchase_date', new Date(formData.purchaseDate || '').toISOString());
        formDataToSend.append('car_plate', (formData.carPlate || '').toUpperCase());
        if (formData.receiptFile) {
          formDataToSend.append('receipt', formData.receiptFile);
        }
        // Call the backend API
        const warranty = await warrantyApi.registerWarranty(formDataToSend);
        console.log("Warranty registered:", warranty);
        setCarPlate(formData.carPlate || "");
        setActiveTab("check");
        toast({
          title: "Success",
          description: "Warranty registered successfully!",
        });
      } catch (error) {
        console.error("Error registering warranty:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to register warranty",
          variant: "destructive",
        });
      } finally {
        setIsRegistering(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Title */}
      <div className={`bg-gradient-to-r from-[#fdf100] from-30% md:from-30% from-45% via-yellow-300 to-yellow-500 shadow-lg transition-all duration-1000 ease-out relative ${
        isPageLoaded 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0'
      }`}>
        <div className="container mx-auto px-4 py-6">
          {/* Mobile Layout: Stacked */}
          <div className="md:hidden flex flex-col items-start space-y-2">
            <img 
              src="/app_assets/tayaria-logo-new.jpg" 
              alt="Tayaria Logo" 
              className="h-20 w-auto rounded-sm flex-shrink-0 -ml-4 -mt-8"
              onError={(e) => {
                // Fallback chain: new JPG -> old JPG -> PNG
                const target = e.target as HTMLImageElement;
                if (target.src.includes('/app_assets/tayaria-logo-new.jpg')) {
                  target.src = '/app_assets/tayaria-logo.jpg';
                } else if (target.src.includes('/app_assets/tayaria-logo.jpg')) {
                  target.src = '/app_assets/tayaria_logo.png';
                }
              }}
            />
            <div className="w-full text-center">
              <h1 className="text-xl font-bold text-red-600 leading-tight -mt-3">Tyre Warranty Management</h1>
              <p className="text-red-700 text-xs mt-1 font-bold">Secure your tyre investment with Tayaria</p>
            </div>
          </div>

          {/* Desktop Layout: Side by side */}
          <div className="hidden md:flex items-center">
            <img 
              src="/app_assets/tayaria-logo-new.jpg" 
              alt="Tayaria Logo" 
              className="h-24 w-auto rounded-sm flex-shrink-0"
              onError={(e) => {
                // Fallback chain: new JPG -> old JPG -> PNG
                const target = e.target as HTMLImageElement;
                if (target.src.includes('/app_assets/tayaria-logo-new.jpg')) {
                  target.src = '/app_assets/tayaria-logo.jpg';
                } else if (target.src.includes('/app_assets/tayaria-logo.jpg')) {
                  target.src = '/app_assets/tayaria_logo.png';
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-red-600 leading-tight">Tyre Warranty Management</h1>
                <p className="text-red-700 text-sm mt-1 font-bold">Secure your tyre investment with Tayaria</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList 
            className={`grid w-full grid-cols-2 bg-white border-2 border-yellow-300 p-1 rounded-lg shadow-md transition-all duration-1000 ease-out delay-500 ${
              isPageLoaded 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0'
            }`}
          >
            <TabsTrigger 
              value="register" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=inactive]:text-red-700 data-[state=inactive]:hover:bg-red-50 transition-all duration-300 rounded-md"
            >
              Register Warranty
            </TabsTrigger>
            <TabsTrigger 
              value="check" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=inactive]:text-red-700 data-[state=inactive]:hover:bg-red-50 transition-all duration-300 rounded-md"
            >
              Check Warranty Status
            </TabsTrigger>
          </TabsList>
          
          <TabsContent 
            value="register" 
            className={`mt-6 transition-all duration-1000 ease-out delay-800 ${
              isPageLoaded 
                ? 'translate-x-0 opacity-100' 
                : '-translate-x-full opacity-0'
            }`}
          >
            <Card className="p-6 bg-white border-2 border-yellow-200 shadow-lg rounded-xl">
              <RegisterWarranty 
                onSuccess={(plate) => {
                  setCarPlate(plate);
                  setActiveTab("check");
                  toast({
                    title: "Success",
                    description: "Warranty registered successfully!",
                  });
                }}
                onShowTerms={(data) => {
                  setFormData(data);
                  setShowTerms(true);
                }}
                isLoading={isRegistering}
              />
            </Card>
          </TabsContent>
          
          <TabsContent 
            value="check" 
            className={`mt-6 transition-all duration-1000 ease-out delay-800 ${
              isPageLoaded 
                ? 'translate-x-0 opacity-100' 
                : '-translate-x-full opacity-0'
            }`}
          >
            <Card className="p-6 bg-white border-2 border-yellow-200 shadow-lg rounded-xl">
              <CheckWarrantyStatus 
                initialCarPlate={carPlate}
                onNavigateToRegister={() => setActiveTab("register")}
              />
            </Card>
          </TabsContent>
        </Tabs>

        <TermsAndConditions
          open={showTerms}
          onOpenChange={setShowTerms}
          onAccept={handleTermsAccept}
          formData={formData}
          isLoading={isRegistering}
        />
      </div>
    </div>
  );
} 
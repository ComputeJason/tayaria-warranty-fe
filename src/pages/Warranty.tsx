import React, { useState } from 'react';
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

  const handleTermsAccept = async () => {
    setShowTerms(false);
    if (formData) {
      setIsRegistering(true);
      try {
        // Convert form data to API request format
        const apiRequest = convertFormDataToApiRequest(formData);
        
        // Call the backend API
        const warranty = await warrantyApi.registerWarranty(apiRequest);
        
        console.log("Warranty registered:", warranty);
        
        // Update UI state
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Tyre Warranty Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="register">Register Warranty</TabsTrigger>
          <TabsTrigger value="check">Check Warranty Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="register">
          <Card className="p-6">
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
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="check">
          <Card className="p-6">
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
  );
} 
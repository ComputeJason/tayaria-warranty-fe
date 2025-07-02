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

export default function Warranty() {
  const [activeTab, setActiveTab] = useState("register");
  const [carPlate, setCarPlate] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a car plate from registration
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plate = params.get('carPlate');
    if (plate) {
      setCarPlate(plate);
      setActiveTab("check");
    }
  }, [location]);

  const handleTermsAccept = () => {
    setShowTerms(false);
    if (formData) {
      // TODO: Replace with actual API call
      console.log("Form submitted:", formData);
      // Mock successful registration
      setCarPlate(formData.carPlate);
      setActiveTab("check");
      toast({
        title: "Success",
        description: "Warranty registered successfully!",
      });
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
      />
    </div>
  );
} 
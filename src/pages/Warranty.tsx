import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { CheckWarrantyStatus } from '@/components/warranty/CheckWarrantyStatus';
import { RegisterWarranty } from '@/components/warranty/RegisterWarranty';
import { testEnvironmentConfig } from '@/utils/envTest';
import { Clock3 } from 'lucide-react';
import { COLORS, FONT_STACK, pillClass } from '@/components/warranty/appleTheme';

export default function Warranty() {
  const [activeTab, setActiveTab] = useState("register");
  const [carPlate, setCarPlate] = useState("");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const { toast } = useToast();
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

  // Trigger a gentle entrance animation on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 60);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: FONT_STACK }}
    >
      {/* Minimal brand bar */}
      <div className="border-b border-black/[0.06]">
        <div className="container mx-auto flex items-center px-4 py-4">
          <img
            src="/app_assets/tayaria-logo-new.jpg"
            alt="Tayaria"
            className="h-8 w-auto rounded-[4px]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.includes('/app_assets/tayaria-logo-new.jpg')) {
                target.src = '/app_assets/tayaria-logo.jpg';
              } else if (target.src.includes('/app_assets/tayaria-logo.jpg')) {
                target.src = '/app_assets/tayaria_logo.png';
              }
            }}
          />
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Abstract mesh-gradient wash — decorative only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(560px 420px at 82% -8%, ${COLORS.redTint} 0%, rgba(251,234,232,0) 65%),
              radial-gradient(480px 360px at 8% 0%, ${COLORS.yellowTint} 0%, rgba(255,246,225,0) 60%)
            `,
          }}
        />

        <div className="container relative mx-auto px-4 pt-8 pb-20 md:pt-10 md:pb-28">
          <div
            className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
              isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
          >
            <span className={`${pillClass} mx-auto`} style={{ color: COLORS.redHover }}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: COLORS.yellow }}
              />
              Tayaria 360&deg; Warranty
            </span>

            <h1
              className="mt-5 text-[40px] font-extrabold leading-[1.08] tracking-tight sm:text-[52px] md:text-[60px]"
              style={{ color: COLORS.ink }}
            >
              Protect every tyre
              <br className="hidden sm:block" /> you drive on.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-[18px] leading-relaxed text-gray-500 md:text-[19px]">
              Register your purchase in a minute and check your warranty
              status anytime — no paperwork, no hassle.
            </p>
          </div>
        </div>
      </div>

      {/* Floating card */}
      <div className="container mx-auto px-4 pb-20">
        <div
          className={`mx-auto -mt-16 max-w-3xl rounded-3xl border border-black/[0.06] bg-white/95 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_64px_-24px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-700 ease-out md:-mt-20 md:p-10 ${
            isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-5 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400">
            <Clock3 className="h-3 w-3" />
            Takes about 1 minute
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
              <TabsTrigger
                value="register"
                className="rounded-lg py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0A0A0A] data-[state=active]:shadow-sm"
              >
                Register Warranty
              </TabsTrigger>
              <TabsTrigger
                value="check"
                className="rounded-lg py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-[#0A0A0A] data-[state=active]:shadow-sm"
              >
                Check Warranty Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="mt-8 focus-visible:outline-none">
              <RegisterWarranty
                onSuccess={(plate) => {
                  setCarPlate(plate);
                  setActiveTab("check");
                  toast({
                    title: "Success",
                    description: "Warranty registered successfully!",
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="check" className="mt-8 focus-visible:outline-none">
              <CheckWarrantyStatus
                initialCarPlate={carPlate}
                onNavigateToRegister={() => setActiveTab("register")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

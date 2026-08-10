import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { CheckWarrantyStatus } from '@/components/warranty/CheckWarrantyStatus';
import { RegisterWarranty } from '@/components/warranty/RegisterWarranty';
import { testEnvironmentConfig } from '@/utils/envTest';
import { Clock3 } from 'lucide-react';
import { COLORS, FONT_STACK } from '@/components/warranty/appleTheme';

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
      {/* Hero — bold yellow field (matching tayaria.com) with logo + kicker on one row,
          headline below, and a signature wave transition down into the white body. */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#fdf100] from-30% via-yellow-300 to-yellow-500 md:from-45%">
        {/* Logo + kicker row */}
        <div className="container relative mx-auto px-4 pt-5 md:pt-6">
          {/* Mobile: stacked */}
          <div className="flex flex-col items-center gap-2 sm:hidden">
            <img
              src="/app_assets/tayaria-logo-new.jpg"
              alt="Tayaria"
              className="h-11 w-auto rounded-[4px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('/app_assets/tayaria-logo-new.jpg')) {
                  target.src = '/app_assets/tayaria-logo.jpg';
                } else if (target.src.includes('/app_assets/tayaria-logo.jpg')) {
                  target.src = '/app_assets/tayaria_logo.png';
                }
              }}
            />
            <span
              className="text-base font-bold uppercase tracking-wide"
              style={{ color: COLORS.redHover }}
            >
              Tayaria 360&deg; Warranty
            </span>
          </div>

          {/* Desktop: same line as the logo, kicker centered independent of logo width */}
          <div className="relative hidden items-center sm:flex">
            <img
              src="/app_assets/tayaria-logo-new.jpg"
              alt="Tayaria"
              className="h-14 w-auto rounded-[4px] md:h-16"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('/app_assets/tayaria-logo-new.jpg')) {
                  target.src = '/app_assets/tayaria-logo.jpg';
                } else if (target.src.includes('/app_assets/tayaria-logo.jpg')) {
                  target.src = '/app_assets/tayaria_logo.png';
                }
              }}
            />
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold uppercase tracking-wide md:text-xl"
              style={{ color: COLORS.redHover }}
            >
              Tayaria 360&deg; Warranty
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="container relative mx-auto px-4 pb-24 pt-6 md:pb-32 md:pt-8">
          <div
            className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
              isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
          >
            <h1
              className="text-[40px] font-extrabold leading-[1.08] tracking-tight sm:text-[52px] md:text-[60px]"
              style={{ color: COLORS.ink }}
            >
              Protect every tyre
              <br className="hidden sm:block" /> you drive on.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-[18px] leading-relaxed md:text-[19px]" style={{ color: '#5B4A00' }}>
              Register your purchase in a minute and check your warranty
              status anytime.
            </p>
          </div>
        </div>

        {/* Signature wave transition into the white body */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 h-14 w-full text-white md:h-20"
        >
          <path
            d="M0,40 C240,90 480,10 720,45 C960,80 1200,20 1440,50 L1440,100 L0,100 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Floating card */}
      <div className="container mx-auto px-4 pb-20">
        <div
          className={`mx-auto -mt-10 max-w-3xl rounded-3xl border border-black/[0.06] bg-white/95 px-5 pb-5 pt-4 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_64px_-24px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-700 ease-out md:-mt-14 md:px-10 md:pb-10 md:pt-6 ${
            isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-4 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400">
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

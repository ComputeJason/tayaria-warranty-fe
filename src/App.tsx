import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TyreRegistrationProvider } from "./contexts/TyreRegistrationContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AdminLogin from './pages/AdminLogin';
import MasterLogin from './pages/MasterLogin';
import Warranty from "./pages/Warranty";

// Admin pages
import AllClaims from "./pages/admin/AllClaims";

// Master pages
import ManageClaims from "./pages/master/ManageClaims";
import ManageWarranties from "./pages/master/ManageWarranties";
import Dashboard from "./pages/master/Dashboard";
import CreateRetailAccount from "./pages/master/CreateRetailAccount";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TyreRegistrationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/warranty" element={<Warranty />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/master/login" element={<MasterLogin />} />

                {/* Admin routes */}
                <Route
                  path="/admin/claims"
                  element={
                    <ProtectedRoute>
                      <AllClaims />
                    </ProtectedRoute>
                  }
                />

                {/* Master routes */}
                <Route path="/master/claims" element={<ManageClaims />} />
                <Route path="/master/warranties" element={<ManageWarranties />} />
                <Route path="/master/dashboard" element={<Dashboard />} />
                <Route path="/master/create-retail" element={<CreateRetailAccount />} />

                {/* Redirect root to warranty page */}
                <Route path="/" element={<Navigate to="/warranty" replace />} />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </TyreRegistrationProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;

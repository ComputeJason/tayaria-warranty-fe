import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TyreRegistrationProvider } from "./contexts/TyreRegistrationContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthenticatedRoute } from "./components/auth/AuthenticatedRoute";
import { MasterProtectedRoute } from "./components/auth/MasterProtectedRoute";
import { AdminRoot } from "./pages/admin/AdminRoot";
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
import MasterRoot from "./pages/master/MasterRoot";

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

                {/* Admin routes */}
                <Route path="/admin" element={<AdminRoot />} />
                <Route
                  path="/admin/login"
                  element={
                    <AuthenticatedRoute>
                      <AdminLogin />
                    </AuthenticatedRoute>
                  }
                />
                <Route
                  path="/admin/claims"
                  element={
                    <ProtectedRoute>
                      <AllClaims />
                    </ProtectedRoute>
                  }
                />

                {/* Master routes */}
                <Route path="/master" element={<MasterRoot />} />
                <Route
                  path="/master/login"
                  element={
                    <AuthenticatedRoute>
                      <MasterLogin />
                    </AuthenticatedRoute>
                  }
                />
                <Route
                  path="/master/claims"
                  element={
                    <MasterProtectedRoute>
                      <ManageClaims />
                    </MasterProtectedRoute>
                  }
                />
                <Route
                  path="/master/warranties"
                  element={
                    <MasterProtectedRoute>
                      <ManageWarranties />
                    </MasterProtectedRoute>
                  }
                />
                <Route
                  path="/master/dashboard"
                  element={
                    <MasterProtectedRoute>
                      <Dashboard />
                    </MasterProtectedRoute>
                  }
                />
                <Route
                  path="/master/create-retail"
                  element={
                    <MasterProtectedRoute>
                      <CreateRetailAccount />
                    </MasterProtectedRoute>
                  }
                />

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

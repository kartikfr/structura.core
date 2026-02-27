import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { AdminGuard } from "@/components/AdminGuard";
import Landing from "./pages/landing";
import Lens from "./pages/Lens";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Documentation from "./pages/Documentation";
import CryptoPayment from "./pages/CryptoPayment";
import AdminDashboard from "./pages/AdminDashboard";
import BrandAssets from "./pages/BrandAssets";
import Whitepaper from "./pages/Whitepaper";
import UserManual from "./pages/UserManual";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/lens" element={
              <AuthGuard>
                <Lens />
              </AuthGuard>
            } />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/crypto-payment" element={<CryptoPayment />} />
            <Route path="/admin/payments" element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            } />
            <Route path="/brand-assets" element={<BrandAssets />} />
            <Route path="/whitepaper" element={<Whitepaper />} />
            <Route path="/user-manual" element={<UserManual />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

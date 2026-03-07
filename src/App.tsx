import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import RingSize from "./pages/RingSize";
import DeliveryTerms from "./pages/DeliveryTerms";
import ShariahRulings from "./pages/ShariahRulings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import ReturnPolicy from "./pages/ReturnPolicy";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import BusinessVerification from "./pages/BusinessVerification";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex justify-center min-h-screen w-full">
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/ring-size" element={<RingSize />} />
              <Route path="/delivery" element={<DeliveryTerms />} />
              <Route path="/shariah" element={<ShariahRulings />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/returns" element={<ReturnPolicy />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/business-info" element={<BusinessVerification />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

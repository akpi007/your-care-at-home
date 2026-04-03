import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSelect from "./pages/RoleSelect";
import PhoneAuth from "./pages/PhoneAuth";
import VerifyOTP from "./pages/VerifyOTP";
import CompleteProfile from "./pages/CompleteProfile";
import Index from "./pages/Index";
import Professionals from "./pages/Professionals";
import BookService from "./pages/BookService";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProviderSignup from "./pages/ProviderSignup";
import ResetPassword from "./pages/ResetPassword";
import PatientProfiles from "./pages/PatientProfiles";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminPanel from "./pages/AdminPanel";
import AIAssistant from "./pages/AIAssistant";
import ProviderEarnings from "./pages/ProviderEarnings";
import InstallApp from "./pages/InstallApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Onboarding flow */}
        <Route path="/" element={<RoleSelect />} />
        <Route path="/onboarding/phone" element={<PhoneAuth />} />
        <Route path="/onboarding/verify" element={<VerifyOTP />} />
        <Route path="/onboarding/profile" element={<CompleteProfile />} />

        {/* Main app */}
        <Route path="/home" element={<Index />} />
        <Route path="/professionals" element={<Professionals />} />
        <Route path="/book/:id" element={
          <ProtectedRoute><BookService /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/services" element={<Services />} />
        <Route path="/patient-profiles" element={
          <ProtectedRoute><PatientProfiles /></ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<PhoneAuth />} />
        <Route path="/provider-signup" element={<ProviderSignup />} />
        <Route path="/provider-dashboard" element={
          <ProtectedRoute><ProviderDashboard /></ProtectedRoute>
        } />
        <Route path="/provider-earnings" element={
          <ProtectedRoute><ProviderEarnings /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><AdminPanel /></ProtectedRoute>
        } />
        <Route path="/ai-assistant" element={
          <ProtectedRoute><AIAssistant /></ProtectedRoute>
        } />
        <Route path="/install" element={<InstallApp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

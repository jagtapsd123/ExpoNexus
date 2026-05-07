import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ExhibitionsPage from "./pages/ExhibitionsPage";
import BookingsPage from "./pages/BookingsPage";
import StallBookingPage from "./pages/StallBookingPage";
import InvoicesPage from "./pages/InvoicesPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import UsersPage from "./pages/UsersPage";
import RegisterPage from "./pages/RegisterPage";
import PreviousExhibitionsPage from "./pages/PreviousExhibitionsPage";
import ProfilePage from "./pages/ProfilePage";
import BookStallPage from "./pages/BookStallPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import StallManagementPage from "./pages/StallManagementPage";
import StallLayoutManagementPage from "./pages/StallLayoutManagementPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import ExpensesPage from "./pages/ExpensesPage";
import BrowseExhibitionsPage from "./pages/BrowseExhibitionsPage";
import ExhibitionDetailPage from "./pages/ExhibitionDetailPage";
import LandingGalleryPage from "./pages/LandingGalleryPage";
import LandingSettingsPage from "./pages/LandingSettingsPage";
import LandingPage from "./pages/LandingPage";
import BeneficiariesPage from "./pages/BeneficiariesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/exhibitions" element={<ExhibitionsPage />} />
        <Route path="/previous-exhibitions" element={<PreviousExhibitionsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/stall-booking" element={<StallBookingPage />} />
        <Route path="/book-stall" element={<BookStallPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/invoice/:bookingId" element={<InvoiceDetailPage />} />
        <Route path="/stall-management" element={<StallManagementPage />} />
        <Route path="/stall-layout" element={<StallLayoutManagementPage />} />
        <Route path="/my-products" element={<ProductsPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/browse-exhibitions" element={<BrowseExhibitionsPage />} />
        <Route path="/exhibitions/:id" element={<ExhibitionDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/landing-gallery" element={<LandingGalleryPage />} />
        <Route path="/landing-settings" element={<LandingSettingsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/beneficiaries" element={<BeneficiariesPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

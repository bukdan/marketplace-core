import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";
import Credits from "./pages/Credits";
import CreateListing from "./pages/CreateListing";
import ListingDetail from "./pages/ListingDetail";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

// Dashboard pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardWallet from "./pages/dashboard/DashboardWallet";
import DashboardListings from "./pages/dashboard/DashboardListings";
import DashboardOrders from "./pages/dashboard/DashboardOrders";
import DashboardMessages from "./pages/dashboard/DashboardMessages";
import DashboardProfile from "./pages/dashboard/DashboardProfile";
import DashboardSettings from "./pages/dashboard/DashboardSettings";

// Admin pages
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminReports from "./pages/admin/AdminReports";
import AdminKyc from "./pages/admin/AdminKyc";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/listing/create" element={<CreateListing />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/wallet" element={<DashboardWallet />} />
              <Route path="/dashboard/listings" element={<DashboardListings />} />
              <Route path="/dashboard/orders" element={<DashboardOrders />} />
              <Route path="/dashboard/messages" element={<DashboardMessages />} />
              <Route path="/dashboard/profile" element={<DashboardProfile />} />
              <Route path="/dashboard/settings" element={<DashboardSettings />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/listings" element={<AdminListings />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/kyc" element={<AdminKyc />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

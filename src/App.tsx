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
import Notifications from "./pages/Notifications";
import Faq from "./pages/Faq";

// Dashboard pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardWallet from "./pages/dashboard/DashboardWallet";
import DashboardListings from "./pages/dashboard/DashboardListings";
import DashboardOrders from "./pages/dashboard/DashboardOrders";
import DashboardMessages from "./pages/dashboard/DashboardMessages";
import DashboardProfile from "./pages/dashboard/DashboardProfile";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import DashboardWishlist from "./pages/dashboard/DashboardWishlist";
import DashboardWithdraw from "./pages/dashboard/DashboardWithdraw";
import DashboardKyc from "./pages/dashboard/DashboardKyc";
import DashboardSupport from "./pages/dashboard/DashboardSupport";
import DashboardCoupons from "./pages/dashboard/DashboardCoupons";

// Admin pages
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminReports from "./pages/admin/AdminReports";
import AdminKyc from "./pages/admin/AdminKyc";
import AdminSettings from "./pages/admin/AdminSettings";

import AdminOrders from "./pages/admin/AdminOrders";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminCredits from "./pages/admin/AdminCredits";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminActivityLog from "./pages/admin/AdminActivityLog";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminCategories from "./pages/admin/AdminCategories";
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
              <Route path="/marketplace/:id" element={<ListingDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/faq" element={<Faq />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/wallet" element={<DashboardWallet />} />
              <Route path="/dashboard/listings" element={<DashboardListings />} />
              <Route path="/dashboard/orders" element={<DashboardOrders />} />
              <Route path="/dashboard/messages" element={<DashboardMessages />} />
              <Route path="/dashboard/profile" element={<DashboardProfile />} />
              <Route path="/dashboard/settings" element={<DashboardSettings />} />
              <Route path="/dashboard/wishlist" element={<DashboardWishlist />} />
              <Route path="/dashboard/withdraw" element={<DashboardWithdraw />} />
              <Route path="/dashboard/kyc" element={<DashboardKyc />} />
              <Route path="/dashboard/support" element={<DashboardSupport />} />
              <Route path="/dashboard/coupons" element={<DashboardCoupons />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/listings" element={<AdminListings />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/kyc" element={<AdminKyc />} />
              
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin/banners" element={<AdminBanners />} />
              <Route path="/admin/support" element={<AdminSupport />} />
              <Route path="/admin/credits" element={<AdminCredits />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/activity-log" element={<AdminActivityLog />} />
              <Route path="/admin/coupons" element={<AdminCoupons />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              
              
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import Index from "./pages/Index";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import PostGenerator from "./pages/PostGenerator";
import CommentGenerator from "./pages/CommentGenerator";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import BlogsPage from "./pages/BlogsPage";
import BlogPostPage from "./pages/BlogPostPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import TemplatesPage from "./pages/TemplatesPage";
import ProfileAnalyzer from "./pages/ProfileAnalyzer";
// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import TestimonialsManagement from "./pages/admin/TestimonialsManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import Analytics from "./pages/admin/Analytics";
import { ProtectedAdminRoute } from "./components/admin/ProtectedAdminRoute";
// Roadmap and Changelog removed
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public auth pages without layout */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                
                {/* Admin Routes - No AppLayout */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedAdminRoute>
                      <UserManagement />
                    </ProtectedAdminRoute>
                  } 
                />
                <Route 
                  path="/admin/testimonials" 
                  element={
                    <ProtectedAdminRoute>
                      <TestimonialsManagement />
                    </ProtectedAdminRoute>
                  } 
                />
                <Route 
                  path="/admin/blog" 
                  element={
                    <ProtectedAdminRoute>
                      <BlogManagement />
                    </ProtectedAdminRoute>
                  } 
                />
                <Route 
                  path="/admin/analytics" 
                  element={
                    <ProtectedAdminRoute>
                      <Analytics />
                    </ProtectedAdminRoute>
                  } 
                />
                {/* Redirect /admin to /admin/dashboard */}
                <Route path="/admin" element={<AdminLogin />} />

                {/* All other pages share header/footer */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/post-generator" element={<PostGenerator />} />
                  <Route path="/comment-generator" element={<CommentGenerator />} />
                  {/* Blog Routes */}
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/:slug" element={<BlogPostPage />} />
                  {/* Static Pages */}
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/resources" element={<HelpCenterPage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/profile-analyzer" element={<ProfileAnalyzer />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

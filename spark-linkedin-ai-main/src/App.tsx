import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Lazy load heavy components for better performance
const PostGenerator = lazy(() => import("./pages/PostGenerator"));
const IdeaGenerator = lazy(() => import("./pages/IdeaGenerator"));
const CommentGenerator = lazy(() => import("./pages/CommentGenerator"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage"));
const ProfileAnalyzer = lazy(() => import("./pages/ProfileAnalyzer"));
const Referrals = lazy(() => import("./pages/Referrals"));
const TestimonialCollection = lazy(() => import("./pages/TestimonialCollection"));
const PlanManagement = lazy(() => import("./pages/PlanManagement").then(module => ({ default: module.default })));
const BlogListingPage = lazy(() => import("./pages/BlogListingPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const ProfileCompletion = lazy(() => import("./pages/ProfileCompletion"));
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

// Loading component for lazy loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span>Loading...</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                {/* Public auth pages without layout */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/testimonial" element={<TestimonialCollection />} />
                
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
                  <Route path="/idea-generator" element={<IdeaGenerator />} />
                  <Route path="/post-generator" element={<PostGenerator />} />
                  <Route path="/comment-generator" element={<CommentGenerator />} />
                  {/* Blog Routes */}
                  {/* Static Pages */}
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/resources" element={<HelpCenterPage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/profile-analyzer" element={<ProfileAnalyzer />} />
                  <Route path="/plan-management" element={<PlanManagement />} />
                  <Route path="/profile-setup" element={<ProfileCompletion />} />
                  <Route path="/referral" element={<Referrals />} />
                  <Route path="/blogs" element={<BlogListingPage />} />
                  <Route path="/blogs/:slug" element={<BlogPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </TooltipProvider>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

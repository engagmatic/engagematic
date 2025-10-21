import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
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
import { AdminDashboard } from "./pages/admin/AdminDashboard";
// Roadmap and Changelog removed
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
                <Routes>
                  {/* Public auth pages without layout */}
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  
                  {/* Admin-only route (no layout) */}
                  <Route path="/admin" element={<AdminDashboard />} />

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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

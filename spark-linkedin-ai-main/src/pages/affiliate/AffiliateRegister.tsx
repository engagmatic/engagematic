import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Helmet } from "react-helmet-async";
import { UserPlus, Mail, Lock, User, Briefcase, Building2, Linkedin, Globe } from "lucide-react";

export default function AffiliateRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile: {
      jobTitle: "",
      company: "",
      linkedinUrl: "",
      website: "",
      bio: "",
      audienceSize: "",
      platforms: [] as string[],
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("profile.")) {
      const profileField = name.split(".")[1];
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        platforms: formData.profile.platforms.includes(platform)
          ? formData.profile.platforms.filter((p) => p !== platform)
          : [...formData.profile.platforms, platform],
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await api.affiliateRegister(submitData);

      if (response.success) {
        // Token is already saved by api.affiliateRegister
        toast({
          title: "Application Submitted!",
          description: "Your affiliate application is pending approval. You'll receive an email once approved.",
        });
        // Small delay to ensure token is saved
        setTimeout(() => {
          navigate("/affiliate/dashboard");
        }, 100);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit application",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Apply for Affiliate Program | Engagematic</title>
        <meta
          name="description"
          content="Apply to become a Engagematic affiliate. Earn 10% recurring commissions monthly."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">
                  Affiliate Application
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Join the Affiliate Program
              </h1>
              <p className="text-gray-600">
                Earn 10% recurring commissions every month
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Min 6 characters"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information (Optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information (Optional)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profile.jobTitle">Job Title</Label>
                    <div className="relative mt-1">
                      <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="profile.jobTitle"
                        name="profile.jobTitle"
                        type="text"
                        value={formData.profile.jobTitle}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Content Creator"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="profile.company">Company</Label>
                    <div className="relative mt-1">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="profile.company"
                        name="profile.company"
                        type="text"
                        value={formData.profile.company}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Your Company"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="profile.linkedinUrl">LinkedIn Profile URL</Label>
                  <div className="relative mt-1">
                    <Linkedin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="profile.linkedinUrl"
                      name="profile.linkedinUrl"
                      type="url"
                      value={formData.profile.linkedinUrl}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="profile.website">Website/Blog</Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="profile.website"
                      name="profile.website"
                      type="url"
                      value={formData.profile.website}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/affiliate/login"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Log in
                </Link>
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
}


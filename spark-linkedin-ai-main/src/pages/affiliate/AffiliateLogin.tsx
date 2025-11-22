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
import { LogIn, Mail, Lock } from "lucide-react";

export default function AffiliateLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.affiliateLogin(formData);

      if (response.success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your affiliate account",
        });
        navigate("/affiliate/dashboard");
      } else {
        toast({
          title: "Error",
          description: response.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Affiliate Login | Engagematic</title>
        <meta
          name="description"
          content="Login to your Engagematic affiliate account"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                <LogIn className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">
                  Affiliate Login
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Login to your affiliate dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
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
                    placeholder="affiliate@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
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
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Don't have an affiliate account?{" "}
                <Link
                  to="/affiliate/register"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Apply now
                </Link>
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
}


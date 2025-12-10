import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Users,
  TrendingUp,
  Copy,
  Check,
  Mail,
  Linkedin,
  Twitter,
  MessageCircle,
  ArrowRight,
  BarChart3,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Helmet } from "react-helmet-async";

export default function AffiliateDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [affiliate, setAffiliate] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Get dashboard stats
      const statsResponse = await api.getAffiliateDashboardStats();
      if (statsResponse.success) {
        setAffiliate(statsResponse.data.affiliate);
        setStats(statsResponse.data.stats);
      }

      // Get commissions
      const commissionsResponse = await api.getAffiliateCommissions(1, 10);
      if (commissionsResponse.success) {
        setCommissions(commissionsResponse.data.commissions || []);
      }

      // Get referrals
      const referralsResponse = await api.getAffiliateReferrals();
      if (referralsResponse.success) {
        setReferrals(referralsResponse.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      if (error.message?.includes("401") || error.message?.includes("Authentication")) {
        toast({
          title: "Authentication Required",
          description: "Please log in to your affiliate account",
          variant: "destructive",
        });
        navigate("/affiliate/login");
      } else {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (affiliate?.referralLink) {
      navigator.clipboard.writeText(affiliate.referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnSocial = (platform: string) => {
    const url = affiliate?.referralLink || "";
    const text = "Join Engagematic and get 14-day extended trial! 🚀";

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  // Show pending/rejected status but allow viewing dashboard
  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white flex items-center justify-center py-12 px-4">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Loading...
          </h2>
          <p className="text-gray-600 mb-6">
            Please wait while we load your dashboard.
          </p>
        </Card>
      </div>
    );
  }
  
  // Show warning banner for pending/rejected status but allow dashboard access
  const showStatusBanner = affiliate.status === "pending" || affiliate.status === "rejected" || affiliate.status === "suspended";

  return (
    <>
      <Helmet>
        <title>Affiliate Dashboard | Engagematic</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Status Banner */}
          {showStatusBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className={`p-4 ${
                affiliate.status === "pending" 
                  ? "bg-yellow-50 border-yellow-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {affiliate.status === "pending"
                        ? "Application Pending Approval"
                        : affiliate.status === "rejected"
                        ? "Application Rejected"
                        : "Account Suspended"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {affiliate.status === "pending"
                        ? "Your affiliate application is under review. You can view your referral link and stats, but commissions will only be processed after approval."
                        : "Your affiliate account is not active. Please contact support for assistance."}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome, {affiliate.name}!
                </h1>
                <p className="text-gray-600">
                  Track your earnings and referrals in real-time
                </p>
              </div>
              <Button
                onClick={() => navigate("/affiliate/login")}
                variant="outline"
              >
                Logout
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <span className="text-sm text-gray-500">Total</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats?.totalClicks || 0}
                </div>
                <div className="text-sm text-gray-600">Link Clicks</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <span className="text-sm text-gray-500">Active</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats?.totalSignups || 0}
                </div>
                <div className="text-sm text-gray-600">Signups</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  <span className="text-sm text-gray-500">Total Earned</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ₹{stats?.totalEarned?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">All-Time</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                  <span className="text-sm text-gray-500">Monthly</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ₹{stats?.monthlyRecurring?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">Recurring Income</div>
              </Card>
            </motion.div>
          </div>

          {/* Referral Link Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Affiliate Link
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Input
                  value={affiliate.referralLink || ""}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={handleCopy}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              <div className="grid sm:grid-cols-4 gap-3">
                <Button
                  onClick={() => shareOnSocial("twitter")}
                  variant="outline"
                  className="gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  onClick={() => shareOnSocial("linkedin")}
                  variant="outline"
                  className="gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button
                  onClick={() => shareOnSocial("whatsapp")}
                  variant="outline"
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => window.open(`mailto:?subject=Join Engagematic&body=${encodeURIComponent(affiliate.referralLink)}`, "_blank")}
                  variant="outline"
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Commission History */}
          {commissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Recent Commissions
                </h2>

                <div className="space-y-4">
                  {commissions.slice(0, 5).map((commission: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold">
                          ₹
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {commission.referredUserId?.name || "Referred User"}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {commission.commissionPeriod} • {commission.plan} Plan
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          ₹{commission.monthlyCommissionAmount?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {commission.status === "paid"
                            ? "Paid"
                            : commission.status === "pending"
                            ? "Pending"
                            : commission.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {commissions.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/affiliate/commissions")}
                    >
                      View All Commissions
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Referrals List */}
          {referrals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Your Referrals
                </h2>

                <div className="space-y-4">
                  {referrals.slice(0, 10).map((referral: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                          {referral.referredUser?.email?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {referral.referredUser?.name ||
                              referral.referredUser?.email ||
                              "Anonymous"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(referral.joinedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            referral.status === "completed" ||
                            referral.status === "rewarded"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {referral.status === "completed" ||
                          referral.status === "rewarded"
                            ? "✓ Active"
                            : "⏳ Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}


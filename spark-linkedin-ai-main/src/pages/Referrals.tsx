import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Copy,
  Check,
  Users,
  TrendingUp,
  Mail,
  Twitter,
  Linkedin,
  MessageCircle,
  ExternalLink,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

export default function Referrals() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [referralData, setReferralData] = useState(null);
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    fetchReferralData();
  }, [isAuthenticated, navigate]);

  const fetchReferralData = async () => {
    try {
      setIsLoading(true);

      // Get referral stats (this includes the referral code and link)
      const statsResponse = await api.getReferralStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
        setReferralData({
          referralCode: statsResponse.data.referralCode,
          referralLink: statsResponse.data.referralLink
        });
      } else {
        // If no stats, generate referral code
        const codeResponse = await api.generateReferralCode();
        if (codeResponse.success) {
          setReferralData(codeResponse.data);
        }
      }

      // Get referrals list
      const referralsResponse = await api.getMyReferrals();
      if (referralsResponse.success) {
        setReferrals(referralsResponse.data || []);
      }

      // Get commission history
      try {
        const commissionsResponse = await api.getAffiliateCommissions();
        if (commissionsResponse.success) {
          setCommissions(commissionsResponse.data?.commissions || []);
        }
      } catch (error) {
        console.error("Error fetching commissions:", error);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      await api.sendReferralInvites({
        emails: [email],
        message: "Check out Engagematic - it's helping me create amazing LinkedIn content!",
      });

      toast({
        title: "Sent!",
        description: "Referral invitation sent successfully",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const shareOnSocial = (platform) => {
    const url = referralData?.referralLink || "";
    const text = "Join me on Engagematic and get a 14-day extended trial! 🚀";

    const urls = {
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
          <p className="text-gray-600">Loading your referral dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
            <Gift className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              Referral Program
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Affiliate Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Earn <strong className="text-purple-600">10% recurring commission</strong> every month when your referrals subscribe. Track your earnings in real-time.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <span className="text-sm text-gray-500">Active</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.signups || 0}
              </div>
              <div className="text-sm text-gray-600">Signups</div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-gray-500">Total Earned</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{stats?.commissions?.totalEarned?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">All-Time Commissions</div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
                <span className="text-sm text-gray-500">Monthly</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{stats?.commissions?.monthlyRecurring?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Recurring Income</div>
            </Card>
          </motion.div>
        </div>

        {/* Referral Link Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Referral Link</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Input
                value={referralData?.referralLink || ""}
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
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                More
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Send by Email */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send by Email</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSendEmail}
                disabled={isSending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* How It Works */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-8 mb-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8" />
              <h2 className="text-2xl font-bold">How It Works</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold mb-2">1</div>
                <div className="font-semibold mb-2">Share Your Link</div>
                <div className="text-sm text-white/80">
                  Send your unique referral link to friends via email, social media, or direct message
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold mb-2">2</div>
                <div className="font-semibold mb-2">They Sign Up</div>
                <div className="text-sm text-white/80">
                  Your friend signs up and gets a 14-day trial (7 days longer than usual!)
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold mb-2">3</div>
                <div className="font-semibold mb-2">They Subscribe</div>
                <div className="text-sm text-white/80">
                  When they subscribe, you earn 10% commission every month they stay active. Recurring income!
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Commission History */}
        {commissions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Commission History</h2>
              
              <div className="space-y-4">
                {commissions.slice(0, 10).map((commission, index) => (
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
                        <div className="text-sm text-gray-600">
                          {commission.plan} Plan • {commission.commissionPeriod}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ₹{commission.monthlyCommissionAmount?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {commission.status === "paid" ? "Paid" : commission.status === "pending" ? "Pending" : commission.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {commissions.length > 10 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => navigate("/referral?tab=commissions")}>
                    View All Commissions
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Referrals List */}
        {referrals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Referrals</h2>
              
              <div className="space-y-4">
                {referrals.map((referral, index) => (
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
                          {referral.referredUser?.name || referral.referredUser?.email || "Anonymous"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(referral.joinedDate || referral.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          referral.status === "completed" || referral.status === "rewarded"
                            ? "bg-green-100 text-green-800"
                            : referral.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {referral.status === "completed" || referral.status === "rewarded" ? "✓ Active" : "⏳ Pending"}
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
  );
}


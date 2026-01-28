import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Check, Zap, Rocket, Settings, Globe, IndianRupee, Clock, Shield, Users, BarChart3, Eye, Zap as Lightning, Snowflake, AtSign, Headphones, Globe as GlobeIcon, ArrowRight, Sparkles, X, Lock, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";
import { useCreditPayment } from "@/hooks/useRazorpay";
import geoLocationService from "@/services/geoLocationService";
import { useAuth } from "@/contexts/AuthContext";
import { premiumCTAClasses, premiumCTAHighlight, premiumCTAIcon } from "@/styles/premiumButtons";
import { CouponInput } from "@/components/CouponInput";

type Currency = 'INR' | 'USD';
type PlanType = 'starter' | 'pro' | 'bulk';
type BillingInterval = 'monthly' | 'yearly';

interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: { INR: number; USD: number };
  yearlyPrice: { INR: number; USD: number };
  features: { text: string; icon: React.ReactNode }[];
  limits: {
    posts: number;
    comments: number;
    ideas: number;
  };
  yearlyLimits: {
    posts: number;
    comments: number;
    ideas: number;
  };
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'LinkedIn newcomers',
    price: { INR: 199, USD: 10 }, // Updated to ₹199/month
    yearlyPrice: { INR: 1990, USD: 100 }, // 10 months price (2 months free)
    limits: { posts: 15, comments: 30, ideas: -1 }, // -1 means unlimited
    yearlyLimits: { posts: 15, comments: 30, ideas: -1 }, // Unlimited ideas
    features: [], // Will be populated dynamically
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Professionals & content creators',
    price: { INR: 449, USD: 19 }, // Updated to ₹449/month
    yearlyPrice: { INR: 4490, USD: 190 }, // 10 months price (2 months free)
    limits: { posts: 60, comments: 80, ideas: -1 }, // -1 means unlimited
    yearlyLimits: { posts: 60, comments: 80, ideas: -1 }, // Unlimited ideas
    popular: true,
    features: [], // Will be populated dynamically
    icon: <Rocket className="h-6 w-6" />
  },
  {
    id: 'bulk',
    name: 'Bulk Pack',
    description: 'Occasional/campaign creators',
    price: { INR: 150, USD: 15 }, // Base price (will be calculated based on slider)
    yearlyPrice: { INR: 150, USD: 15 }, // One-time purchase
    limits: { posts: 10, comments: 10, ideas: 10 }, // Default, will be overridden by slider
    yearlyLimits: { posts: 10, comments: 10, ideas: 10 },
    features: [], // Will be populated dynamically
    icon: <Settings className="h-6 w-6" />
  }
];


export const SaaSPricing = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [couponData, setCouponData] = useState<any>(null);
  const [bulkCredits, setBulkCredits] = useState({ posts: 9, comments: 7, ideas: 7 }); // Slider values for Bulk Pack (9 posts = ₹125 minimum)
  const [showBulkSlider, setShowBulkSlider] = useState(false); // Control slider visibility
  const navigate = useNavigate();
  const { processCreditPayment, isProcessing, isLoaded } = useCreditPayment();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Auto-detect user's region (default to USD first)
  useEffect(() => {
    const detectRegion = async () => {
      try {
        const geoData = await geoLocationService.detectUserLocation();
        // Only set to INR if user is in India, otherwise keep USD default
        if (geoData.region === 'India') {
          setCurrency('INR');
        }
        // Keep USD as default for all other regions
      } catch (error) {
        console.log('Could not detect region, keeping USD default');
        // Keep USD as default
      }
    };

    detectRegion();
  }, []);

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const getPlanPrice = (plan: Plan) => {
    return billingInterval === 'yearly' ? plan.yearlyPrice[currency] : plan.price[currency];
  };

  const getMonthlyEquivalent = (plan: Plan) => {
    if (billingInterval === 'yearly') {
      return plan.price[currency];
    }
    return Math.round(plan.yearlyPrice[currency] / 12);
  };

  const getPlanFeatures = (plan: Plan) => {
    const currentLimits = billingInterval === 'yearly' ? plan.yearlyLimits : plan.limits;
    
    if (plan.id === 'starter') {
      const ideasText = currentLimits.ideas === -1 ? 'Unlimited content ideas per month' : `${currentLimits.ideas} content ideas per month`;
      return [
        { text: `${currentLimits.posts} LinkedIn posts per month`, icon: <Clock className="h-4 w-4" /> },
        { text: `${currentLimits.comments} comments per month`, icon: <Users className="h-4 w-4" /> },
        { text: ideasText, icon: <Zap className="h-4 w-4" /> },
        { text: '15 curated AI personas', icon: <Users className="h-4 w-4" /> },
        { text: 'Smart Planner', icon: <Check className="h-4 w-4" /> },
        { text: 'Basic analytics', icon: <BarChart3 className="h-4 w-4" /> },
        { text: 'Basic formatting controls', icon: <Settings className="h-4 w-4" /> },
        { text: 'Basic support (Email)', icon: <AtSign className="h-4 w-4" /> },
        { text: '7-day free trial, all Pro features', icon: <Check className="h-4 w-4" /> }
      ];
    }
    
    if (plan.id === 'pro') {
      const ideasText = currentLimits.ideas === -1 ? 'Unlimited content ideas per month' : `${currentLimits.ideas} content ideas per month`;
      return [
        { text: `${currentLimits.posts} LinkedIn posts per month`, icon: <Clock className="h-4 w-4" /> },
        { text: `${currentLimits.comments} comments per month`, icon: <Users className="h-4 w-4" /> },
        { text: ideasText, icon: <Zap className="h-4 w-4" /> },
        { text: 'Unlimited custom AI personas, full edits', icon: <Users className="h-4 w-4" /> },
        { text: 'Smart Planner', icon: <Check className="h-4 w-4" /> },
        { text: 'Advanced analytics', icon: <BarChart3 className="h-4 w-4" /> },
        { text: 'Full, premium formatting controls', icon: <Settings className="h-4 w-4" /> },
        { text: 'Priority support (Chat + Email)', icon: <Headphones className="h-4 w-4" /> },
        { text: 'Early new feature access', icon: <Sparkles className="h-4 w-4" /> },
        { text: 'Persona tuning', icon: <Settings className="h-4 w-4" /> },
        { text: '7-day free trial, all Pro features', icon: <Check className="h-4 w-4" /> }
      ];
    }

    if (plan.id === 'bulk') {
      return [
        { text: `${bulkCredits.posts} LinkedIn posts (use anytime, no expiry)`, icon: <Clock className="h-4 w-4" /> },
        { text: `${bulkCredits.comments} comments included`, icon: <Users className="h-4 w-4" /> },
        { text: `${bulkCredits.ideas} content ideas included`, icon: <Zap className="h-4 w-4" /> },
        { text: 'Basic formatting controls', icon: <Settings className="h-4 w-4" /> },
        { text: 'Email support', icon: <AtSign className="h-4 w-4" /> },
        { text: '7-day free trial, all Pro features', icon: <Check className="h-4 w-4" /> }
      ];
    }
    
    return plan.features;
  };

  const getBulkPackPrice = () => {
    if (currency === 'INR') {
      // Minimum price: ₹125 for 9 posts
      // Then ₹15 per post for additional posts
      if (bulkCredits.posts <= 9) {
        return 125; // Minimum price
      }
      // For 10+ posts: ₹125 base + (additional posts × ₹15)
      return 125 + ((bulkCredits.posts - 9) * 15);
    } else {
      // USD: $0.49 per post (100 posts = $49)
      // Minimum is based on posts selected (9 posts minimum = $4.41)
      const minPosts = 9;
      const postPrice = 0.49;
      const postsSelected = Math.max(bulkCredits.posts, minPosts);
      const price = postsSelected * postPrice;
      return Math.round(price * 100) / 100; // Round to 2 decimal places
    }
  };

  const handleBulkSliderChange = (type: 'posts' | 'comments' | 'ideas', value: number[]) => {
    const newValue = value[0];
    if (type === 'posts') {
      // When posts change, auto-adjust comments and ideas proportionally
      const ratio = newValue / bulkCredits.posts;
      setBulkCredits({
        posts: newValue,
        comments: Math.round(bulkCredits.comments * ratio),
        ideas: Math.round(bulkCredits.ideas * ratio)
      });
    } else {
      setBulkCredits({ ...bulkCredits, [type]: newValue });
    }
  };

  const handlePlanSelect = async (planId: PlanType) => {
    console.log('Plan selected:', planId);

    if (!isAuthenticated) {
      toast.error('Please log in to start your free trial');
      navigate('/auth/register');
      return;
    }

    if (!isLoaded) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      let credits;
      
      if (planId === 'bulk') {
        // Bulk pack: one-time purchase, credits based on sliders
        credits = {
          posts: bulkCredits.posts,
          comments: bulkCredits.comments,
          ideas: bulkCredits.ideas
        };
      } else {
        // Monthly/yearly plans
        credits = {
          posts: billingInterval === 'yearly' ? plan.yearlyLimits.posts : plan.limits.posts,
          comments: billingInterval === 'yearly' ? plan.yearlyLimits.comments : plan.limits.comments,
          ideas: billingInterval === 'yearly' ? plan.yearlyLimits.ideas : plan.limits.ideas
        };
      }

      // Check if Razorpay is properly configured
      if (!isLoaded) {
        toast.error('Payment system is currently unavailable. Please contact support.');
        return;
      }

      // For bulk pack, use one-time billing, otherwise use selected interval
      // Ensure billingInterval is set for non-bulk plans
      if (planId !== 'bulk' && !billingInterval) {
        toast.error('Please select monthly or yearly billing');
        return;
      }
      
      const billingType = planId === 'bulk' ? 'one-time' : billingInterval;
      
      // Process payment with Razorpay
      await processCreditPayment(credits, currency, billingType);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Payment is currently unavailable. Please contact support or try again later.');
    }
  };

  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-24 gradient-hero scroll-mt-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your LinkedIn content needs.
          </p>
        </div>

        {/* Currency Toggle */}
        <div className="flex justify-center gap-3 mb-12">
          <Button
            variant={currency === 'INR' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency('INR')}
            className="gap-2 px-6 py-2"
          >
            <IndianRupee className="h-4 w-4" />
            India (INR)
          </Button>
          <Button
            variant={currency === 'USD' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrency('USD')}
            className="gap-2 px-6 py-2"
          >
            <Globe className="h-4 w-4" />
            International (USD)
          </Button>
        </div>

        {/* Billing Toggle - Hide for Bulk Pack */}
        {selectedPlan !== 'bulk' && (
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <Button
                variant={billingInterval === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingInterval('monthly')}
                className="px-6 py-2"
              >
                Monthly
              </Button>
              <Button
                variant={billingInterval === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingInterval('yearly')}
                className="px-6 py-2"
              >
                Yearly
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Coupon Input */}
        {/* <div className="max-w-md mx-auto mb-8">
          {selectedPlan !== 'custom' && (
            <CouponInput
              amount={getPlanPrice(plans.find(p => p.id === selectedPlan) || plans[1])}
              plan={selectedPlan as 'starter' | 'pro'}
              onCouponApplied={(data) => setCouponData(data)}
              onCouponRemoved={() => setCouponData(null)}
            />
          )}
        </div> */}

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  plan.popular 
                    ? 'border-primary shadow-md scale-105 bg-gradient-to-b from-white to-blue-50/20' 
                    : 'hover:border-primary/50 bg-white'
                } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="p-6 space-y-5">
                  {/* Plan Header */}
                  <div className="text-center space-y-2">
                    <div className="flex justify-center">
                      <div className={`p-2 rounded-full ${
                        plan.popular ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                      }`}>
                        {plan.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="text-center space-y-1">
                    {plan.id === 'bulk' ? (
                      <div className="space-y-4">
                        {/* Price Display */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-3xl font-bold text-gray-900">{currencySymbol}</span>
                            <span className="text-3xl font-bold text-gray-900">
                              {currency === 'INR' ? getBulkPackPrice() : getBulkPackPrice().toFixed(2)}
                            </span>
                            <span className="text-gray-600 text-lg">one-time</span>
                          </div>
                          {showBulkSlider && (
                            <p className="text-xs text-muted-foreground">
                              {bulkCredits.posts} posts • {bulkCredits.comments} comments • {bulkCredits.ideas} ideas
                            </p>
                          )}
                        </div>

                        {/* Button to Show/Hide Slider */}
                        {!showBulkSlider ? (
                          <Button
                            onClick={() => setShowBulkSlider(true)}
                            variant="ghost"
                            size="sm"
                            className="group relative w-full justify-center gap-2 overflow-hidden rounded-full border border-white/40 bg-gradient-to-br from-white/25 via-white/10 to-transparent px-5 py-5 text-sm font-semibold text-primary shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/80 hover:bg-primary/90 hover:text-white"
                          >
                            <span className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <Settings className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                            <span className="relative">Customize Your Pack</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setShowBulkSlider(false)}
                            variant="ghost"
                            size="sm"
                            className="w-full gap-2 text-xs"
                          >
                            Hide Customization
                          </Button>
                        )}

                        {/* Sliders for Bulk Pack - Only shown when button is clicked */}
                        {showBulkSlider && (
                          <div className="space-y-5 px-2 animate-in fade-in slide-in-from-top-4 duration-300">
                            {/* Posts Slider */}
                            <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-semibold text-gray-700">LinkedIn Posts</h4>
                              <Badge variant="secondary" className="text-xs">
                                {bulkCredits.posts} posts
                              </Badge>
                            </div>
                            <Slider
                              value={[bulkCredits.posts]}
                              onValueChange={(value) => handleBulkSliderChange('posts', value)}
                              min={9}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>9</span>
                              <span className="font-medium text-primary">{bulkCredits.posts}</span>
                              <span>100</span>
                            </div>
                            </div>

                            {/* Comments Slider */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-gray-700">Comments</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {bulkCredits.comments} comments
                                </Badge>
                              </div>
                            <Slider
                              value={[bulkCredits.comments]}
                              onValueChange={(value) => handleBulkSliderChange('comments', value)}
                              min={7}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>7</span>
                              <span className="font-medium text-primary">{bulkCredits.comments}</span>
                              <span>100</span>
                            </div>
                          </div>

                          {/* Ideas Slider */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-semibold text-gray-700">Content Ideas</h4>
                              <Badge variant="secondary" className="text-xs">
                                {bulkCredits.ideas} ideas
                              </Badge>
                            </div>
                            <Slider
                              value={[bulkCredits.ideas]}
                              onValueChange={(value) => handleBulkSliderChange('ideas', value)}
                              min={7}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>7</span>
                              <span className="font-medium text-primary">{bulkCredits.ideas}</span>
                              <span>100</span>
                            </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-gray-900">{currencySymbol}</span>
                          <span className="text-3xl font-bold text-gray-900">{getPlanPrice(plan)}</span>
                          <span className="text-gray-600">
                            {billingInterval === 'yearly' ? '/year' : '/month'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {billingInterval === 'yearly' ? 
                            `Billed yearly (${currencySymbol}${getMonthlyEquivalent(plan)}/month)` : 
                            'Billed monthly'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {getPlanFeatures(plan).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 text-gray-500">
                          {feature.icon}
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">{feature.text}</span>
                      </div>
                    ))}
                    
                    {/* Yearly-specific benefits */}
                    {billingInterval === 'yearly' && (
                      <>
                        <div className="flex items-start gap-2 mt-3 pt-2 border-t border-gray-200">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 text-green-600">
                            <Check className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-green-700 font-medium">2 months FREE (17% savings)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 text-green-600">
                            <Check className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-green-700">Priority feature access</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 text-green-600">
                            <Check className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-green-700">Dedicated account manager</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="pt-3">
                    <Button 
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isProcessing || (isAuthenticated && !isLoaded)}
                      className={`${premiumCTAClasses} ${(isProcessing || (isAuthenticated && !isLoaded)) ? 'pointer-events-none opacity-60' : ''}`}
                    >
                      <span className={premiumCTAHighlight} />
                      <span className="relative">
                        {isProcessing ? 'Processing...' : 
                         (isAuthenticated && !isLoaded) ? 'Loading...' : 
                         !isAuthenticated ? 'Start Free Trial' : 
                         `Upgrade to ${plan.name}`}
                      </span>
                      <ArrowRight className={`${premiumCTAIcon}`} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Simple Trial Information */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-8 px-8 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-full border border-green-200 dark:border-green-800 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                <Check className="h-4 w-4 text-green-600" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                <Check className="h-4 w-4 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                <Check className="h-4 w-4 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
import { CouponInput } from "@/components/CouponInput";

type Currency = 'INR' | 'USD';
type PlanType = 'starter' | 'pro' | 'elite';
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
    description: 'Perfect for individuals getting started',
    price: { INR: 249, USD: 10 },
    yearlyPrice: { INR: 2490, USD: 100 }, // 10 months price (2 months free)
    limits: { posts: 15, comments: 30, ideas: 30 },
    yearlyLimits: { posts: 15, comments: 30, ideas: 30 }, // Same limits for yearly
    features: [], // Will be populated dynamically
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for professionals and content creators',
    price: { INR: 649, USD: 19 },
    yearlyPrice: { INR: 6490, USD: 190 }, // 10 months price (2 months free)
    limits: { posts: 60, comments: 80, ideas: 80 },
    yearlyLimits: { posts: 60, comments: 80, ideas: 80 }, // Same limits for yearly
    popular: true,
    features: [], // Will be populated dynamically
    icon: <Rocket className="h-6 w-6" />
  },
  {
    id: 'elite',
    name: 'Elite / Agency',
    description: 'For agencies and power users',
    price: { INR: 1299, USD: 49 }, // Value-driven pricing for Elite
    yearlyPrice: { INR: 12990, USD: 490 }, // 10 months price (2 months free)
    limits: { posts: 200, comments: 300, ideas: 200 },
    yearlyLimits: { posts: 200, comments: 300, ideas: 200 }, // Same limits for yearly
    features: [], // Will be populated dynamically
    icon: <Star className="h-6 w-6" />
  }
];


export const SaaSPricing = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [couponData, setCouponData] = useState<any>(null);
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
      return [
        { text: `${currentLimits.posts} LinkedIn posts per month`, icon: <Clock className="h-4 w-4" /> },
        { text: `${currentLimits.comments} LinkedIn comments per month`, icon: <Users className="h-4 w-4" /> },
        { text: `${currentLimits.ideas} content ideas per month`, icon: <Zap className="h-4 w-4" /> },
        { text: '15 curated AI personas', icon: <Users className="h-4 w-4" /> },
        { text: 'Smart Planner', icon: <Settings className="h-4 w-4" /> },
        { text: 'Basic analytics', icon: <BarChart3 className="h-4 w-4" /> },
        { text: 'Basic support (Email)', icon: <AtSign className="h-4 w-4" /> },
        { text: '7-day free trial with full Pro features', icon: <Check className="h-4 w-4" /> }
      ];
    }
    
    if (plan.id === 'pro') {
      return [
        { text: 'Everything in Starter, plus:', icon: <Check className="h-4 w-4" /> },
        { text: `${currentLimits.posts} LinkedIn posts per month`, icon: <Clock className="h-4 w-4" /> },
        { text: `${currentLimits.comments} LinkedIn comments per month`, icon: <Users className="h-4 w-4" /> },
        { text: `${currentLimits.ideas} content ideas per month`, icon: <Zap className="h-4 w-4" /> },
        { text: 'Custom persona creation, unlimited edits', icon: <Users className="h-4 w-4" /> },
        { text: 'Smart Planner', icon: <Settings className="h-4 w-4" /> },
        { text: 'Advanced analytics', icon: <BarChart3 className="h-4 w-4" /> },
        { text: 'Priority support (Chat + Email)', icon: <Headphones className="h-4 w-4" /> },
        { text: '7-day free trial with full Pro features', icon: <Check className="h-4 w-4" /> }
      ];
    }

    if (plan.id === 'elite') {
      return [
        { text: 'Everything in Pro, plus:', icon: <Check className="h-4 w-4" /> },
        { text: `${currentLimits.posts} LinkedIn posts per month`, icon: <Clock className="h-4 w-4" /> },
        { text: `${currentLimits.comments} LinkedIn comments per month`, icon: <Users className="h-4 w-4" /> },
        { text: `${currentLimits.ideas} content ideas per month`, icon: <Zap className="h-4 w-4" /> },
        { text: 'Unlimited AI personas', icon: <Users className="h-4 w-4" /> },
        { text: 'Smart Planner', icon: <Settings className="h-4 w-4" /> },
        { text: 'Full analytics dashboard', icon: <BarChart3 className="h-4 w-4" /> },
        { text: 'API access (coming soon)', icon: <GlobeIcon className="h-4 w-4" /> },
        { text: 'Dedicated account manager', icon: <Headphones className="h-4 w-4" /> },
        { text: '7-day free trial with full Elite features', icon: <Check className="h-4 w-4" /> }
      ];
    }
    
    return plan.features;
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

      const credits = {
        posts: billingInterval === 'yearly' ? plan.yearlyLimits.posts : plan.limits.posts,
        comments: billingInterval === 'yearly' ? plan.yearlyLimits.comments : plan.limits.comments,
        ideas: billingInterval === 'yearly' ? plan.yearlyLimits.ideas : plan.limits.ideas
      };

      // Check if Razorpay is properly configured
      if (!isLoaded) {
        toast.error('Payment system is currently unavailable. Please contact support.');
        return;
      }

      // Process payment with Razorpay
      await processCreditPayment(credits, currency, billingInterval);
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

        {/* Billing Toggle */}
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
                className={`relative transition-all duration-300 hover:shadow-lg ${
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
                      className={`w-full h-10 text-sm font-medium ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90 text-white' 
                          : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                    >
                      {isProcessing ? 'Processing...' : 
                       (isAuthenticated && !isLoaded) ? 'Loading...' : 
                       !isAuthenticated ? 'Start Free Trial' : 
                       `Upgrade to ${plan.name}`}
                      <ArrowRight className="ml-2 h-3 w-3" />
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

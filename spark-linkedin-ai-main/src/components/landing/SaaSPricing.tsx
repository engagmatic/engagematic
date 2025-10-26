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

type Currency = 'INR' | 'USD';
type PlanType = 'starter' | 'pro' | 'custom';
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
    yearlyLimits: { posts: 20, comments: 40, ideas: 40 }, // Higher limits for yearly
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
    yearlyLimits: { posts: 80, comments: 100, ideas: 100 }, // Higher limits for yearly
    popular: true,
    features: [], // Will be populated dynamically
    icon: <Rocket className="h-6 w-6" />
  },
  {
    id: 'custom',
    name: 'Pay Only for What You Use',
    description: 'Perfect for occasional users',
    price: { INR: 0, USD: 0 }, // Will be calculated dynamically
    yearlyPrice: { INR: 0, USD: 0 }, // Will be calculated dynamically
    limits: { posts: 0, comments: 0, ideas: 0 }, // Will be set by user
    yearlyLimits: { posts: 0, comments: 0, ideas: 0 }, // Will be set by user
    features: [
      { text: 'Customize your usage with sliders', icon: <Settings className="h-4 w-4" /> },
      { text: 'Pay only for what you use', icon: <Check className="h-4 w-4" /> },
      { text: 'Scale up or down anytime', icon: <ArrowRight className="h-4 w-4" /> },
      { text: 'No monthly commitment', icon: <Check className="h-4 w-4" /> }
    ],
    icon: <Settings className="h-6 w-6" />
  }
];

interface CreditSelection {
  posts: number;
  comments: number;
  ideas: number;
}

const pricingConfigs: Record<Currency, { postPrice: number; commentPrice: number; ideaPrice: number }> = {
  INR: { postPrice: 5.5, commentPrice: 2.8, ideaPrice: 2.8 }, // Adjusted to match ₹249 for 15/30/30
  USD: { postPrice: 0.22, commentPrice: 0.11, ideaPrice: 0.11 } // Adjusted to match $10 for 15/30/30
};

export const SaaSPricing = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomSliders, setShowCustomSliders] = useState(false);
  const [customCredits, setCustomCredits] = useState<CreditSelection>({ posts: 10, comments: 10, ideas: 10 });
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
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

  // Calculate custom pricing
  const calculateCustomPrice = (credits: CreditSelection): number => {
    const config = pricingConfigs[currency];
    const totalPrice = 
      (credits.posts * config.postPrice) +
      (credits.comments * config.commentPrice) +
      (credits.ideas * config.ideaPrice);
    return Math.round(totalPrice * 100) / 100;
  };

  const formatPrice = (price: number): string => {
    return `${currencySymbol}${price}`;
  };

  const getPlanPrice = (plan: Plan) => {
    if (plan.id === 'custom') {
      return calculateCustomPrice(customCredits);
    }
    return billingInterval === 'yearly' ? plan.yearlyPrice[currency] : plan.price[currency];
  };

  const getMonthlyEquivalent = (plan: Plan) => {
    if (plan.id === 'custom') return null;
    if (billingInterval === 'yearly') {
      return plan.price[currency];
    }
    return Math.round(plan.yearlyPrice[currency] / 12);
  };

  const getPlanFeatures = (plan: Plan) => {
    if (plan.id === 'custom') return plan.features;
    
    const currentLimits = billingInterval === 'yearly' ? plan.yearlyLimits : plan.limits;
    
    if (plan.id === 'starter') {
      return [
        { text: `${currentLimits.posts} LinkedIn posts per month`, icon: <Clock className="h-4 w-4" /> },
        { text: `${currentLimits.comments} LinkedIn comments per month`, icon: <Users className="h-4 w-4" /> },
        { text: `${currentLimits.ideas} content ideas per month`, icon: <Zap className="h-4 w-4" /> },
        { text: 'LinkedIn-trained AI models', icon: <Shield className="h-4 w-4" /> },
        { text: '15 curated AI personas', icon: <Users className="h-4 w-4" /> },
        { text: 'Viral hook suggestions', icon: <BarChart3 className="h-4 w-4" /> },
        { text: 'Smart emoji placement', icon: <Eye className="h-4 w-4" /> },
        { text: 'Copy & share to LinkedIn', icon: <ArrowRight className="h-4 w-4" /> },
        { text: 'Unlimited profile analyses', icon: <BarChart3 className="h-4 w-4" /> },
        { text: 'Email support', icon: <AtSign className="h-4 w-4" /> }
      ];
    }
    
    if (plan.id === 'pro') {
      return [
        { text: 'Everything in Starter, plus:', icon: <Check className="h-4 w-4" /> },
        { text: `${currentLimits.posts} LinkedIn posts per month`, icon: <Clock className="h-4 w-4" /> },
        { text: `${currentLimits.comments} LinkedIn comments per month`, icon: <Users className="h-4 w-4" /> },
        { text: `${currentLimits.ideas} content ideas per month`, icon: <Zap className="h-4 w-4" /> },
        { text: 'Priority support', icon: <Headphones className="h-4 w-4" /> },
        { text: 'Advanced analytics', icon: <BarChart3 className="h-4 w-4" /> },
        { text: 'Early access to features', icon: <Lightning className="h-4 w-4" /> },
        { text: 'Custom persona creation', icon: <Users className="h-4 w-4" /> },
        { text: 'Bulk content generation', icon: <Snowflake className="h-4 w-4" /> },
        { text: 'API access (coming soon)', icon: <GlobeIcon className="h-4 w-4" /> }
      ];
    }
    
    return plan.features;
  };

  const handleCustomSliderChange = (type: keyof CreditSelection, value: number[]) => {
    setCustomCredits(prev => ({ ...prev, [type]: value[0] }));
  };

  const handlePlanSelect = async (planId: PlanType) => {
    console.log('Plan selected:', planId);
    
    if (planId === 'custom') {
      console.log('Showing custom sliders');
      // Show custom sliders inline - no auth required
      setShowCustomSliders(true);
      setSelectedPlan('custom');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please log in to start your free trial');
      navigate('/auth/login', { state: { returnTo: '/pricing' } });
      return;
    }

    if (!isLoaded) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    try {
      // Check profile completion first
      const profileStatus = await api.getProfileStatus();
      if (!profileStatus.success || !profileStatus.data.isComplete) {
        toast.error('Please complete your profile setup first');
        navigate('/profile-setup');
        return;
      }

      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const credits = {
        posts: plan.limits.posts,
        comments: plan.limits.comments,
        ideas: plan.limits.ideas
      };

      // Validate credits first
      const validation = await api.validateCredits(credits);
      if (!validation.success || !validation.data.isValid) {
        toast.error('Invalid credit selection. Please check your inputs.');
        return;
      }

      // Process payment with Razorpay
      await processCreditPayment(credits, currency, 'monthly');
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to process subscription. Please try again.');
    }
  };

  const handleCustomSubscription = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to start your free trial');
      navigate('/auth/login', { state: { returnTo: '/pricing' } });
      return;
    }

    if (!isLoaded) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    try {
      // Check profile completion first
      const profileStatus = await api.getProfileStatus();
      if (!profileStatus.success || !profileStatus.data.isComplete) {
        toast.error('Please complete your profile setup first');
        navigate('/profile-setup');
        return;
      }

      // Validate credits first
      const validation = await api.validateCredits(customCredits);
      if (!validation.success || !validation.data.isValid) {
        toast.error('Invalid credit selection. Please check your inputs.');
        return;
      }

      // Process payment with Razorpay
      await processCreditPayment(customCredits, currency, 'monthly');
    } catch (error) {
      console.error('Custom subscription error:', error);
      toast.error('Failed to process subscription. Please try again.');
    }
  };

  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-24 gradient-hero">
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

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto">
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
                    {plan.id === 'custom' ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-primary">Pay Per Use</div>
                        <p className="text-sm text-gray-600">Customize with sliders</p>
                        <p className="text-xs text-gray-500">
                          Flexible usage-based pricing
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-gray-900">{currencySymbol}</span>
                          <span className="text-3xl font-bold text-gray-900">{getPlanPrice(plan)}</span>
                          <span className="text-gray-600">
                            {plan.id === 'custom' ? '' : billingInterval === 'yearly' ? '/year' : '/month'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {plan.id === 'custom' ? 'Pay per use' : 
                           billingInterval === 'yearly' ? 
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
                    {billingInterval === 'yearly' && plan.id !== 'custom' && (
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
                      disabled={isProcessing || !isLoaded}
                      className={`w-full h-10 text-sm font-medium ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90 text-white' 
                          : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                    >
                      {isProcessing ? 'Processing...' : !isLoaded ? 'Loading...' : 
                       plan.id === 'custom' ? 'Customize Usage' : 'Start Free Trial'}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Custom Plan Sliders - Premium UI */}
          {showCustomSliders && (
            <div className="mt-8 sm:mt-12 max-w-6xl mx-auto px-4">
              <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-primary shadow-lg">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Customize Your Usage</h3>
                  <p className="text-sm sm:text-base text-gray-600">Adjust the sliders to set your perfect plan</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                  {/* Posts Slider */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">LinkedIn Posts</h4>
                      <Badge variant="secondary" className="mt-2">
                        {customCredits.posts} posts/month
                      </Badge>
                    </div>
                    <Slider
                      value={[customCredits.posts]}
                      onValueChange={(value) => handleCustomSliderChange('posts', value)}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>10 posts</span>
                      <span>100 posts</span>
                    </div>
                  </div>

                  {/* Comments Slider */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">LinkedIn Comments</h4>
                      <Badge variant="secondary" className="mt-2">
                        {customCredits.comments} comments/month
                      </Badge>
                    </div>
                    <Slider
                      value={[customCredits.comments]}
                      onValueChange={(value) => handleCustomSliderChange('comments', value)}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>10 comments</span>
                      <span>100 comments</span>
                    </div>
                  </div>

                  {/* Ideas Slider */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Content Ideas</h4>
                      <Badge variant="secondary" className="mt-2">
                        {customCredits.ideas} ideas/month
                      </Badge>
                    </div>
                    <Slider
                      value={[customCredits.ideas]}
                      onValueChange={(value) => handleCustomSliderChange('ideas', value)}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>10 ideas</span>
                      <span>100 ideas</span>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-primary/20">
                  <div className="text-center space-y-3 sm:space-y-4">
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900">Your Custom Plan</h4>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl sm:text-4xl font-bold text-primary">
                        {formatPrice(calculateCustomPrice(customCredits))}
                      </span>
                      <span className="text-base sm:text-lg text-gray-600">/month</span>
                    </div>

                    <Button 
                      onClick={handleCustomSubscription}
                      disabled={isProcessing || !isLoaded}
                      className="w-full h-10 sm:h-12 text-sm font-medium bg-primary hover:bg-primary/90 text-white"
                    >
                      {isProcessing ? 'Processing...' : !isLoaded ? 'Loading...' : 'Start Free Trial'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Close button */}
                <div className="text-center mt-4 sm:mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCustomSliders(false)}
                    className="text-gray-600 hover:text-gray-800 text-sm sm:text-base"
                  >
                    Close Customizer
                  </Button>
                </div>
              </Card>
            </div>
          )}

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

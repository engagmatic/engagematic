import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Settings, 
  Zap, 
  Rocket, 
  Star, 
  Crown, 
  Check, 
  Globe, 
  IndianRupee,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";
import { useCreditPayment } from "@/hooks/useRazorpay";
import React from "react";

type Currency = 'INR' | 'USD';
type PresetType = 'starter' | 'pro' | '80' | '100' | 'custom';

interface CreditSelection {
  posts: number;
  comments: number;
  ideas: number;
}

const presets: Record<PresetType, CreditSelection> = {
  starter: { posts: 20, comments: 50, ideas: 50 },
  pro: { posts: 80, comments: 100, ideas: 100 },
  '80': { posts: 80, comments: 80, ideas: 80 },
  '100': { posts: 100, comments: 100, ideas: 100 },
  custom: { posts: 10, comments: 10, ideas: 10 }
};

const PlanManagement: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('custom');
  const [credits, setCredits] = useState<CreditSelection>(presets.custom);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { processCreditPayment, isProcessing, isLoaded } = useCreditPayment();

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        const response = await api.getCurrentSubscriptionWithPricing();
        if (response.success) {
          setCurrentSubscription(response.data);
          const sub = response.data.subscription;
          
          // Set current credits
          const currentCredits = {
            posts: sub.limits.postsPerMonth,
            comments: sub.limits.commentsPerMonth,
            ideas: sub.limits.ideasPerMonth
          };
          setCredits(currentCredits);
          
          // Set currency
          setCurrency(sub.billing.currency);
          
          // Check if current selection matches any preset
          const matchingPreset = Object.entries(presets).find(([_, preset]) => 
            preset.posts === currentCredits.posts && 
            preset.comments === currentCredits.comments && 
            preset.ideas === currentCredits.ideas
          );
          
          if (matchingPreset) {
            setSelectedPreset(matchingPreset[0] as PresetType);
          } else {
            setSelectedPreset('custom');
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        toast.error('Failed to load current subscription');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentSubscription();
  }, []);

  const handlePresetClick = (preset: PresetType) => {
    setSelectedPreset(preset);
    setCredits(presets[preset]);
  };

  const handleSliderChange = (type: keyof CreditSelection, value: number[]) => {
    const newCredits = { ...credits, [type]: value[0] };
    setCredits(newCredits);
    
    // Check if this matches any preset
    const matchingPreset = Object.entries(presets).find(([_, preset]) => 
      preset.posts === newCredits.posts && 
      preset.comments === newCredits.comments && 
      preset.ideas === newCredits.ideas
    );
    
    if (matchingPreset) {
      setSelectedPreset(matchingPreset[0] as PresetType);
    } else {
      setSelectedPreset('custom');
    }
  };

  const handleUpdatePlan = async () => {
    if (!isLoaded) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    setIsUpdating(true);
    try {
      // Validate credits first
      const validation = await api.validateCredits(credits);
      if (!validation.success || !validation.data.isValid) {
        toast.error('Invalid credit selection. Please check your inputs.');
        return;
      }

      // Process payment with Razorpay for the new plan
      await processCreditPayment(credits, currency, 'monthly');
    } catch (error) {
      console.error('Plan update error:', error);
      toast.error('Failed to update plan. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (price: number): string => {
    if (currency === 'INR') {
      return `₹${Math.round(price)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your plan...</span>
        </div>
      </div>
    );
  }

  if (!currentSubscription) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Subscription</h2>
          <p className="text-muted-foreground mb-6">You don't have an active subscription to manage.</p>
          <Button asChild>
            <Link to="/">Choose a Plan</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Manage Your Plan
            </span>
          </h1>
          <p className="text-muted-foreground">
            Adjust your monthly credits to match your content creation needs
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Current Plan Info */}
          <Card className="p-6 mb-8 gradient-card border-primary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Current Plan</h3>
                <p className="text-muted-foreground">
                  {currentSubscription.planName} - {formatPrice(currentSubscription.pricing?.total || 0)}/month
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                Active
              </Badge>
            </div>
          </Card>

          {/* Currency Toggle */}
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant={currency === 'INR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrency('INR')}
              className="gap-2"
            >
              <IndianRupee className="h-4 w-4" />
              India (INR)
            </Button>
            <Button
              variant={currency === 'USD' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrency('USD')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              International (USD)
            </Button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={selectedPreset === 'starter' ? 'default' : 'outline'}
              onClick={() => handlePresetClick('starter')}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Starter
            </Button>
            <Button
              variant={selectedPreset === 'pro' ? 'default' : 'outline'}
              onClick={() => handlePresetClick('pro')}
              className="gap-2"
            >
              <Rocket className="h-4 w-4" />
              Pro
            </Button>
            <Button
              variant={selectedPreset === '80' ? 'default' : 'outline'}
              onClick={() => handlePresetClick('80')}
              className="gap-2"
            >
              <Star className="h-4 w-4" />
              80 Pack
            </Button>
            <Button
              variant={selectedPreset === '100' ? 'default' : 'outline'}
              onClick={() => handlePresetClick('100')}
              className="gap-2"
            >
              <Crown className="h-4 w-4" />
              100 Pack
            </Button>
            <Button
              variant={selectedPreset === 'custom' ? 'default' : 'outline'}
              onClick={() => handlePresetClick('custom')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Custom
            </Button>
          </div>

          {/* Credit Sliders */}
          <Card className="p-8 mb-8 gradient-card">
            <div className="space-y-8">
              {/* Posts Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">LinkedIn Posts</h3>
                  <Badge variant="secondary" className="text-sm">
                    {credits.posts} posts/month
                  </Badge>
                </div>
                <Slider
                  value={[credits.posts]}
                  onValueChange={(value) => handleSliderChange('posts', value)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10 posts</span>
                  <span>100 posts</span>
                </div>
              </div>

              {/* Comments Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">LinkedIn Comments</h3>
                  <Badge variant="secondary" className="text-sm">
                    {credits.comments} comments/month
                  </Badge>
                </div>
                <Slider
                  value={[credits.comments]}
                  onValueChange={(value) => handleSliderChange('comments', value)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10 comments</span>
                  <span>100 comments</span>
                </div>
              </div>

              {/* Ideas Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Content Ideas</h3>
                  <Badge variant="secondary" className="text-sm">
                    {credits.ideas} ideas/month
                  </Badge>
                </div>
                <Slider
                  value={[credits.ideas]}
                  onValueChange={(value) => handleSliderChange('ideas', value)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10 ideas</span>
                  <span>100 ideas</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Price Display */}
          <Card className="p-8 mb-8 gradient-card border-primary">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Updated Plan</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold text-primary">
                    {formatPrice(
                      (credits.posts * (currency === 'INR' ? 10 : 0.40)) +
                      (credits.comments * (currency === 'INR' ? 5 : 0.20)) +
                      (credits.ideas * (currency === 'INR' ? 5 : 0.20))
                    )}
                  </span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>You selected: {credits.posts} posts, {credits.comments} comments, {credits.ideas} ideas</p>
                <p className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Changes will take effect immediately
                </p>
              </div>

              <Button 
                onClick={handleUpdatePlan}
                disabled={isUpdating || isProcessing || !isLoaded}
                className="w-full mt-6 shadow-pulse hover-pulse"
                size="lg"
              >
                {isUpdating || isProcessing ? 'Processing Payment...' : !isLoaded ? 'Loading Payment System...' : 'Update Plan'}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-primary" />
                  Secure payment processing
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-primary" />
                  Instant activation
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-primary" />
                  Prorated billing
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;

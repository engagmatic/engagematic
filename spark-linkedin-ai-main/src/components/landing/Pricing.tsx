import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Globe, IndianRupee, Zap, Rocket } from "lucide-react";
import { useState } from "react";
import { WaitlistModal } from "@/components/WaitlistModal";
import { useNavigate } from "react-router-dom";

type Currency = 'INR' | 'USD';
type BillingPeriod = 'monthly' | 'yearly';

const plans = [
  {
    name: "Starter",
    icon: Zap,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    priceMonthly: { INR: 299, USD: 12 },
    priceYearly: { INR: 2499, USD: 120 },
    savingsText: "Save 2 months",
    description: "Perfect for creators & solo professionals",
    features: [
      "LinkedIn-trained AI models (not generic ChatGPT)",
      "Human-like posts that beat AI detectors",
      "75 LinkedIn post generations/month (~4/day)",
      "100 comment generations/month (~6/day)",
      "3 LinkedIn profile analyses/month",
      "15 curated AI personas + your onboarding persona",
      "Viral hook suggestions with every post",
      "Smart emoji placement & auto-formatting",
      "Copy & share directly to LinkedIn (1-click)",
      "Zero-edit content ready to post instantly",
      "Export & download posts with formatting",
      "Responsive support by email"
    ],
    cta: "Start Free Trial",
    popular: true,
    comingSoon: false,
    trial: "7-Day Free Trial"
  },
  {
    name: "Pro",
    icon: Rocket,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    priceMonthly: { INR: 799, USD: 24 },
    priceYearly: { INR: 6499, USD: 240 },
    savingsText: "Save 2 months",
    description: "Advanced features for power users & teams",
    features: [
      "Everything in Starter, plus:",
      "200 post generations/month (~10/day)",
      "400 comment generations/month (~17/day)",
      "10 LinkedIn profile analyses/month",
      "Advanced AI trained on 50K+ viral LinkedIn posts",
      "Deep personalization using your onboarding data",
      "Advanced persona customization (multi-persona)",
      "LinkedIn insights & analytics integration",
      "Trending hook generator (AI-powered)",
      "Export/share post packs",
      "Engagement Pulse Analytics dashboard",
      "Priority support (24-hour response)",
      "Early access to new features"
    ],
    cta: "Start Free Trial",
    popular: false,
    comingSoon: false,
    trial: "7-Day Free Trial"
  }
];

export const Pricing = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const navigate = useNavigate();

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingPeriod === 'monthly' 
      ? plan.priceMonthly[currency]
      : plan.priceYearly[currency];
    return price;
  };

  const getCurrencySymbol = () => currency === 'INR' ? '₹' : '$';

  const handlePlanClick = (plan: typeof plans[0]) => {
    // New users start free trial (redirect to registration)
    navigate("/auth/register");
  };

  return (
    <>
      <WaitlistModal
        open={waitlistModalOpen}
        onClose={() => setWaitlistModalOpen(false)}
        plan={selectedPlan}
        billingPeriod={billingPeriod}
        currency={currency}
      />
    <section id="pricing" className="py-12 sm:py-16 md:py-24 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Pulse Plan</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Start free, scale when you're ready. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Currency Toggle */}
        <div className="flex justify-center gap-2 mb-6">
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

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 p-1 bg-card/50 backdrop-blur-sm rounded-full border shadow-card">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('monthly')}
              className="rounded-full"
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('yearly')}
              className="rounded-full gap-2"
            >
              Yearly
              {billingPeriod === 'yearly' && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  Save 30%
                </Badge>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
            const PlanIcon = plan.icon;
            return (
              <Card 
                key={index}
                className={`p-8 relative hover-lift ${
                  plan.popular 
                    ? 'border-primary shadow-pulse gradient-card' 
                    : 'gradient-card border-border/50 opacity-75'
                } ${plan.comingSoon ? 'cursor-not-allowed' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 gradient-pulse text-white text-sm font-medium rounded-full shadow-pulse">
                    Most Popular
                  </div>
                )}

                {plan.comingSoon && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full border">
                    Coming Soon
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Plan Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                    <PlanIcon className={`w-8 h-8 ${plan.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">
                        {getCurrencySymbol()}{getPrice(plan)}
                      </span>
                      <span className="text-muted-foreground">
                        /{billingPeriod === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {plan.savingsText}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Best Value
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pb-4 border-b">
                    <Badge variant="secondary" className="text-xs">
                      {plan.trial}
                    </Badge>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Check className="w-3 h-3 text-primary" />
                      No credit card required
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Check className="w-3 h-3 text-primary" />
                      Cancel anytime
                    </p>
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'shadow-pulse hover-pulse' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handlePlanClick(plan)}
                  >
                    {plan.cta}
                  </Button>
                  
                  <div className="space-y-3 pt-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
    </>
  );
};

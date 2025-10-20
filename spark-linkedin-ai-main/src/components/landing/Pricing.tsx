import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Globe, IndianRupee, Zap, Rocket } from "lucide-react";
import { useState } from "react";

type Currency = 'INR' | 'USD';
type BillingPeriod = 'monthly' | 'yearly';

const plans = [
  {
    name: "Starter",
    icon: Zap,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    priceMonthly: { INR: 299, USD: 9 },
    priceYearly: { INR: 2499, USD: 89 },
    savingsText: "Save 2 months",
    description: "Best for creators & solo professionals",
    features: [
      "Up to 300 LinkedIn post generations/month",
      "Up to 300 comment generations/month",
      "Persona-powered AI post writing",
      "Viral hook suggestions with every post",
      "Basic persona setup and onboarding",
      "Responsive support by email",
      "Access on mobile & desktop devices"
    ],
    cta: "Start Free Trial",
    popular: true,
    trial: "7-Day Free Trial"
  },
  {
    name: "Pro",
    icon: Rocket,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    priceMonthly: { INR: 799, USD: 18 },
    priceYearly: { INR: 6499, USD: 159 },
    savingsText: "Save 2 months",
    description: "Advanced features for power users",
    features: [
      "Up to 2,000 post generations/month",
      "Up to 2,000 comment generations/month",
      "All Starter features included",
      "Advanced persona customization (multi-persona)",
      "Export/share post packs",
      "Engagement Pulse Analytics dashboard",
      "Priority support (24-hour response)",
      "Early access to new features"
    ],
    cta: "Join Waitlist",
    popular: false,
    comingSoon: true,
    trial: "7-Day Free Trial"
  }
];

export const Pricing = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingPeriod === 'monthly' 
      ? plan.priceMonthly[currency]
      : plan.priceYearly[currency];
    return price;
  };

  const getCurrencySymbol = () => currency === 'INR' ? '₹' : '$';

  return (
    <section id="pricing" className="py-24 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Pulse Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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

                  {!plan.comingSoon && (
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
                  )}
                  
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'shadow-pulse hover-pulse' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={plan.comingSoon}
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

        {/* Additional Information */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border">
            <h3 className="font-semibold text-lg mb-4">Plan Details</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                Usage quotas reset monthly; additional credits available if needed
              </p>
              <p className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                Transparent quotas, no hidden fees
              </p>
              <p className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                Upgrade/downgrade anytime—change plans as your needs grow
              </p>
              <p className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                Cancel anytime with no questions asked
              </p>
            </div>
          </Card>
        </div>

        {/* Pricing FAQ Preview */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Have questions about pricing?
          </p>
          <Button variant="outline" asChild>
            <a href="#faq">View FAQ</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

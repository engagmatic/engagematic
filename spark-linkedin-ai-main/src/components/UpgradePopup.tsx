import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Zap, Check, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType?: "posts" | "comments" | "ideas";
}

export const UpgradePopup = ({ open, onOpenChange, limitType = "posts" }: UpgradePopupProps) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleUpgrade = () => {
    setIsNavigating(true);
    navigate("/plan-management");
    onOpenChange(false);
  };

  const limitMessages = {
    posts: {
      title: "You've reached your post limit! 📝",
      description: "You've used all 3 free posts. Upgrade to continue creating engaging LinkedIn content.",
      icon: Zap,
    },
    comments: {
      title: "You've reached your comment limit! 💬",
      description: "You've used all 10 free comments. Upgrade to continue engaging with posts.",
      icon: Zap,
    },
    ideas: {
      title: "You've reached your idea limit! 💡",
      description: "You've used all 10 free ideas. Upgrade to get unlimited content inspiration.",
      icon: Zap,
    },
  };

  const message = limitMessages[limitType];
  const Icon = message.icon;

  const plans = [
    {
      name: "Starter",
      price: "₹199",
      period: "/month",
      features: ["15 posts/month", "30 comments/month", "Unlimited ideas/month", "All templates"],
      highlight: false,
    },
    {
      name: "Pro",
      price: "₹449",
      period: "/month",
      features: ["60 posts/month", "80 comments/month", "Unlimited ideas/month", "Priority support"],
      highlight: true,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl md:text-2xl font-bold">
            {message.title}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base pt-2">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  plan.highlight
                    ? "border-primary bg-primary/5 shadow-lg scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Popular
                    </Badge>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 text-sm text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-center text-blue-900 dark:text-blue-100">
              🎉 Unlock unlimited content creation and grow your LinkedIn presence!
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isNavigating}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                Upgrade Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


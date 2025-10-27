import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

interface CouponInputProps {
  amount: number;
  plan: 'starter' | 'pro' | string;
  onCouponApplied?: (couponData: any) => void;
  onCouponRemoved?: () => void;
  className?: string;
}

export const CouponInput = ({ 
  amount, 
  plan, 
  onCouponApplied, 
  onCouponRemoved,
  className = "" 
}: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const { toast } = useToast();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Enter a coupon code",
        description: "Please enter a valid coupon code",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await api.validateCoupon(couponCode.toUpperCase(), amount, plan);
      
      if (response.success) {
        setAppliedCoupon(response.data);
        onCouponApplied?.(response.data);
        toast({
          title: "Coupon Applied! 🎉",
          description: `You saved ${formatCurrency(response.data.discount)}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Invalid Coupon",
        description: error.message || "This coupon code is not valid",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    onCouponRemoved?.();
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your order",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (appliedCoupon) {
    return (
      <div className={`border-2 border-green-200 bg-green-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-800">Coupon Applied!</p>
              <p className="text-sm text-green-700">
                <Badge variant="outline" className="bg-white border-green-300 text-green-800 font-mono mr-2">
                  {appliedCoupon.coupon.code}
                </Badge>
                You saved {formatCurrency(appliedCoupon.discount)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-green-700 hover:text-green-900 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleApplyCoupon();
              }
            }}
            className="pl-10"
            disabled={isValidating}
          />
        </div>
        <Button
          onClick={handleApplyCoupon}
          disabled={isValidating || !couponCode.trim()}
          size="default"
          variant="outline"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Have a coupon code? Enter it here to save on your purchase!
      </p>
    </div>
  );
};

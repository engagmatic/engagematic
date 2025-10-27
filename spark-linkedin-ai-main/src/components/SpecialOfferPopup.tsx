import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, X, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpecialOfferPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecialOfferPopup = ({ isOpen, onClose }: SpecialOfferPopupProps) => {
  const { toast } = useToast();
  const couponCode = "UKD141A";
  const discountPercentage = "10%";
  const successRate = "90%";
  const successMetric = "boost engagement in their first week";

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      toast({
        title: "Coupon Copied! 🎉",
        description: `"${couponCode}" has been copied to your clipboard.`,
      });
    } catch (error) {
      console.error("Failed to copy coupon:", error);
      toast({
        title: "Copy Failed",
        description: "Could not copy coupon to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content */}
        <div className="p-8 pb-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <Briefcase className="h-12 w-12 text-amber-600" />
          </div>

          {/* Heading */}
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            WAIT! WE HAVE A SPECIAL OFFER
          </h2>

          {/* Coupon Info */}
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-3">
              Use coupon{" "}
              <Badge className="bg-purple-100 text-purple-800 font-semibold text-base px-4 py-1.5 rounded-md">
                {couponCode}
              </Badge>{" "}
              for a {discountPercentage} discount
            </p>
          </div>

          {/* Success Rate */}
          <p className="text-center text-sm text-gray-500 mb-6">
            {successRate} of LinkedIn Pulse users {successMetric}.
          </p>

          {/* Copy Button */}
          <Button
            onClick={handleCopyCoupon}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-md flex items-center justify-center gap-2 font-medium"
          >
            <Copy className="h-4 w-4" />
            Copy to clipboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


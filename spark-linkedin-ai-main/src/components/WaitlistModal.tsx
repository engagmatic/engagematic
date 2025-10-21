import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/services/api";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  plan: string;
  billingPeriod?: "monthly" | "yearly";
  currency?: "USD" | "INR";
}

export const WaitlistModal = ({
  open,
  onClose,
  plan,
  billingPeriod = "monthly",
  currency = "USD",
}: WaitlistModalProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.joinWaitlist({
        email,
        name: name || undefined,
        linkedinUrl: linkedinUrl || undefined,
        plan: plan.toLowerCase(),
        billingPeriod,
        currency,
      });

      if (response.success) {
        setIsSuccess(true);
        setPosition(response.data?.position || null);
        toast({
          title: "🎉 You're on the waitlist!",
          description: response.message,
        });
      }
    } catch (error: any) {
      console.error("Waitlist join error:", error);
      toast({
        title: "Oops! Something went wrong",
        description:
          error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const shareText = `I just joined the waitlist for ${plan} plan on LinkedInPulse - the AI-powered LinkedIn content toolkit! 🚀`;
    const shareUrl = "https://linkedinpulse.ai?ref=waitlist";

    if (navigator.share) {
      navigator
        .share({
          title: "Join LinkedInPulse Waitlist",
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {
          // Fallback to copying link
          navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          toast({
            title: "Link copied!",
            description: "Share with your network to move up the waitlist",
          });
        });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Link copied!",
        description: "Share with your network to move up the waitlist",
      });
    }
  };

  const handleClose = () => {
    setEmail("");
    setName("");
    setLinkedinUrl("");
    setIsSuccess(false);
    setPosition(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">
                Join the Waitlist for {plan}
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Be the first to know when premium plans launch. We'll send you
                exclusive early access.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile (Optional)</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Join Waitlist
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                No spam. Unsubscribe anytime. We respect your privacy.
              </p>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold">You're In! 🎉</h3>
              <p className="text-muted-foreground">
                We'll notify you as soon as the {plan} plan is available.
              </p>
            </div>

            {position && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your position in line
                </p>
                <p className="text-3xl font-bold text-primary">#{position}</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm font-medium">Want to move up faster?</p>
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share with Friends
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                While you wait, try our Free Trial
              </p>
              <Button
                onClick={() => {
                  handleClose();
                  window.location.href = "/auth/register";
                }}
                className="w-full"
              >
                Start Free Trial Now
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


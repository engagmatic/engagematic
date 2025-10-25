import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Sparkles, Check, Loader2, Zap, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface PremiumWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string; // Track where the user came from (e.g., 'post-generator', 'dashboard', 'pricing')
  planInterest?: string; // Which plan they were interested in
}

export function PremiumWaitlistModal({ 
  isOpen, 
  onClose, 
  source = 'general',
  planInterest = 'Pro Plan' 
}: PremiumWaitlistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState("");
  const [preferredPlan, setPreferredPlan] = useState(planInterest);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Pre-fill with user data if logged in
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast({
        title: "Missing Information",
        description: "Please provide at least your name and email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/waitlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          role,
          useCase,
          preferredPlan,
          source,
          interestedFeatures: ['Premium Plans', preferredPlan],
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: "🎉 You're on the list!",
          description: "We'll notify you as soon as premium plans launch!",
        });
        
        // Auto-close after showing success
        setTimeout(() => {
          onClose();
          // Reset after closing
          setTimeout(() => {
            setIsSuccess(false);
            resetForm();
          }, 300);
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setRole("");
    setUseCase("");
    setPreferredPlan("Pro Plan");
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">You're In! 🎉</h3>
            <p className="text-gray-600 mb-4">
              Welcome to the exclusive premium waitlist!
            </p>
            <div className="space-y-2 text-sm text-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 justify-center">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">What happens next?</span>
              </div>
              <ul className="text-left space-y-2 mt-3">
                <li className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>You'll get <strong>early access</strong> when we launch</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Exclusive launch pricing</strong> (up to 40% off)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Priority support</strong> and feature requests</span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Check your email for confirmation 📧
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-2xl">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl sm:text-3xl">
            Join the Premium Waitlist
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Be the first to access premium features with exclusive early-bird pricing
          </DialogDescription>
        </DialogHeader>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-xl p-4 my-4">
          <div className="text-center mb-3">
            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-300">
              🎁 EARLY BIRD EXCLUSIVE
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg">
              <Zap className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">First Access</div>
                <div className="text-xs text-gray-600">Before public launch</div>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">40% Discount</div>
                <div className="text-xs text-gray-600">Exclusive pricing</div>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg">
              <Crown className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">VIP Support</div>
                <div className="text-xs text-gray-600">Priority assistance</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Email (Required) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="mb-2 flex items-center gap-1">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-2"
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 flex items-center gap-1">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2"
              />
            </div>
          </div>

          {/* Phone (Optional) */}
          <div>
            <Label htmlFor="phone" className="mb-2">
              Phone Number <span className="text-xs text-gray-500">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company" className="mb-2">
                Company <span className="text-xs text-gray-500">(optional)</span>
              </Label>
              <Input
                id="company"
                placeholder="Your Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role" className="mb-2">
                Role <span className="text-xs text-gray-500">(optional)</span>
              </Label>
              <Input
                id="role"
                placeholder="e.g., Marketing Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>

          {/* Preferred Plan */}
          <div>
            <Label htmlFor="preferredPlan" className="mb-2">
              Which plan interests you most?
            </Label>
            <Select value={preferredPlan} onValueChange={setPreferredPlan}>
              <SelectTrigger className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pro Plan">💼 Pro Plan - For professionals</SelectItem>
                <SelectItem value="Business Plan">🚀 Business Plan - For teams</SelectItem>
                <SelectItem value="Enterprise Plan">🏢 Enterprise - For organizations</SelectItem>
                <SelectItem value="Not sure yet">🤔 Not sure yet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Use Case */}
          <div>
            <Label htmlFor="useCase" className="mb-2">
              What would you use premium features for? <span className="text-xs text-gray-500">(optional)</span>
            </Label>
            <Textarea
              id="useCase"
              placeholder="e.g., Personal branding, lead generation, thought leadership..."
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {useCase.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-6 text-base shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Joining Waitlist...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Join Premium Waitlist
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By joining, you'll receive updates about premium features and launch. No spam, ever. 🙏
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}


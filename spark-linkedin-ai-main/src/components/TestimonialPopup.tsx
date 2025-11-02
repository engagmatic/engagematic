import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, X, Heart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestimonialPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType?: "post" | "comment" | "idea";
}

export const TestimonialPopup = ({ 
  open, 
  onOpenChange, 
  contentType = "post" 
}: TestimonialPopupProps) => {
  const [testimonial, setTestimonial] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const contentTypeMessages = {
    post: {
      title: "Great job on your first post! 🎉",
      description: "We'd love to hear about your experience. Your feedback helps us improve!",
      placeholder: "Tell us what you think about generating your LinkedIn post...",
    },
    comment: {
      title: "Awesome! You've generated your first comment! 💬",
      description: "How was your experience? We value your feedback!",
      placeholder: "Share your thoughts on the comment generation...",
    },
    idea: {
      title: "Fantastic! You've generated your first idea! 💡",
      description: "What do you think? Your feedback matters to us!",
      placeholder: "Let us know how you liked the idea generation...",
    },
  };

  const message = contentTypeMessages[contentType];

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please rate us",
        description: "Select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!testimonial.trim()) {
      toast({
        title: "Feedback required",
        description: "Please share your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/testimonials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: testimonial.trim(),
          rating,
          type: contentType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Thank you! 🙏",
          description: "Your feedback has been submitted successfully.",
        });
        // Store in localStorage to prevent showing again
        localStorage.setItem(`testimonial_submitted_${contentType}`, "true");
        onOpenChange(false);
        setTestimonial("");
        setRating(0);
      } else {
        throw new Error(result.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Testimonial submission error:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Could not submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Store in localStorage to prevent showing again
    localStorage.setItem(`testimonial_submitted_${contentType}`, "true");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl md:text-2xl font-bold">
            {message.title}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base pt-2">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Star Rating */}
          <div>
            <Label className="text-sm font-medium mb-3 block text-center">
              How would you rate your experience?
            </Label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 md:h-10 md:w-10 transition-colors ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Testimonial Input */}
          <div>
            <Label htmlFor="testimonial" className="text-sm font-medium mb-2 block">
              Your Feedback
            </Label>
            <Textarea
              id="testimonial"
              placeholder={message.placeholder}
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-900 dark:text-blue-100 text-center">
              💡 Your feedback helps us improve and helps other users discover LinkedInPulse!
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !testimonial.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

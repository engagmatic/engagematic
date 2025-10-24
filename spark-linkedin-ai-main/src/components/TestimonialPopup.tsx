import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}`;

interface TestimonialPopupProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredBy: 'first_post' | 'first_comment' | 'profile_analysis';
}

export function TestimonialPopup({ isOpen, onClose, triggeredBy }: TestimonialPopupProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset form when opened
      setRating(0);
      setComment('');
      setDisplayName('');
      setJobTitle('');
      setCompany('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    if (comment.length < 10) {
      toast({
        title: 'Comment too short',
        description: 'Please write at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/testimonials/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment,
          displayName: displayName || undefined,
          jobTitle: jobTitle || undefined,
          company: company || undefined,
          triggeredBy,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '🎉 Thank you for your feedback!',
          description: 'Your testimonial is under review and will be published soon.',
        });
        onClose();
        
        // Mark as submitted in localStorage
        localStorage.setItem('testimonialSubmitted', 'true');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error.message || 'Failed to submit testimonial',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMessage = () => {
    switch (triggeredBy) {
      case 'first_post':
        return 'Congratulations on creating your first LinkedIn post! How was your experience?';
      case 'first_comment':
        return 'Great job on generating your first comment! We\'d love to hear your thoughts!';
      case 'profile_analysis':
        return 'You just analyzed a LinkedIn profile! How did LinkedInPulse help you?';
      default:
        return 'How has your experience been with LinkedInPulse?';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <DialogTitle>Share Your Experience</DialogTitle>
            </div>
          </div>
          <DialogDescription>
            {getMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating */}
          <div>
            <Label className="mb-2 block">How would you rate LinkedInPulse?</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Needs improvement'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="mb-2 block">
              Your feedback <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience with LinkedInPulse..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 characters (minimum 10)
            </p>
          </div>

          {/* Optional: Display Name */}
          <div>
            <Label htmlFor="displayName" className="mb-2 block">
              Display name (optional)
            </Label>
            <Input
              id="displayName"
              placeholder="How should we display your name?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Optional: Job Title & Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="jobTitle" className="mb-2 block">
                Job title (optional)
              </Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Marketing Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company" className="mb-2 block">
                Company (optional)
              </Label>
              <Input
                id="company"
                placeholder="e.g., ABC Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Maybe Later
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !rating || comment.length < 10}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


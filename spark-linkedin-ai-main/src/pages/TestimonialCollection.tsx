import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, MessageCircle, CheckCircle, Loader2, Sparkles, Users, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import apiClient from "@/services/api";

const TestimonialCollection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    comment: "",
    jobTitle: "",
    company: "",
    displayName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.rating || !formData.comment) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.comment.length < 10) {
      toast({
        title: "Comment Too Short",
        description: "Please write at least 10 characters for your testimonial.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.collectTestimonial(formData);
      
      if (response.success) {
        setIsSubmitted(true);
        toast({
          title: "Thank You! 🎉",
          description: "Your testimonial has been submitted successfully.",
        });
      } else {
        throw new Error(response.message || "Failed to submit testimonial");
      }
    } catch (error) {
      console.error("Testimonial submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit testimonial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <SEO 
          title="Testimonial Submitted | Engagematic"
          description="Thank you for sharing your experience with Engagematic!"
        />
        
        <Card className="max-w-md w-full p-8 text-center shadow-2xl">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You! 🎉
            </h1>
            <p className="text-gray-600">
              Your testimonial has been submitted successfully. We'll review it and may feature it on our website.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Back to Homepage
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  rating: 0,
                  comment: "",
                  jobTitle: "",
                  company: "",
                  displayName: "",
                });
              }}
              className="w-full"
            >
              Submit Another Testimonial
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <SEO 
        title="Share Your Experience | Engagematic Testimonials"
        description="Share your success story with Engagematic and help others discover the power of AI-driven LinkedIn content creation."
        keywords="testimonial, review, feedback, Engagematic, success story"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-gray-700">Share Your Success</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Share Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Success Story
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help others discover the power of Engagematic by sharing your experience. 
            Your testimonial could inspire someone to transform their LinkedIn presence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <Card className="p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Your Experience
              </h2>
              <p className="text-gray-600 text-sm">
                Tell us how Engagematic has helped you grow your LinkedIn presence.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoveredStar || formData.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {formData.rating > 0 && `${formData.rating}/5`}
                  </span>
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Job Title
                </label>
                <Input
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Marketing Manager, CEO, Developer"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Company
                </label>
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Display Name (Optional)
                </label>
                <Input
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="How you'd like to appear publicly"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use your full name
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Testimonial *
                </label>
                <Textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Share your experience with Engagematic. How has it helped you? What results have you seen? Be specific and honest!"
                  rows={6}
                  maxLength={1000}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Minimum 10 characters
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.comment.length}/1000
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Submit Testimonial
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Right Column - Info & Benefits */}
          <div className="space-y-6">
            {/* Why Share */}
            <Card className="p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                Why Share Your Story?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Help Others Succeed</h4>
                    <p className="text-sm text-gray-600">
                      Your experience can guide others to LinkedIn success
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Build Your Brand</h4>
                    <p className="text-sm text-gray-600">
                      Showcase your expertise and thought leadership
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Inspire Innovation</h4>
                    <p className="text-sm text-gray-600">
                      Help us improve Engagematic for everyone
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* What We're Looking For */}
            <Card className="p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-600" />
                What Makes a Great Testimonial?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Specific results and metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Personal experience and journey</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Honest and authentic feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Clear value proposition</span>
                </div>
              </div>
            </Card>

            {/* Privacy Note */}
            <Card className="p-6 shadow-xl bg-blue-50 border-blue-200">
              <h3 className="text-lg font-bold mb-2 text-blue-900">
                🔒 Privacy & Usage
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• We'll review your testimonial before publishing</p>
                <p>• Only approved testimonials appear on our website</p>
                <p>• We may edit for length or clarity (with permission)</p>
                <p>• Your email is never shared publicly</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCollection;

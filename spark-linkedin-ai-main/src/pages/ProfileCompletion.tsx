import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Linkedin, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

interface ProfileStatus {
  isComplete: boolean;
  status: {
    hasBasicProfile: boolean;
    hasPersona: boolean;
    missingFields: string[];
    personaCount: number;
  };
}

interface ProfileRequirements {
  requirements: {
    basicProfile: {
      name: { required: boolean; description: string; completed: boolean };
      email: { required: boolean; description: string; completed: boolean };
      linkedinUrl: { required: boolean; description: string; completed: boolean };
    };
    persona: {
      required: boolean;
      description: string;
      completed: boolean;
      count: number;
    };
  };
  isComplete: boolean;
  nextStep: string | null;
}

const ProfileCompletion: React.FC = () => {
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
  const [requirements, setRequirements] = useState<ProfileRequirements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    linkedinUrl: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const [statusResponse, requirementsResponse] = await Promise.all([
        api.getProfileStatus(),
        api.getProfileRequirements(),
      ]);

      if (statusResponse.success) {
        setProfileStatus(statusResponse.data);
      }

      if (requirementsResponse.success) {
        setRequirements(requirementsResponse.data);
        // Pre-fill form with existing data if available
        if (requirementsResponse.data.requirements.basicProfile.name.completed) {
          setFormData(prev => ({ ...prev, name: "Existing name" }));
        }
        if (requirementsResponse.data.requirements.basicProfile.linkedinUrl.completed) {
          setFormData(prev => ({ ...prev, linkedinUrl: "Existing LinkedIn URL" }));
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.linkedinUrl.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.completeBasicProfile(formData);
      
      if (response.success) {
        toast.success("Profile updated successfully!");
        await fetchProfileData(); // Refresh data
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (requirements?.isComplete) {
      // Profile is complete, redirect to payment
      navigate("/pricing");
    } else if (requirements?.nextStep?.includes("persona")) {
      // Need to create persona
      navigate("/personas");
    } else {
      // Need to complete basic profile
      toast.info("Please complete your profile information first");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile information...</span>
        </div>
      </div>
    );
  }

  const completionPercentage = requirements ? 
    Math.round((Object.values(requirements.requirements.basicProfile).filter(field => field.completed).length + 
                (requirements.requirements.persona.completed ? 1 : 0)) / 4 * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your Profile
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Set up your profile to get started with LinkedInPulse
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Profile Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Requirements */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Requirements
            </h2>
            
            <div className="space-y-4">
              {/* Basic Profile */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
                <div className="space-y-2">
                  {requirements && Object.entries(requirements.requirements.basicProfile).map(([key, field]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {field.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                        )}
                        <span className="text-sm capitalize">{key}</span>
                      </div>
                      <Badge variant={field.completed ? "default" : "secondary"}>
                        {field.completed ? "Complete" : "Required"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Persona */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">AI Persona</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {requirements?.requirements.persona.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                    )}
                    <span className="text-sm">AI Persona ({requirements?.requirements.persona.count || 0})</span>
                  </div>
                  <Badge variant={requirements?.requirements.persona.completed ? "default" : "secondary"}>
                    {requirements?.requirements.persona.completed ? "Complete" : "Required"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Linkedin className="h-5 w-5 mr-2" />
              Complete Your Profile
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="linkedinUrl">LinkedIn Profile URL *</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>

            {/* Continue Button */}
            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={handleContinue}
                className="w-full"
                disabled={!requirements?.isComplete}
              >
                {requirements?.isComplete ? (
                  <>
                    Continue to Payment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  `Complete ${requirements?.nextStep || "profile"} to continue`
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team for assistance with profile setup.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;

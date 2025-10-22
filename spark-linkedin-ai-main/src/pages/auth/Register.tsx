import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Activity, Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, Check, User, Briefcase, Target, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLinkedInProfile } from "../../hooks/useLinkedInProfile";
import { WRITING_STYLES, TONE_OPTIONS, INDUSTRIES, EXPERIENCE_LEVELS, CONTENT_TYPES } from "@/constants/personaOptions";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2: Professional Info
    jobTitle: "",
    company: "",
    industry: "",
    experience: "",
    // Step 3: Persona Creation
    personaName: "",
    writingStyle: "",
    tone: "",
    expertise: "",
    targetAudience: "",
    goals: "",
    // Step 4: Preferences
    contentTypes: [],
    postingFrequency: "",
    linkedinUrl: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, error, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { analyzeProfile, isAnalyzing, profileData } = useLinkedInProfile();

  const steps = [
    { id: 1, title: "Account Setup", description: "Create your account" },
    { id: 2, title: "Professional Info", description: "Tell us about your role" },
    { id: 3, title: "AI Persona", description: "Build your content persona" },
    { id: 4, title: "Preferences", description: "Customize your experience" }
  ];

  const postingFrequencies = [
    "Daily", "3-4 times per week", "2-3 times per week", "Weekly", "Bi-weekly"
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) clearError();
  };

  const handleContentTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(t => t !== type)
        : [...prev.contentTypes, type]
    }));
  };

  const handleLinkedInAnalysis = async () => {
    if (!formData.linkedinUrl.trim()) {
      toast({
        title: "LinkedIn URL required",
        description: "Please enter your LinkedIn profile URL first",
        variant: "destructive",
      });
      return;
    }

    // Skip LinkedIn analysis during registration - it requires authentication
    // This is optional and can be done after account creation
    toast({
      title: "LinkedIn URL saved! ✓",
      description: "We'll analyze your profile after you create your account. Complete registration to continue.",
    });
    
    // Just save the URL for now
    // The analysis can be done after login from the dashboard or profile settings
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          toast({
            title: "Missing information",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password mismatch",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return false;
        }
        if (formData.password.length < 6) {
          toast({
            title: "Password too short",
            description: "Password must be at least 6 characters",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.jobTitle || !formData.company || !formData.industry || !formData.experience) {
          toast({
            title: "Missing information",
            description: "Please fill in all professional details",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 3:
        if (!formData.personaName || !formData.writingStyle || !formData.tone || !formData.expertise || !formData.targetAudience) {
          toast({
            title: "Missing information",
            description: "Please complete your AI persona setup",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 4:
        return true; // Step 4 is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      // Include persona data
      persona: {
        name: formData.personaName,
        writingStyle: formData.writingStyle,
        tone: formData.tone,
        expertise: formData.expertise,
        targetAudience: formData.targetAudience,
        goals: formData.goals,
        contentTypes: formData.contentTypes,
        postingFrequency: formData.postingFrequency
      },
      // Include professional info
      profile: {
        jobTitle: formData.jobTitle,
        company: formData.company,
        industry: formData.industry,
        experience: formData.experience,
        linkedinUrl: formData.linkedinUrl
      }
    });
    
    if (result.success) {
      toast({
        title: "Welcome to LinkedInPulse! 🎉",
        description: "Your account and AI persona have been created successfully",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Registration failed",
        description: result.error || "Failed to create account",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Activity className="h-7 w-7 text-white animate-pulse" />
            </div>
            <span className="text-2xl font-bold">LinkedInPulse</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground">Let's build your AI-powered LinkedIn presence</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="p-8 shadow-lg border-2">
          {/* Step 1: Account Setup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Let's get started</h2>
                <p className="text-muted-foreground">Create your LinkedInPulse account</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Tell us about your role</h2>
                <p className="text-muted-foreground">Help us personalize your LinkedIn content</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    type="text"
                    placeholder="e.g., Marketing Manager, Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    placeholder="e.g., Google, Microsoft, Your Startup"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: AI Persona */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Build your AI persona</h2>
                <p className="text-muted-foreground">Create an AI that writes content in your unique voice</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personaName">Persona Name</Label>
                  <Input
                    id="personaName"
                    name="personaName"
                    type="text"
                    placeholder="e.g., Professional Sarah, Tech Expert Mike"
                    value={formData.personaName}
                    onChange={(e) => handleChange('personaName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="writingStyle">Writing Style</Label>
                  <Select value={formData.writingStyle} onValueChange={(value) => handleChange('writingStyle', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How do you like to write?" />
                    </SelectTrigger>
                    <SelectContent>
                      {WRITING_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div className="flex items-center gap-2">
                            <span>{style.icon}</span>
                            <div>
                              <div className="font-medium">{style.label}</div>
                              <div className="text-xs text-muted-foreground">{style.desc}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => handleChange('tone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="What tone should your content have?" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          <div className="flex items-center gap-2">
                            <span>{tone.icon}</span>
                            <div>
                              <div className="font-medium">{tone.label}</div>
                              <div className="text-xs text-muted-foreground">{tone.desc}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">Areas of Expertise</Label>
                  <Textarea
                    id="expertise"
                    name="expertise"
                    placeholder="e.g., Digital marketing, Leadership, Product management, Data analysis..."
                    value={formData.expertise}
                    onChange={(e) => handleChange('expertise', e.target.value)}
                    required
                    disabled={isLoading}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    name="targetAudience"
                    placeholder="e.g., Marketing professionals, Startup founders, Tech enthusiasts..."
                    value={formData.targetAudience}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                    required
                    disabled={isLoading}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Content Goals (Optional)</Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    placeholder="e.g., Build thought leadership, Generate leads, Share industry insights..."
                    value={formData.goals}
                    onChange={(e) => handleChange('goals', e.target.value)}
                    disabled={isLoading}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Customize your experience</h2>
                <p className="text-muted-foreground">Fine-tune your LinkedInPulse settings</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Content Types You Want to Create</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTENT_TYPES.map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={formData.contentTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleContentTypeToggle(type)}
                        disabled={isLoading}
                        className="justify-start"
                      >
                        {formData.contentTypes.includes(type) && <Check className="h-3 w-3 mr-2" />}
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postingFrequency">How often do you want to post?</Label>
                  <Select value={formData.postingFrequency} onValueChange={(value) => handleChange('postingFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select posting frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {postingFrequencies.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>
                          {frequency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile URL (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLinkedInAnalysis}
                      disabled={!formData.linkedinUrl.trim() || isLoading}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Save URL
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Optional: We can analyze your profile after registration to enhance your persona
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="gap-2 shadow-pulse hover-pulse"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Complete Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
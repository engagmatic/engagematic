import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Briefcase, 
  Target, 
  Sparkles,
  Upload,
  TrendingUp,
  Building2,
  Rocket,
  Crown,
  Heart,
  Music,
  Film,
  Code,
  Palette,
  Gamepad2,
  Dumbbell,
  Globe,
  Zap,
  Lightbulb,
  Bookmark,
  MessageSquare,
  Calendar,
  X
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WRITING_STYLES, TONE_OPTIONS, INDUSTRIES, EXPERIENCE_LEVELS } from "@/constants/personaOptions";

const GOALS = [
  { id: 'sales', label: 'Sales & Lead Generation', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
  { id: 'marketing', label: 'Marketing & Growth', icon: Rocket, color: 'bg-purple-100 text-purple-700' },
  { id: 'personal', label: 'Personal Branding', icon: Crown, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'company', label: 'Company Account', icon: Building2, color: 'bg-green-100 text-green-700' },
  { id: 'founder', label: 'Founder/CEO', icon: Rocket, color: 'bg-pink-100 text-pink-700' },
  { id: 'startup', label: 'Startup Team', icon: Sparkles, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'agency', label: 'Agency/Client Work', icon: Briefcase, color: 'bg-orange-100 text-orange-700' },
];

const TOPICS = [
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'tech', label: 'Technology', icon: Code },
  { id: 'marketing', label: 'Marketing', icon: Target },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'startup', label: 'Startups', icon: Rocket },
  { id: 'leadership', label: 'Leadership', icon: Crown },
  { id: 'health', label: 'Health & Wellness', icon: Heart },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'travel', label: 'Travel', icon: Globe },
  { id: 'food', label: 'Food & Cooking', icon: Heart },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'sports', label: 'Sports', icon: Gamepad2 },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
  { id: 'education', label: 'Education', icon: Bookmark },
];

const CONTENT_TYPES = ["Posts", "Comments", "Ideas", "Newsletters", "Polls"];
const POST_FREQUENCIES = ["Daily", "3-5x/week", "Weekly", "Occasionally"];
const TOPIC_OPTIONS = [
  "Leadership", "Technology", "Marketing", "Career Growth", "Sales", "Personal Branding", "HR/Recruitment", "Startups",
  "Wellness", "Education", "Productivity", "Networking", "Remote Work", "Innovation", "Other"
];

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
    personaName: "",
    writingStyle: "",
    tone: "",
    expertise: "",
    targetAudience: "",
    jobTitle: "",
    company: "",
    industry: "",
    experience: "",
    goal: "",
    contentTypes: [],
    postingFrequency: "",
    topics: [],
    linkedinUrl: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const { register, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { id: 1, title: "Account Setup", icon: User },
    { id: 2, title: "Your Goals", icon: Target },
    { id: 3, title: "AI Persona", icon: Sparkles },
    { id: 4, title: "Preferences", icon: Heart }
  ];

  // Check for pre-filled data from free post generator
  useEffect(() => {
    const prefillData = sessionStorage.getItem("registration_prefill");
    if (prefillData) {
      try {
        const data = JSON.parse(prefillData);
        // Map persona from free generator to form data
        if (data.persona) {
          const personaMap: Record<string, any> = {
            founder: { name: "Startup Founder", writingStyle: "storyteller", tone: "confident", expertise: "Startups, Entrepreneurship, Business Growth" },
            marketer: { name: "Digital Marketer", writingStyle: "conversational", tone: "enthusiastic", expertise: "Digital Marketing, SEO, Growth Hacking" },
            recruiter: { name: "HR Leader", writingStyle: "conversational", tone: "empathetic", expertise: "Talent Acquisition, HR, Recruitment" },
            consultant: { name: "Management Consultant", writingStyle: "analytical", tone: "strategic", expertise: "Strategy, Business Consulting, Transformation" },
            "sales-pro": { name: "Sales Leader", writingStyle: "conversational", tone: "enthusiastic", expertise: "Sales, Business Development, Revenue Growth" },
            student: { name: "Student", writingStyle: "personal", tone: "authentic", expertise: "Learning, Career Development, Education" },
            creator: { name: "Content Creator", writingStyle: "storyteller", tone: "creative", expertise: "Content Creation, Storytelling, Personal Branding" },
          };
          
          const personaInfo = personaMap[data.persona] || personaMap.founder;
          setFormData(prev => ({
            ...prev,
            personaName: personaInfo.name,
            writingStyle: personaInfo.writingStyle,
            tone: personaInfo.tone,
            expertise: personaInfo.expertise,
            targetAudience: data.audience || "",
            primaryGoal: data.goal || "",
          }));
          
          // Show toast about pre-filled data
          toast({
            title: "Welcome back! ✨",
            description: "We've pre-filled your information from your free post. Just complete the remaining steps!",
          });
        }
      } catch (error) {
        console.error("Failed to parse prefill data", error);
      }
    }
  }, [toast]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
    if (error) clearError();
  };

  const handleTopicToggle = (topicId: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topicId)
        ? prev.topics.filter(t => t !== topicId)
        : [...prev.topics, topicId]
    }));
  };

  const handleContentTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(t => t !== type)
        : [...prev.contentTypes, type]
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;
      case 2:
        if (!formData.goal) newErrors.goal = "Please select your primary goal";
        break;
      case 3:
        if (!formData.personaName) newErrors.personaName = "Persona name is required";
        if (!formData.writingStyle) newErrors.writingStyle = "Writing style is required";
        if (!formData.tone) newErrors.tone = "Tone is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // If on last step (4), submit instead of going to next step
      if (currentStep === 4) {
        handleSubmit();
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 4));
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        interests: formData.topics || [], // Send topics as interests
        persona: {
          name: formData.personaName,
          style: formData.writingStyle,
          tone: formData.tone,
          expertise: formData.expertise,
          targetAudience: formData.targetAudience,
          contentTypes: formData.contentTypes || [],
        },
      });
      
      if (result.success) {
        toast({
          title: "Welcome to LinkedInPulse! 🎉",
          description: "Your account and AI persona have been created successfully. Complete your profile in the dashboard.",
        });
        
        const returnTo = location.state?.returnTo || '/dashboard';
        navigate(returnTo);
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / 4) * 100;
  const error = null; // From useAuth

  const allRequired = [
    formData.name,
    formData.email,
    formData.password,
    formData.goal,
    formData.personaName,
    formData.writingStyle,
    formData.tone,
  ].every(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Activity className="h-7 w-7 text-white animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LinkedInPulse
            </span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Create your AI-powered LinkedIn presence
          </h1>
          <p className="text-muted-foreground">Get started in just 10 seconds – full setup awaits in your dashboard</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center flex-1 ${
                    index === steps.length - 1 ? 'flex-none' : ''
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
                        : isCurrent
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <span className={`text-xs mt-2 hidden sm:block text-center ${
                      isCurrent ? 'font-medium text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                      isCompleted ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content Card */}
        <Card className="p-6 md:p-8 shadow-2xl border-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Step 1: Account Setup */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Let's get started</h2>
                <p className="text-muted-foreground">Create your account in seconds</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={errors.password ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Your password is encrypted and secure. We'll never store it in plain text.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Your Goals */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">What's your primary goal?</h2>
                <p className="text-muted-foreground">Help us personalize your experience – more details later</p>
              </div>

              {/* Goal Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Select your goal</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GOALS.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleChange('goal', goal.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          formData.goal === goal.id
                            ? 'border-primary bg-primary/10 shadow-md scale-105'
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        }`}
                        disabled={isLoading}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${goal.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{goal.label}</p>
                          </div>
                          {formData.goal === goal.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.goal && <p className="text-xs text-red-500 mt-1">{errors.goal}</p>}
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  You'll add job details, industry, and experience in your dashboard after signup.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: AI Persona (Minimal) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Build your AI persona</h2>
                <p className="text-muted-foreground">Quick basics now – refine expertise and audience later</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Quick Setup
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Choose a name and style to get started. Full customization in dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personaName" className="text-sm font-medium">Persona Name</Label>
                  <Input
                    id="personaName"
                    type="text"
                    placeholder="e.g., Professional Sarah"
                    value={formData.personaName}
                    onChange={(e) => handleChange('personaName', e.target.value)}
                    className={errors.personaName ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.personaName && <p className="text-xs text-red-500">{errors.personaName}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="writingStyle" className="text-sm font-medium">Writing Style</Label>
                    <select
                      id="writingStyle"
                      value={formData.writingStyle}
                      onChange={(e) => handleChange('writingStyle', e.target.value)}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
                        errors.writingStyle ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select style</option>
                      {WRITING_STYLES.map((style) => (
                        <option key={style.value} value={style.value}>{style.label}</option>
                      ))}
                    </select>
                    {errors.writingStyle && <p className="text-xs text-red-500">{errors.writingStyle}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone" className="text-sm font-medium">Tone</Label>
                    <select
                      id="tone"
                      value={formData.tone}
                      onChange={(e) => handleChange('tone', e.target.value)}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
                        errors.tone ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select tone</option>
                      {TONE_OPTIONS.map((tone) => (
                        <option key={tone.value} value={tone.value}>{tone.label}</option>
                      ))}
                    </select>
                    {errors.tone && <p className="text-xs text-red-500">{errors.tone}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <Lightbulb className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-pink-900 dark:text-pink-100">
                  Add expertise areas and target audience in your dashboard to supercharge your persona.
                </p>
              </div>
            </div>
          )}


          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
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

            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {currentStep === 4 ? "Creating account..." : "Loading..."}
                </>
              ) : currentStep === 4 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
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

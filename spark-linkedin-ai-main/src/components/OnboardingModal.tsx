import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Target,
  Sparkles,
  Heart,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lightbulb,
  TrendingUp,
  Rocket,
  Crown,
  Building2,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WRITING_STYLES, TONE_OPTIONS, INDUSTRIES, EXPERIENCE_LEVELS } from "@/constants/personaOptions";
import api from "@/services/api";

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
  { id: 'tech', label: 'Technology', icon: Target },
  { id: 'marketing', label: 'Marketing', icon: Target },
  { id: 'design', label: 'Design', icon: Target },
  { id: 'startup', label: 'Startups', icon: Rocket },
  { id: 'leadership', label: 'Leadership', icon: Crown },
  { id: 'health', label: 'Health & Wellness', icon: Heart },
  { id: 'fitness', label: 'Fitness', icon: Target },
  { id: 'travel', label: 'Travel', icon: Target },
  { id: 'food', label: 'Food & Cooking', icon: Heart },
  { id: 'music', label: 'Music', icon: Target },
  { id: 'sports', label: 'Sports', icon: Target },
  { id: 'entertainment', label: 'Entertainment', icon: Target },
  { id: 'education', label: 'Education', icon: Target },
];

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({
    // Step 1: Professional Info & Goals
    primaryGoal: "",
    jobTitle: "",
    company: "",
    industry: "",
    experience: "",
    // Step 2: AI Persona
    personaName: "",
    writingStyle: "",
    tone: "",
    expertise: "",
    targetAudience: "",
    // Step 3: Preferences
    topics: [] as string[],
    contentTypes: [] as string[],
    linkedinUrl: "",
  });

  const steps = [
    { id: 1, title: "Your Goals", icon: Target },
    { id: 2, title: "AI Persona", icon: Sparkles },
    { id: 3, title: "Preferences", icon: Heart }
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
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
        if (!formData.primaryGoal) newErrors.primaryGoal = "Please select your primary goal";
        break;
      case 2:
        if (!formData.writingStyle) newErrors.writingStyle = "Writing style is required";
        if (!formData.tone) newErrors.tone = "Tone is required";
        break;
      case 3:
        // Step 3 is optional
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        handleSubmit();
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 3));
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await api.updateProfile({
        profile: {
          onboardingCompleted: true,
          jobTitle: formData.jobTitle || null,
          company: formData.company || null,
          industry: formData.industry || null,
          experience: formData.experience || null,
          linkedinUrl: formData.linkedinUrl || null,
        },
        persona: {
          name: formData.personaName || `${formData.jobTitle || 'Professional'} Persona`,
          writingStyle: formData.writingStyle || null,
          tone: formData.tone || null,
          expertise: formData.expertise || null,
          targetAudience: formData.targetAudience || null,
          goals: formData.primaryGoal || null,
          contentTypes: formData.contentTypes || [],
        },
        interests: formData.topics || [],
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to save");
      }

      // Update local user context
      if (updateProfile) {
        await updateProfile({
          profile: {
            onboardingCompleted: true,
          }
        });
      }

      toast({
        title: "🎉 Welcome to LinkedInPulse!",
        description: "Your personalized experience is ready.",
      });

      onComplete();
    } catch (error: any) {
      console.error("Onboarding save error:", error);
      toast({
        title: "Failed to save",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 [&>button]:hidden animate-in fade-in zoom-in duration-300"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4 px-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center flex-1 ${
                    index === steps.length - 1 ? 'flex-none' : ''
                  }`}>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
                        : isCurrent
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? <Check className="h-5 w-5 sm:h-6 sm:w-6" /> : <Icon className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </div>
                    <span className={`text-xs mt-2 hidden sm:block text-center ${
                      isCurrent ? 'font-medium text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded transition-all duration-300 ${
                      isCompleted ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2 transition-all duration-300" />
        </div>

        {/* Main Content Card */}
        <Card className="p-4 sm:p-6 md:p-8 shadow-2xl border-2 border-blue-100/50 dark:border-blue-900/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Step 1: Professional Info & Goals */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">What's your primary goal?</h2>
                <p className="text-muted-foreground">Help us personalize your experience</p>
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
                        onClick={() => handleChange('primaryGoal', goal.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          formData.primaryGoal === goal.id
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
                          {formData.primaryGoal === goal.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.primaryGoal && <p className="text-xs text-red-500 mt-1">{errors.primaryGoal}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-sm font-medium">Job Title</Label>
                  <Input
                    id="jobTitle"
                    type="text"
                    placeholder="e.g., Marketing Manager"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    className={errors.jobTitle ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.jobTitle && <p className="text-xs text-red-500">{errors.jobTitle}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="e.g., Acme Inc."
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className={errors.company ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.company && <p className="text-xs text-red-500">{errors.company}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                  <select
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                      errors.industry ? 'border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  {errors.industry && <p className="text-xs text-red-500">{errors.industry}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium">Experience Level</Label>
                  <select
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                      errors.experience ? 'border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select level</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  {errors.experience && <p className="text-xs text-red-500">{errors.experience}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: AI Persona */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Build your AI persona</h2>
                <p className="text-muted-foreground">Create an AI that writes like you</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      AI-Powered Suggestions
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Based on your profile, we've suggested some options. Feel free to customize!
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

                <div className="space-y-2">
                  <Label htmlFor="expertise" className="text-sm font-medium">Areas of Expertise</Label>
                  <Textarea
                    id="expertise"
                    placeholder="e.g., Digital marketing, Leadership, Product management..."
                    value={formData.expertise}
                    onChange={(e) => handleChange('expertise', e.target.value)}
                    className={errors.expertise ? 'border-red-500' : ''}
                    disabled={isLoading}
                    rows={3}
                  />
                  {errors.expertise && <p className="text-xs text-red-500">{errors.expertise}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-sm font-medium">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    placeholder="e.g., Marketing professionals, Startup founders, Tech enthusiasts..."
                    value={formData.targetAudience}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                    className={errors.targetAudience ? 'border-red-500' : ''}
                    disabled={isLoading}
                    rows={3}
                  />
                  {errors.targetAudience && <p className="text-xs text-red-500">{errors.targetAudience}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences & Topics */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Customize your experience</h2>
                <p className="text-muted-foreground">Tell us what interests you</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Select Topics of Interest</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleTopicToggle(topic.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.topics.includes(topic.id)
                            ? 'border-primary bg-primary/10 shadow-md scale-105'
                            : 'border-border hover:border-primary/50'
                        }`}
                        disabled={isLoading}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icon className={`h-6 w-6 ${
                            formData.topics.includes(topic.id) ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-xs font-medium ${
                            formData.topics.includes(topic.id) ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {topic.label}
                          </span>
                          {formData.topics.includes(topic.id) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Content Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Posts', 'Comments', 'Stories', 'Articles', 'Polls', 'Videos'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleContentTypeToggle(type)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.contentTypes.includes(type)
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                      disabled={isLoading}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {formData.contentTypes.includes(type) && <Check className="h-4 w-4" />}
                        <span className="font-medium">{type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl" className="text-sm font-medium">LinkedIn Profile URL (Optional)</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Optional: Help us analyze your profile to enhance your persona
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
              className="gap-2 transition-all"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-initial"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {currentStep === 3 ? "Saving..." : "Loading..."}
                </>
              ) : currentStep === 3 ? (
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
      </DialogContent>
    </Dialog>
  );
};

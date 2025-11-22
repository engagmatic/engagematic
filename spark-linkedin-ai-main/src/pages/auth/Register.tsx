import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Eye,
  EyeOff,
  Check,
  User,
  Sparkles,
  Lightbulb
} from "lucide-react";
import { LogoWithText } from "@/components/LogoWithText";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PERSONA_PRESETS, isPersonaSlug, type PersonaSlug } from "@/constants/personaPresets";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [personaSlug, setPersonaSlug] = useState<PersonaSlug | null>(null);

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change for better UX
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && validateForm()) {
      handleSubmit();
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slugParam = params.get("persona");

    if (isPersonaSlug(slugParam)) {
      setPersonaSlug(slugParam);
    } else {
      setPersonaSlug(null);
    }
  }, [location.search]);

  const selectedPersona = personaSlug ? PERSONA_PRESETS[personaSlug] : null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const personaPayload = selectedPersona?.persona;
      const profilePayload = selectedPersona?.profile;

      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(profilePayload ? { profile: profilePayload } : {}),
        ...(personaPayload ? { persona: personaPayload } : {})
      });
      
      if (result.success) {
        toast({
          title: "Welcome to LinkedInPulse! 🎉",
          description: "Your account has been created. Complete your profile setup to get started.",
        });
        
        // Small delay to ensure auth context is updated before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const returnTo = location.state?.returnTo || '/dashboard';
        navigate(returnTo);
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <LogoWithText 
            textSize="lg"
            className="mb-4 justify-center"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Create your AI-powered LinkedIn presence
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Get started in seconds – complete your profile setup after signup
          </p>
        </div>

        {selectedPersona && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left shadow-sm dark:border-blue-900/60 dark:bg-blue-950/40 animate-in fade-in slide-in-from-top-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-700 dark:text-blue-200">
              {selectedPersona.label}
            </div>
            <div className="mt-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              {selectedPersona.stat}
            </div>
            {selectedPersona.lines.map((line, index) => (
              <p key={index} className="mt-1 text-sm text-blue-900/80 dark:text-blue-100/80">
                {line}
              </p>
            ))}
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.26em] text-blue-600/80 dark:text-blue-300/80">
              We’ll preload this playbook into your workspace.
            </p>
          </div>
        )}

        {/* Main Content Card */}
        <Card className="p-5 sm:p-6 md:p-8 shadow-2xl border-2 border-blue-100/50 dark:border-blue-900/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5 sm:space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg animate-in zoom-in duration-300">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Let's get started</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Create your account in seconds</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`transition-all ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                  disabled={isLoading}
                  autoComplete="name"
                  autoFocus
                />
                {errors.name && <p className="text-xs text-red-500 animate-in fade-in">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-red-500 animate-in fade-in">{errors.email}</p>}
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
                    className={`transition-all ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-red-500 animate-in fade-in">{errors.password}</p>}
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
                    className={`transition-all ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 animate-in fade-in">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 animate-in fade-in duration-300">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                Your password is encrypted and secure. We'll never store it in plain text.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800 animate-in fade-in duration-300 delay-75">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-purple-900 dark:text-purple-100">
                After signup, you'll complete your profile setup to personalize your AI experience.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg font-semibold py-6 sm:py-7"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary hover:underline font-medium transition-colors"
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

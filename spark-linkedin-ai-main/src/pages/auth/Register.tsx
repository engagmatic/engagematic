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
  Lightbulb,
  Shield
} from "lucide-react";
import { LogoWithText } from "@/components/LogoWithText";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [personaSlug, setPersonaSlug] = useState<PersonaSlug | null>(null);

  const { register, googleLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          title: "Welcome to Engagematic!",
          description: "Your account has been created. Let's set up your profile.",
        });
        
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

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const refCode = params.get("ref") || undefined;

        const result = await googleLogin(tokenResponse.access_token, refCode);
        if (result.success) {
          toast({
            title: result.isNewUser ? "Welcome to Engagematic!" : "Welcome back!",
            description: result.isNewUser
              ? "Your account has been created. Let's personalize your experience."
              : "Signed in with Google successfully.",
          });
          await new Promise((resolve) => setTimeout(resolve, 100));
          const returnTo = location.state?.returnTo || "/dashboard";
          navigate(returnTo);
        } else {
          toast({
            title: "Google sign-up failed",
            description: result.error || "Something went wrong",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Google sign-up failed",
          description: err.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Google sign-up failed",
        description: "Could not connect to Google. Please try again.",
        variant: "destructive",
      });
    },
  });

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
            Get started in seconds — complete your profile setup after signup
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
              We'll preload this playbook into your workspace.
            </p>
          </div>
        )}

        {/* Main Content Card */}
        <Card className="p-5 sm:p-6 md:p-8 shadow-2xl border-2 border-blue-100/50 dark:border-blue-900/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg animate-in zoom-in duration-300">
              <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Let's get started</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Create your account in seconds</p>
          </div>

          {/* Premium Google Sign-Up Button */}
          <button
            type="button"
            onClick={() => handleGoogleAuth()}
            disabled={isGoogleLoading || isLoading}
            className="group relative w-full flex items-center justify-center gap-3 h-[52px] sm:h-14 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[15px] sm:text-base transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-[0_4px_20px_rgba(66,133,244,0.18)] dark:hover:shadow-[0_4px_20px_rgba(66,133,244,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-50/60 group-hover:via-transparent group-hover:to-red-50/40 dark:group-hover:from-blue-500/5 dark:group-hover:via-transparent dark:group-hover:to-red-500/5 transition-all duration-500" />
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <svg className="h-5 w-5 sm:h-[22px] sm:w-[22px] flex-shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
              </svg>
            )}
            <span className="relative">
              {isGoogleLoading ? "Creating account..." : "Sign up with Google"}
            </span>
            <span className="absolute right-4 text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:inline">
              Fastest
            </span>
          </button>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-4 mt-3 mb-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              <Sparkles className="h-3 w-3" />
              <span>7-day free trial</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="text-[11px] text-muted-foreground/70">
              No credit card
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`h-11 transition-all ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                  disabled={isLoading}
                  autoComplete="name"
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
                  className={`h-11 transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
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
                    className={`h-11 transition-all ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
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
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
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
                    className={`h-11 transition-all ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
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
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
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

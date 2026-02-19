import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Check, User, Sparkles, Lightbulb, Shield } from "lucide-react";
import { LogoWithText } from "@/components/LogoWithText";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PERSONA_PRESETS, isPersonaSlug, type PersonaSlug } from "@/constants/personaPresets";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "502515400049-lb7r6k1qd6lqaqjjdqn0vu8b9ocoing9.apps.googleusercontent.com";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gBusy, setGBusy] = useState(false);
  const [gReady, setGReady] = useState(false);
  const [gError, setGError] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [personaSlug, setPersonaSlug] = useState<PersonaSlug | null>(null);
  const alive = useRef(true);

  const { register, googleLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Load Google Identity Services SDK
  useEffect(() => {
    alive.current = true;

    const loadScript = () => {
      if ((window as any).google?.accounts?.oauth2) {
        setGReady(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (existingScript) {
        const poll = setInterval(() => {
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(poll);
            if (alive.current) setGReady(true);
          }
        }, 200);
        setTimeout(() => {
          clearInterval(poll);
          if (alive.current && !gReady) setGError("Google SDK timeout");
        }, 10000);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => {
        const poll = setInterval(() => {
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(poll);
            if (alive.current) setGReady(true);
          }
        }, 200);
        setTimeout(() => {
          clearInterval(poll);
          if (alive.current && !gReady) setGError("Google SDK timeout");
        }, 10000);
      };
      script.onerror = () => {
        if (alive.current) setGError("Failed to load");
      };
      document.head.appendChild(script);
    };

    loadScript();
    return () => { alive.current = false; };
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p: any) => ({ ...p, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const e: any = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 6) e.password = "At least 6 characters";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !isLoading && validateForm()) handleSubmit(); };

  useEffect(() => {
    const p = new URLSearchParams(location.search).get("persona");
    setPersonaSlug(isPersonaSlug(p) ? p : null);
  }, [location.search]);

  const selectedPersona = personaSlug ? PERSONA_PRESETS[personaSlug] : null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const r = await register({
        name: formData.name, email: formData.email, password: formData.password,
        ...(selectedPersona?.profile ? { profile: selectedPersona.profile } : {}),
        ...(selectedPersona?.persona ? { persona: selectedPersona.persona } : {}),
      });
      if (r.success) {
        toast({ title: "Welcome to Engagematic!", description: "Account created. Let's set up your profile." });
        await new Promise((r) => setTimeout(r, 100));
        navigate(location.state?.returnTo || "/dashboard");
      } else {
        toast({ title: "Registration failed", description: r.error || "Failed to create account", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Unexpected error", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleGoogleClick = useCallback(() => {
    if (!gReady || gBusy || isLoading) return;
    setGBusy(true);

    try {
      const google = (window as any).google;
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        callback: async (res: any) => {
          if (res.access_token) {
            try {
              const ref = new URLSearchParams(location.search).get("ref") || undefined;
              const r = await googleLogin(res.access_token, ref);
              if (r.success) {
                toast({
                  title: r.isNewUser ? "Welcome to Engagematic!" : "Welcome back!",
                  description: r.isNewUser ? "Account created — let's personalize your experience." : "Signed in with Google.",
                });
                await new Promise((r) => setTimeout(r, 100));
                navigate(location.state?.returnTo || "/dashboard");
              } else {
                toast({ title: "Google sign-up failed", description: r.error || "Something went wrong", variant: "destructive" });
              }
            } catch (err: any) {
              toast({ title: "Google sign-up failed", description: err.message || "Unexpected error", variant: "destructive" });
            } finally {
              if (alive.current) setGBusy(false);
            }
          } else {
            if (alive.current) setGBusy(false);
            toast({ title: "Google sign-up failed", description: res.error || "No token received", variant: "destructive" });
          }
        },
        error_callback: (err: any) => {
          if (alive.current) setGBusy(false);
          const errType = err?.type || "unknown";
          if (errType === "popup_closed") {
            toast({ title: "Cancelled", description: "You closed the Google popup.", variant: "destructive" });
          } else if (errType === "popup_failed_to_open") {
            toast({ title: "Popup blocked", description: "Please allow popups for this site and try again.", variant: "destructive" });
          } else {
            toast({ title: "Google error", description: `Error type: ${errType}`, variant: "destructive" });
          }
        },
      });
      client.requestAccessToken();
    } catch (e: any) {
      if (alive.current) setGBusy(false);
      toast({ title: "Google sign-up failed", description: e?.message || "Could not start Google sign-in", variant: "destructive" });
    }
  }, [gReady, gBusy, isLoading, googleLogin, navigate, location, toast]);

  const anyBusy = isLoading || gBusy;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <LogoWithText textSize="lg" className="mb-4 justify-center" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Create your AI-powered LinkedIn presence</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Get started in seconds — complete your profile setup after signup</p>
        </div>

        {selectedPersona && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left shadow-sm dark:border-blue-900/60 dark:bg-blue-950/40 animate-in fade-in slide-in-from-top-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-700 dark:text-blue-200">{selectedPersona.label}</div>
            <div className="mt-2 text-sm font-semibold text-blue-900 dark:text-blue-100">{selectedPersona.stat}</div>
            {selectedPersona.lines.map((line, i) => <p key={i} className="mt-1 text-sm text-blue-900/80 dark:text-blue-100/80">{line}</p>)}
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.26em] text-blue-600/80 dark:text-blue-300/80">We'll preload this playbook into your workspace.</p>
          </div>
        )}

        <Card className="p-5 sm:p-6 md:p-8 shadow-2xl border-2 border-blue-100/50 dark:border-blue-900/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg animate-in zoom-in duration-300">
              <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Let's get started</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Create your account in seconds</p>
          </div>

          {/* Google Sign-Up Button - INLINE */}
          {gError ? (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-3 h-[52px] rounded-xl border border-red-200 bg-red-50 text-red-500 font-medium text-sm cursor-not-allowed"
            >
              Google Sign-Up unavailable
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={anyBusy || !gReady}
              className="group relative w-full flex items-center justify-center gap-3 h-[52px] rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium text-[15px] tracking-[-0.01em] shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:shadow-blue-500/[0.08] hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.985] active:shadow-sm disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2"
            >
              <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/[0.04] via-transparent to-orange-500/[0.03]" />

              {gBusy ? (
                <span className="flex h-5 w-5 items-center justify-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
                </span>
              ) : (
                <svg className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
                </svg>
              )}

              <span className="relative">
                {!gReady && !gBusy ? "Loading Google..." : gBusy ? "Creating account..." : "Sign up with Google"}
              </span>
            </button>
          )}

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 mt-3 mb-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60"><Shield className="h-3 w-3" /><span>Secure</span></div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60"><Sparkles className="h-3 w-3" /><span>7-day free trial</span></div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <div className="text-[11px] text-muted-foreground/60">No credit card</div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">or sign up with email</span></div>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={formData.name} onChange={(e) => handleChange("name", e.target.value)}
                  className={`h-11 ${errors.name ? "border-red-500" : ""}`} disabled={anyBusy} autoComplete="name" />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)}
                  className={`h-11 ${errors.email ? "border-red-500" : ""}`} disabled={anyBusy} autoComplete="email" />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a secure password"
                    value={formData.password} onChange={(e) => handleChange("password", e.target.value)}
                    className={`h-11 ${errors.password ? "border-red-500" : ""}`} disabled={anyBusy} autoComplete="new-password" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)} disabled={anyBusy}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password"
                    value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className={`h-11 ${errors.confirmPassword ? "border-red-500" : ""}`} disabled={anyBusy} autoComplete="new-password" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={anyBusy}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">Your password is encrypted and secure. We'll never store it in plain text.</p>
            </div>
            <div className="flex items-start gap-3 p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-purple-900 dark:text-purple-100">After signup, you'll complete your profile setup to personalize your AI experience.</p>
            </div>

            <Button type="submit" disabled={anyBusy} size="lg"
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg font-semibold py-6 sm:py-7">
              {isLoading ? (<><Loader2 className="h-5 w-5 animate-spin" />Creating account...</>) : (<><Sparkles className="h-5 w-5" />Create Account</>)}
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Already have an account?{" "}<Link to="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link></p>
          <p className="text-xs text-muted-foreground mt-2">By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Register;

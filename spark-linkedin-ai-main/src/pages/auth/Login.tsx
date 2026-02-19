import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { LogoWithText } from "@/components/LogoWithText";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "502515400049-lb7r6k1qd6lqaqjjdqn0vu8b9ocoing9.apps.googleusercontent.com";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gBusy, setGBusy] = useState(false);
  const [gReady, setGReady] = useState(false);
  const [gError, setGError] = useState("");
  const alive = useRef(true);

  const { login, googleLogin, error, clearError } = useAuth();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const r = await login(formData);
    if (r.success) {
      toast({ title: "Welcome back!", description: "You're successfully logged in" });
      navigate(location.state?.returnTo || "/dashboard");
    } else {
      toast({ title: "Login failed", description: r.error || "Invalid email or password", variant: "destructive" });
    }
    setIsLoading(false);
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
              const r = await googleLogin(res.access_token);
              if (r.success) {
                toast({
                  title: r.isNewUser ? "Welcome to Engagematic!" : "Welcome back!",
                  description: r.isNewUser ? "Account created with Google." : "Signed in with Google.",
                });
                navigate(location.state?.returnTo || "/dashboard");
              } else {
                toast({ title: "Google sign-in failed", description: r.error || "Something went wrong", variant: "destructive" });
              }
            } catch (err: any) {
              toast({ title: "Google sign-in failed", description: err.message || "Unexpected error", variant: "destructive" });
            } finally {
              if (alive.current) setGBusy(false);
            }
          } else {
            if (alive.current) setGBusy(false);
            toast({ title: "Google sign-in failed", description: res.error || "No token received", variant: "destructive" });
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
      toast({ title: "Google sign-in failed", description: e?.message || "Could not start Google sign-in", variant: "destructive" });
    }
  }, [gReady, gBusy, isLoading, googleLogin, navigate, location, toast]);

  const anyBusy = isLoading || gBusy;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogoWithText textSize="lg" className="mb-4 justify-center" />
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card className="p-8 shadow-lg border-2">
          {/* Google Sign-In Button - INLINE, no separate component */}
          {gError ? (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-3 h-[52px] rounded-xl border border-red-200 bg-red-50 text-red-500 font-medium text-sm cursor-not-allowed"
            >
              Google Sign-In unavailable
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
                {!gReady && !gBusy ? "Loading Google..." : gBusy ? "Signing in..." : "Continue with Google"}
              </span>
            </button>
          )}

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">or</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com"
                value={formData.email} onChange={handleChange} required disabled={anyBusy} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" value={formData.password}
                  onChange={handleChange} required disabled={anyBusy} className="h-11" />
                <Button type="button" variant="ghost" size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)} disabled={anyBusy}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={anyBusy}
              className="w-full h-11 text-[15px] font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300">
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">Don't have an account?{" "}<Link to="/auth/register" className="text-primary hover:underline font-medium">Sign up for free</Link></p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

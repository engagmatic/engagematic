import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { LogoWithText } from "@/components/LogoWithText";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, googleLogin, error, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      toast({
        title: "Welcome back!",
        description: "You're successfully logged in",
      });
      const returnTo = location.state?.returnTo || '/dashboard';
      navigate(returnTo);
    } else {
      toast({
        title: "Login failed",
        description: result.error || "Invalid email or password",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const result = await googleLogin(tokenResponse.access_token);
        if (result.success) {
          toast({
            title: result.isNewUser ? "Welcome to Engagematic!" : "Welcome back!",
            description: result.isNewUser
              ? "Your account has been created with Google."
              : "Signed in with Google successfully.",
          });
          const returnTo = location.state?.returnTo || "/dashboard";
          navigate(returnTo);
        } else {
          toast({
            title: "Google sign-in failed",
            description: result.error || "Something went wrong",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Google sign-in failed",
          description: err.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Google sign-in failed",
        description: "Could not connect to Google. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogoWithText 
            textSize="lg"
            className="mb-4 justify-center"
          />
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card className="p-8 shadow-lg border-2">
          {/* Premium Google Sign-In Button */}
          <button
            type="button"
            onClick={() => handleGoogleAuth()}
            disabled={isGoogleLoading || isLoading}
            className="group relative w-full flex items-center justify-center gap-3 h-12 px-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-[15px] transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-[0_2px_12px_rgba(66,133,244,0.15)] dark:hover:shadow-[0_2px_12px_rgba(66,133,244,0.25)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-50/50 group-hover:via-transparent group-hover:to-red-50/30 dark:group-hover:from-blue-500/5 dark:group-hover:via-transparent dark:group-hover:to-red-500/5 transition-all duration-500" />
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <svg className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
              </svg>
            )}
            <span className="relative">
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                or
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-[15px] font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/auth/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

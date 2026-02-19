import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { LogoWithText } from "@/components/LogoWithText";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gBusy, setGBusy] = useState(false);

  const { login, googleLogin, error, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  const onGoogle = async (accessToken: string) => {
    setGBusy(true);
    try {
      const r = await googleLogin(accessToken);
      if (r.success) {
        toast({ title: r.isNewUser ? "Welcome to Engagematic!" : "Welcome back!", description: r.isNewUser ? "Account created with Google." : "Signed in with Google." });
        navigate(location.state?.returnTo || "/dashboard");
      } else {
        toast({ title: "Google sign-in failed", description: r.error || "Something went wrong", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Google sign-in failed", description: err.message || "Unexpected error", variant: "destructive" });
    } finally {
      setGBusy(false);
    }
  };

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
          {/* Google */}
          <GoogleSignInButton
            onSuccess={onGoogle}
            onError={() => toast({ title: "Google sign-in failed", description: "Could not connect to Google.", variant: "destructive" })}
            variant="login"
            disabled={anyBusy}
          />

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

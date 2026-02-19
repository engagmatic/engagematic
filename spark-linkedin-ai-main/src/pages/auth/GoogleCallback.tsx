import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [error, setError] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam === "access_denied" ? "You cancelled the sign-in." : `Google error: ${errorParam}`);
      setTimeout(() => navigate("/auth/login"), 2500);
      return;
    }

    if (!code) {
      setError("No authorization code received from Google.");
      setTimeout(() => navigate("/auth/login"), 2500);
      return;
    }

    const referralCode = localStorage.getItem("engagematic_ref") || undefined;
    const redirectUri = window.location.origin + "/auth/google/callback";

    (async () => {
      try {
        const r = await googleLogin(code, referralCode, redirectUri);
        if (r.success) {
          navigate(r.isNewUser ? "/dashboard" : "/dashboard");
        } else {
          setError(r.error || "Google sign-in failed.");
          setTimeout(() => navigate("/auth/login"), 3000);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
        setTimeout(() => navigate("/auth/login"), 3000);
      }
    })();
  }, [searchParams, googleLogin, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <span className="text-red-500 text-2xl">✕</span>
          </div>
          <h2 className="text-xl font-semibold text-red-600">{error}</h2>
          <p className="text-muted-foreground text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold">Signing you in with Google...</h2>
        <p className="text-muted-foreground text-sm">Please wait a moment</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

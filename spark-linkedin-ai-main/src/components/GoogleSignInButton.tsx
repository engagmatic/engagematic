import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  clientId: string;
  onSuccess: (accessToken: string) => void;
  onError?: () => void;
  text?: string;
  loadingText?: string;
  disabled?: boolean;
  size?: "default" | "large";
}

export function GoogleSignInButton({
  clientId,
  onSuccess,
  onError,
  text = "Continue with Google",
  loadingText = "Signing in...",
  disabled = false,
  size = "default",
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!clientId) return;

    const checkGoogle = () => {
      if ((window as any).google?.accounts?.oauth2) {
        if (mounted.current) setSdkReady(true);
        return true;
      }
      return false;
    };

    if (checkGoogle()) return;

    // Load the Google Identity Services script if not already present
    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setTimeout(checkGoogle, 300);
      document.head.appendChild(script);
    }

    const interval = setInterval(() => {
      if (checkGoogle()) clearInterval(interval);
    }, 500);

    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [clientId]);

  const handleClick = useCallback(() => {
    if (isLoading || disabled || !sdkReady || !clientId) return;

    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      onError?.();
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "email profile openid",
      callback: (response: any) => {
        if (response.access_token) {
          if (mounted.current) setIsLoading(true);
          onSuccess(response.access_token);
        } else {
          if (mounted.current) setIsLoading(false);
          onError?.();
        }
      },
      error_callback: () => {
        if (mounted.current) setIsLoading(false);
        onError?.();
      },
    });

    client.requestAccessToken();
  }, [isLoading, disabled, sdkReady, clientId, onSuccess, onError]);

  useEffect(() => {
    if (!disabled && mounted.current) setIsLoading(false);
  }, [disabled]);

  if (!clientId) return null;

  const heightClass = size === "large" ? "h-[52px] sm:h-14" : "h-12";
  const radiusClass = size === "large" ? "rounded-xl" : "rounded-lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || disabled || !sdkReady}
      className={`group relative w-full flex items-center justify-center gap-3 ${heightClass} px-6 ${radiusClass} border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[15px] transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-[0_4px_20px_rgba(66,133,244,0.18)] dark:hover:shadow-[0_4px_20px_rgba(66,133,244,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-50/60 group-hover:via-transparent group-hover:to-red-50/40 dark:group-hover:from-blue-500/5 dark:group-hover:via-transparent dark:group-hover:to-red-500/5 transition-all duration-500" />
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      ) : (
        <svg
          className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
        </svg>
      )}
      <span className="relative">
        {isLoading ? loadingText : text}
      </span>
    </button>
  );
}

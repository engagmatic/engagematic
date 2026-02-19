import { useState, useEffect, useCallback, useRef } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

interface Props {
  onSuccess: (accessToken: string) => void;
  onError?: () => void;
  label?: string;
  disabled?: boolean;
  variant?: "login" | "signup";
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      const check = setInterval(() => {
        if (window.google?.accounts?.oauth2) { clearInterval(check); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(check); reject(new Error("timeout")); }, 8000);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => {
      const check = setInterval(() => {
        if (window.google?.accounts?.oauth2) { clearInterval(check); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(check); reject(new Error("timeout")); }, 8000);
    };
    s.onerror = () => reject(new Error("script_load_failed"));
    document.head.appendChild(s);
  });
}

export function GoogleSignInButton({ onSuccess, onError, label, disabled = false, variant = "login" }: Props) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);

  console.log("[GoogleSignInButton] Rendering. GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "SET (" + GOOGLE_CLIENT_ID.substring(0, 10) + "...)" : "EMPTY");

  useEffect(() => {
    alive.current = true;
    console.log("[GoogleSignInButton] Loading GSI script...");
    loadGsiScript()
      .then(() => {
        console.log("[GoogleSignInButton] GSI script loaded successfully");
        if (alive.current) setReady(true);
      })
      .catch((err) => {
        console.error("[GoogleSignInButton] GSI script FAILED:", err);
      });
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    if (!disabled && alive.current) setBusy(false);
  }, [disabled]);

  const text = label ?? (variant === "signup" ? "Sign up with Google" : "Continue with Google");

  const handleClick = useCallback(() => {
    if (!ready || busy || disabled) return;
    console.log("[GoogleSignInButton] Button clicked, initiating OAuth flow...");
    try {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        callback: (res: any) => {
          console.log("[GoogleSignInButton] OAuth callback:", res.error || "success");
          if (res.access_token) {
            if (alive.current) setBusy(true);
            onSuccess(res.access_token);
          } else {
            console.error("[GoogleSignInButton] No access_token in response:", JSON.stringify(res));
            if (alive.current) setBusy(false);
            onError?.();
          }
        },
        error_callback: (err: any) => {
          console.error("[GoogleSignInButton] error_callback fired:", JSON.stringify(err));
          if (alive.current) setBusy(false);
          onError?.();
        },
      });
      client.requestAccessToken();
    } catch (e: any) {
      console.error("[GoogleSignInButton] catch error:", e?.message || e);
      onError?.();
    }
  }, [ready, busy, disabled, onSuccess, onError]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || disabled || !ready}
      className="group relative w-full flex items-center justify-center gap-3 h-[52px] rounded-xl
        border border-slate-200/80 dark:border-slate-700/80
        bg-white dark:bg-slate-900
        text-slate-800 dark:text-slate-100
        font-medium text-[15px] tracking-[-0.01em]
        shadow-sm
        transition-all duration-200 ease-out
        hover:shadow-md hover:shadow-blue-500/[0.08] hover:border-slate-300 dark:hover:border-slate-600
        active:scale-[0.985] active:shadow-sm
        disabled:opacity-50 disabled:pointer-events-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2"
    >
      {/* Hover gradient overlay */}
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/[0.04] via-transparent to-orange-500/[0.03]" />

      {/* Google logo */}
      {busy ? (
        <span className="flex h-5 w-5 items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
        </span>
      ) : (
        <svg className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
      )}

      <span className="relative">{busy ? "Please wait..." : text}</span>
    </button>
  );
}

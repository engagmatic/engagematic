import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

interface Props {
  onSuccess: (credential: string) => void;
  onError?: () => void;
  label?: string;
  disabled?: boolean;
  variant?: "login" | "signup";
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      const check = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        reject(new Error("timeout"));
      }, 10000);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => {
      const check = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        reject(new Error("timeout"));
      }, 10000);
    };
    s.onerror = () => reject(new Error("script_load_failed"));
    document.head.appendChild(s);
  });
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  variant = "login",
}: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const callbackRef = useRef(onSuccess);
  const errorRef = useRef(onError);
  callbackRef.current = onSuccess;
  errorRef.current = onError;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let alive = true;
    loadGsiScript()
      .then(() => {
        if (alive) setSdkReady(true);
      })
      .catch(() => {
        console.error("[GoogleSignInButton] Failed to load Google SDK");
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!sdkReady || !btnRef.current || !GOOGLE_CLIENT_ID) return;

    window.google!.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        if (response.credential) {
          callbackRef.current(response.credential);
        } else {
          errorRef.current?.();
        }
      },
    });

    window.google!.accounts.id.renderButton(btnRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: variant === "signup" ? "signup_with" : "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: btnRef.current.offsetWidth || 400,
    });
  }, [sdkReady, variant]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <div
        ref={btnRef}
        className={`w-full flex items-center justify-center min-h-[44px] rounded-lg transition-opacity ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
        style={{ colorScheme: "auto" }}
      />
      {!sdkReady && (
        <div className="w-full flex items-center justify-center gap-3 h-[44px] rounded-lg border border-slate-200 bg-white text-slate-500 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
          Loading Google...
        </div>
      )}
    </div>
  );
}

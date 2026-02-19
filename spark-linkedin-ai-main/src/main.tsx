import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

document.documentElement.style.setProperty('--font-geist-sans', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
document.documentElement.style.setProperty('--font-geist-mono', '"Courier New", Courier, monospace');

const AppTree = GOOGLE_CLIENT_ID ? (
  <HelmetProvider>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </HelmetProvider>
) : (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

createRoot(rootElement).render(AppTree);

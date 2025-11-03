import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Apply fonts and render app
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Set fallback fonts (Geist fonts removed to fix build issues)
document.documentElement.style.setProperty('--font-geist-sans', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
document.documentElement.style.setProperty('--font-geist-mono', '"Courier New", Courier, monospace');

// Render the app immediately (don't wait for fonts)
createRoot(rootElement).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

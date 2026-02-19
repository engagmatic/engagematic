import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

document.documentElement.style.setProperty('--font-geist-sans', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
document.documentElement.style.setProperty('--font-geist-mono', '"Courier New", Courier, monospace');

createRoot(rootElement).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

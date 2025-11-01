import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Import Geist fonts - handle gracefully if import fails
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

// Apply Geist fonts globally
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Apply fonts if available
if (GeistSans?.className) {
  rootElement.classList.add(GeistSans.className);
}
if (GeistSans?.style?.fontFamily) {
  document.documentElement.style.setProperty('--font-geist-sans', GeistSans.style.fontFamily);
}
if (GeistMono?.style?.fontFamily) {
  document.documentElement.style.setProperty('--font-geist-mono', GeistMono.style.fontFamily);
}

// Render the app
createRoot(rootElement).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import App from "./App.tsx";
import "./index.css";

// Apply Geist fonts globally
const rootElement = document.getElementById("root")!;
if (rootElement) {
  rootElement.classList.add(GeistSans.className);
  document.documentElement.style.setProperty('--font-geist-sans', GeistSans.style.fontFamily);
  document.documentElement.style.setProperty('--font-geist-mono', GeistMono.style.fontFamily);
}

createRoot(rootElement).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Apply fonts and render app
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Initialize fonts asynchronously
(async () => {
  try {
    const geistSansModule = await import('geist/font/sans');
    const GeistSans = geistSansModule.default || geistSansModule;
    
    if (GeistSans) {
      if (GeistSans.className) {
        rootElement.classList.add(GeistSans.className);
      }
      if (GeistSans.style?.fontFamily) {
        document.documentElement.style.setProperty('--font-geist-sans', GeistSans.style.fontFamily);
      }
    }
  } catch (error) {
    console.warn('Could not load Geist Sans font, using fallback:', error);
    document.documentElement.style.setProperty('--font-geist-sans', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
  }

  try {
    const geistMonoModule = await import('geist/font/mono');
    const GeistMono = geistMonoModule.default || geistMonoModule;
    
    if (GeistMono?.style?.fontFamily) {
      document.documentElement.style.setProperty('--font-geist-mono', GeistMono.style.fontFamily);
    }
  } catch (error) {
    console.warn('Could not load Geist Mono font, using fallback:', error);
    document.documentElement.style.setProperty('--font-geist-mono', '"Courier New", Courier, monospace');
  }
})();

// Set fallback fonts immediately (will be overridden if Geist loads)
document.documentElement.style.setProperty('--font-geist-sans', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
document.documentElement.style.setProperty('--font-geist-mono', '"Courier New", Courier, monospace');

// Render the app immediately (don't wait for fonts)
createRoot(rootElement).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

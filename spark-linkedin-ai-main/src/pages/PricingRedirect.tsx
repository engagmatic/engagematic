import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PricingRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to home and scroll to pricing
    navigate("/", { replace: true });
    // Small delay to ensure page loads before scrolling
    setTimeout(() => {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [navigate]);

  return null;
}


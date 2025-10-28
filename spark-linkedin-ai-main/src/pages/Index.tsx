import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import ReferralSection from "@/components/landing/ReferralSection";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { SEO } from "@/components/SEO";
import { PAGE_SEO } from "@/constants/seo";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle hash navigation when landing on the page
    if (location.hash) {
      const hash = location.hash.substring(1); // Remove the #
      // Longer delay to ensure all components are rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500); // Increased delay for reliability
    }
  }, [location]);


  return (
    <div className="min-h-screen">
      <SEO {...PAGE_SEO.home} />
      <Hero />
      <Features />
      <Testimonials />
      <ReferralSection />
      <Pricing />
      <FAQ />
    </div>
  );
};

export default Index;

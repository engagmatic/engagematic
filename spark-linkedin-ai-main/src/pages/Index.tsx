import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import ReferralSection from "@/components/landing/ReferralSection";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { SEO } from "@/components/SEO";
import { PAGE_SEO } from "@/constants/seo"; 

const Index = () => {
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

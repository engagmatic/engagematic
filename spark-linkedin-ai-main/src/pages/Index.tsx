import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { SEO, pageSEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO {...pageSEO.home} />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
    </div>
  );
};

export default Index;

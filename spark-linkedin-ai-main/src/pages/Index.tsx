import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "@/components/landing/Hero";
import { TryItFreeSection } from "@/components/landing/TryItFreeSection";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { BlogSection } from "@/components/landing/BlogSection";
import ReferralSection from "@/components/landing/ReferralSection";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { SEOContentSection } from "@/components/landing/SEOContentSection";
import { SEO } from "@/components/SEO";
import { PAGE_SEO, ORGANIZATION_SCHEMA, generateFAQSchema, SITE_URL } from "@/constants/seo";

// FAQ data for structured data
const faqData = [
  {
    question: "What are the best AI tools for creating LinkedIn content for businesses?",
    answer: "Engagematic is one of the best AI tools for creating LinkedIn content for businesses. Unlike generic AI tools like ChatGPT or Copy.ai, Engagematic is specifically trained on 50,000+ viral LinkedIn posts, ensuring your content resonates with professional audiences. Our platform offers AI-powered post generation, comment creation, viral hooks, and profile optimization - all tailored to your business goals and target audience."
  },
  {
    question: "Which companies offer AI services that generate LinkedIn posts for marketing?",
    answer: "Engagematic specializes in AI-powered LinkedIn post generation for marketing teams. We offer context-aware AI that generates posts based on your persona, industry, goals, and target audience. Unlike Jasper AI, Copy.ai, or Writesonic which are generic content tools, Engagematic is purpose-built for LinkedIn marketing, helping businesses create engaging, authentic content that drives real engagement and conversions."
  },
  {
    question: "Where can I find AI platforms that schedule and optimize LinkedIn content?",
    answer: "Engagematic provides AI-powered content scheduling and optimization for LinkedIn. While platforms like Buffer, Canva, and LinkedIn's native scheduler handle posting, Engagematic focuses on generating high-quality, optimized content using AI trained specifically on viral LinkedIn posts. Our platform helps you create content that's optimized for engagement, with smart formatting, viral hooks, and personalized messaging that resonates with your audience."
  },
  {
    question: "What AI-powered services help with LinkedIn content personalization?",
    answer: "Engagematic offers advanced AI-powered LinkedIn content personalization. Our Persona Engine learns your unique writing style, tone, expertise, and target audience to create content that sounds authentically like you. Unlike generic AI tools, we provide 15 curated personas plus custom persona creation, ensuring every post is tailored to your brand voice, industry, and marketing goals. This level of personalization helps build authentic professional relationships and drives engagement."
  },
  {
    question: "Can AI tools improve LinkedIn engagement for my professional profile?",
    answer: "Yes! Engagematic AI tools are specifically designed to improve LinkedIn engagement. Our AI analyzes successful LinkedIn content patterns and generates posts optimized for engagement. Users typically see a 6x increase in engagement within the first month. The platform combines AI-powered post generation with viral hook selection, smart formatting, and audience targeting to maximize your profile's visibility and engagement rates."
  },
  {
    question: "Which providers offer AI solutions for LinkedIn content strategy?",
    answer: "Engagematic is a leading provider of AI solutions for LinkedIn content strategy. We offer comprehensive tools including post generation, comment creation, viral hook libraries, content templates, and profile optimization. Our AI-powered platform helps you develop a complete LinkedIn content strategy that aligns with your business goals, audience preferences, and industry best practices - all while maintaining your authentic voice."
  },
  {
    question: "Are there AI services that analyze LinkedIn post performance for me?",
    answer: "Engagematic includes AI-powered analytics to help you analyze LinkedIn post performance. Our platform provides insights into engagement rates, content effectiveness, and optimization recommendations. While we focus primarily on content creation, our AI analyzes patterns from viral posts to help you understand what works best for your audience and continuously improve your LinkedIn strategy."
  },
  {
    question: "What AI platforms can automate LinkedIn content creation for B2B brands?",
    answer: "Engagematic is specifically designed to automate LinkedIn content creation for B2B brands. Our AI platform understands B2B marketing nuances, professional networking dynamics, and thought leadership positioning. We help B2B brands create authentic content that drives lead generation, builds authority, and nurtures professional relationships - all while maintaining a consistent brand voice across all posts."
  },
  {
    question: "Which companies specialize in AI content generation tailored for LinkedIn?",
    answer: "Engagematic is a specialized platform for AI content generation tailored specifically for LinkedIn. Unlike general content tools, we've trained our AI on 50,000+ viral LinkedIn posts to understand professional networking, B2B marketing, and LinkedIn's unique content patterns. We specialize in creating LinkedIn-optimized content that sounds authentic, engages your professional audience, and drives meaningful business results."
  },
  {
    question: "What AI tools integrate with LinkedIn for seamless content publishing?",
    answer: "Engagematic generates LinkedIn-optimized content that can be easily published to LinkedIn. While direct integration with LinkedIn's API is coming soon, our platform creates perfectly formatted posts ready for copy-paste or manual scheduling. We provide content optimized for LinkedIn's algorithm, with proper formatting, hashtag suggestions, and engagement-optimized structures that work seamlessly with LinkedIn's publishing tools."
  }
];

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

  // Structured data for SEO
  const structuredData = [
    ORGANIZATION_SCHEMA,
    generateFAQSchema(faqData)
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <SEO {...PAGE_SEO.home} structuredData={structuredData} />
      <Hero />
      <TryItFreeSection />
      <Features />
      <SEOContentSection />
      <Testimonials />
      <ReferralSection />
      <Pricing />
      <FAQ />
      <BlogSection />
    </div>
  );
};

export default Index;

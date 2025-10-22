// Predefined SEO configurations for common pages
export const pageSEO = {
  home: {
    title: "LinkedInPulse - AI-Powered LinkedIn Content Generator | Create Viral Posts in 30 Seconds",
    description: "Stop staring at blank screens! LinkedInPulse uses AI to create engaging LinkedIn posts, comments, and content in 30 seconds. Join 500+ professionals growing their reach with authentic, viral-worthy content.",
    keywords: "LinkedIn content generator, AI LinkedIn posts, LinkedIn automation, social media content, LinkedIn marketing, content creation, viral posts, professional networking, LinkedIn growth, AI writing tool",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "LinkedInPulse",
      "description": "AI-powered LinkedIn content generator that creates engaging posts, comments, and content in 30 seconds",
      "url": "https://linkedinpulse.ai",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "9",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "500"
      }
    }
  },
  
  pricing: {
    title: "Pricing Plans - LinkedInPulse AI Content Generator",
    description: "Choose the perfect plan for your LinkedIn content needs. Start free with our 7-day trial. No credit card required. Plans starting from $9/month.",
    keywords: "LinkedIn content generator pricing, AI content creation plans, LinkedIn marketing tools cost, social media automation pricing",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "LinkedInPulse",
      "description": "AI-powered LinkedIn content generator",
      "offers": [
        {
          "@type": "Offer",
          "name": "Starter Plan",
          "price": "9",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31"
        },
        {
          "@type": "Offer",
          "name": "Pro Plan",
          "price": "18",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31"
        }
      ]
    }
  },
  
  templates: {
    title: "LinkedIn Content Templates - Ready-to-Use Templates for Professional Posts",
    description: "Browse our collection of proven LinkedIn content templates. From personal branding to business growth, find the perfect template for your professional content needs.",
    keywords: "LinkedIn templates, content templates, professional templates, LinkedIn post templates, social media templates",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "LinkedIn Content Templates",
      "description": "Ready-to-use templates for LinkedIn content creation"
    }
  },
  
  postGenerator: {
    title: "AI Post Generator - Create Viral LinkedIn Posts in 30 Seconds",
    description: "Generate engaging LinkedIn posts with our AI-powered post generator. Choose from 50+ viral hooks, customize with your persona, and create content that gets engagement.",
    keywords: "LinkedIn post generator, AI post creation, viral LinkedIn posts, content generation, social media posts",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "LinkedIn Post Generator",
      "description": "AI-powered tool for creating engaging LinkedIn posts"
    }
  },
  
  commentGenerator: {
    title: "AI Comment Generator - Generate Engaging LinkedIn Comments",
    description: "Create thoughtful, engaging comments for LinkedIn posts with our AI comment generator. Build professional relationships and start meaningful conversations.",
    keywords: "LinkedIn comment generator, AI comments, professional networking, LinkedIn engagement, comment automation",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "LinkedIn Comment Generator",
      "description": "AI-powered tool for generating engaging LinkedIn comments"
    }
  }
};


/**
 * SEO Constants and Keywords for LinkedInPulse
 * Centralized SEO configuration for consistency across all pages
 */

// Primary Brand
export const SITE_NAME = 'LinkedInPulse';
export const SITE_URL = 'https://www.linkedinpulse.com';
export const SITE_DOMAIN = 'linkedinpulse.com';

// Primary Keywords (High-Value)
export const PRIMARY_KEYWORDS = [
  'LinkedIn post generator',
  'AI LinkedIn content',
  'LinkedIn carousel generator',
  'LinkedIn comment generator',
  'LinkedIn profile analyzer',
  'AI content creator',
  'LinkedIn automation tool',
  'viral LinkedIn posts',
  'LinkedIn growth tool',
  'LinkedIn AI assistant'
];

// Secondary Keywords
export const SECONDARY_KEYWORDS = [
  'LinkedIn marketing',
  'social media content',
  'creator economy tools',
  'LinkedIn engagement',
  'professional networking',
  'content marketing AI',
  'LinkedIn analytics',
  'thought leadership',
  'personal branding',
  'B2B marketing tools'
];

// Default SEO Configuration
export const DEFAULT_SEO = {
  title: 'LinkedInPulse - AI-Powered LinkedIn Content Generator | Create Viral Posts',
  description: 'Create viral-worthy LinkedIn posts, comments, and carousels with AI that sounds authentically like you. Join 1000+ creators boosting their LinkedIn presence with LinkedInPulse.',
  keywords: PRIMARY_KEYWORDS.join(', '),
  author: 'LinkedInPulse Team',
  image: `${SITE_URL}/og-image.png`,
  imageAlt: 'LinkedInPulse - AI LinkedIn Content Generator',
  twitterHandle: '@linkedinpulse',
  locale: 'en_US',
  type: 'website'
};

// Page-Specific SEO
export const PAGE_SEO = {
  home: {
    title: 'LinkedInPulse - AI LinkedIn Post Generator | Create Viral Content in Seconds',
    description: 'Transform your LinkedIn presence with AI-powered content generation. Create engaging posts, viral comments, and professional carousels that sound authentically like you. Free trial available.',
    keywords: 'LinkedIn post generator, AI LinkedIn tool, viral LinkedIn content, LinkedIn automation, content marketing AI',
    canonical: SITE_URL
  },
  
  pricing: {
    title: 'Pricing Plans - LinkedInPulse | Affordable LinkedIn AI Tools',
    description: 'Choose the perfect plan for your LinkedIn growth. Starter at $12/month or Pro at $24/month. 7-day free trial, no credit card required. Cancel anytime.',
    keywords: 'LinkedIn tool pricing, AI content generator cost, LinkedIn subscription, content marketing pricing',
    canonical: `${SITE_URL}/pricing`
  },
  
  postGenerator: {
    title: 'AI LinkedIn Post Generator - Create Viral Posts Instantly | LinkedInPulse',
    description: 'Generate engaging LinkedIn posts with AI trained on 50K+ viral posts. 15 curated personas, smart formatting, zero-edit content. Start creating in seconds.',
    keywords: 'LinkedIn post generator, AI post creator, viral post generator, LinkedIn content AI, automated post creation',
    canonical: `${SITE_URL}/post-generator`
  },
  
  commentGenerator: {
    title: 'LinkedIn Comment Generator - AI Engagement Tool | LinkedInPulse',
    description: 'Build authentic professional relationships with AI-generated comments. Context-aware, human-like responses that boost your LinkedIn engagement instantly.',
    keywords: 'LinkedIn comment generator, AI engagement tool, automated comments, LinkedIn networking, comment AI',
    canonical: `${SITE_URL}/comment-generator`
  },
  
  profileAnalyzer: {
    title: 'LinkedIn Profile Analyzer - Free Profile Score & Optimization | LinkedInPulse',
    description: 'Get your LinkedIn profile score and actionable optimization tips. AI-powered analysis to boost visibility, engagement, and professional opportunities.',
    keywords: 'LinkedIn profile analyzer, profile optimization, LinkedIn score, profile tips, LinkedIn SEO',
    canonical: `${SITE_URL}/profile-analyzer`
  },
  
  waitlist: {
    title: 'Join the Waitlist - Be First to Access LinkedInPulse Premium',
    description: 'Join 500+ professionals waiting for LinkedInPulse premium features. Get exclusive early bird pricing and priority access when we launch.',
    keywords: 'LinkedInPulse waitlist, early access, beta signup, LinkedIn tool launch',
    canonical: `${SITE_URL}/waitlist`
  },
  
  faq: {
    title: 'FAQ - Frequently Asked Questions | LinkedInPulse',
    description: 'Find answers to common questions about LinkedInPulse AI content generation, pricing, features, and LinkedIn best practices.',
    keywords: 'LinkedInPulse FAQ, LinkedIn tool questions, AI content help, support',
    canonical: `${SITE_URL}/faq`
  },
  
  blog: {
    title: 'Blog - LinkedIn Tips, AI Content Strategy & Creator Growth | LinkedInPulse',
    description: 'Expert insights on LinkedIn growth, AI content creation, viral post strategies, and creator economy trends. Learn from top LinkedIn creators.',
    keywords: 'LinkedIn blog, content marketing tips, viral post strategy, LinkedIn growth, creator economy',
    canonical: `${SITE_URL}/blog`
  },
  
  register: {
    title: 'Sign Up Free - Start Your 7-Day Trial | LinkedInPulse',
    description: 'Create your free LinkedInPulse account. No credit card required. Start generating viral LinkedIn content in seconds. Join 1000+ creators.',
    keywords: 'LinkedIn tool signup, free trial, AI content free, register LinkedInPulse',
    canonical: `${SITE_URL}/auth/register`
  }
};

// Schema.org Organization Data
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': SITE_NAME,
  'applicationCategory': 'BusinessApplication',
  'operatingSystem': 'Web',
  'offers': {
    '@type': 'AggregateOffer',
    'priceCurrency': 'USD',
    'lowPrice': '0',
    'highPrice': '24',
    'offerCount': '3'
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'ratingCount': '1000',
    'bestRating': '5',
    'worstRating': '1'
  },
  'url': SITE_URL,
  'description': DEFAULT_SEO.description,
  'image': DEFAULT_SEO.image,
  'author': {
    '@type': 'Organization',
    'name': SITE_NAME
  }
};

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}

// FAQ Schema Generator
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

// Product Schema for Tools
export function generateProductSchema(product: {
  name: string;
  description: string;
  price: number;
  currency: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'brand': {
      '@type': 'Brand',
      'name': SITE_NAME
    },
    'offers': {
      '@type': 'Offer',
      'price': product.price,
      'priceCurrency': product.currency,
      'availability': 'https://schema.org/InStock',
      'url': SITE_URL
    }
  };
}

// Article Schema for Blog Posts
export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.description,
    'image': article.image,
    'author': {
      '@type': 'Person',
      'name': article.author
    },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_URL}/logo.svg`
      }
    },
    'datePublished': article.datePublished,
    'dateModified': article.dateModified,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': article.url
    }
  };
}

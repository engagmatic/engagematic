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
  'AI LinkedIn posts',
  'LinkedIn content generator',
  'LinkedIn post scheduler',
  'LinkedIn automation',
  'AI LinkedIn content',
  'LinkedIn carousel generator',
  'LinkedIn comment generator',
  'LinkedIn profile analyzer',
  'AI content creator',
  'LinkedIn automation tool',
  'viral LinkedIn posts',
  'LinkedIn growth tool',
  'LinkedIn AI assistant',
  'LinkedIn content creator',
  'LinkedIn marketing tool',
  'LinkedIn AI tool',
  'LinkedIn post creator',
  'LinkedIn content automation',
  'LinkedIn engagement tool'
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

// Brand Misspellings and Variations
export const BRAND_VARIATIONS = [
  'LinkedInPulse',
  'LinkedIn Pulse',
  'LinkedInPulse AI',
  'LinkedIn Pulse AI',
  'LinkedInPulse tool',
  'LinkedIn Pulse tool',
  'LinkedInPulse app',
  'LinkedIn Pulse app',
  'LinkedInPulse software',
  'LinkedIn Pulse software',
  'LinkedInPulse platform',
  'LinkedIn Pulse platform'
];

// Competitive Keywords
export const COMPETITIVE_KEYWORDS = [
  // Direct Competitors
  'LinkedInPulse vs Taplio',
  'LinkedInPulse vs Hootsuite',
  'LinkedInPulse vs ChatGPT',
  'LinkedInPulse vs AuthoredUp',
  'LinkedInPulse vs Kleo',
  'LinkedInPulse vs Buffer',
  'LinkedInPulse vs Sprout Social',
  'LinkedInPulse vs Later',
  'LinkedInPulse vs CoSchedule',
  'LinkedInPulse vs Canva',
  
  // Alternative Tools
  'Taplio alternative',
  'Hootsuite alternative',
  'Buffer alternative',
  'Sprout Social alternative',
  'Later alternative',
  'CoSchedule alternative',
  'Canva alternative',
  'ChatGPT alternative LinkedIn',
  'AuthoredUp alternative',
  'Kleo alternative',
  
  // Tool Comparisons
  'best LinkedIn automation tool',
  'best LinkedIn content generator',
  'best LinkedIn post scheduler',
  'best LinkedIn AI tool',
  'best LinkedIn marketing tool',
  'LinkedIn automation tools comparison',
  'LinkedIn content tools comparison',
  'LinkedIn AI tools comparison',
  'LinkedIn marketing tools comparison',
  'LinkedIn post generators comparison'
];

// Long-tail Keywords
export const LONG_TAIL_KEYWORDS = [
  'how to create viral LinkedIn posts',
  'how to generate LinkedIn content with AI',
  'how to automate LinkedIn posts',
  'how to schedule LinkedIn content',
  'how to optimize LinkedIn profile',
  'how to grow LinkedIn following',
  'how to increase LinkedIn engagement',
  'how to build LinkedIn presence',
  'how to create LinkedIn content strategy',
  'how to use AI for LinkedIn marketing',
  'best practices for LinkedIn content',
  'LinkedIn content creation tips',
  'LinkedIn marketing strategies',
  'LinkedIn automation best practices',
  'LinkedIn AI content generation',
  'LinkedIn post optimization techniques',
  'LinkedIn engagement strategies',
  'LinkedIn profile optimization guide',
  'LinkedIn content calendar planning',
  'LinkedIn thought leadership content'
];

// Industry-Specific Keywords
export const INDUSTRY_KEYWORDS = [
  'LinkedIn for startups',
  'LinkedIn for SaaS companies',
  'LinkedIn for agencies',
  'LinkedIn for consultants',
  'LinkedIn for freelancers',
  'LinkedIn for recruiters',
  'LinkedIn for sales teams',
  'LinkedIn for marketers',
  'LinkedIn for founders',
  'LinkedIn for CEOs',
  'LinkedIn for entrepreneurs',
  'LinkedIn for B2B companies',
  'LinkedIn for tech companies',
  'LinkedIn for healthcare',
  'LinkedIn for finance',
  'LinkedIn for real estate',
  'LinkedIn for education',
  'LinkedIn for nonprofits',
  'LinkedIn for e-commerce',
  'LinkedIn for manufacturing'
];

// Problem-Solving Keywords
export const PROBLEM_KEYWORDS = [
  'LinkedIn shadowbanning prevention',
  'LinkedIn algorithm changes 2025',
  'LinkedIn content not getting views',
  'LinkedIn posts not engaging',
  'LinkedIn profile not visible',
  'LinkedIn connection requests ignored',
  'LinkedIn content ideas exhausted',
  'LinkedIn posting frequency optimal',
  'LinkedIn hashtag strategy',
  'LinkedIn video content best practices',
  'LinkedIn carousel post creation',
  'LinkedIn article writing tips',
  'LinkedIn company page optimization',
  'LinkedIn personal branding mistakes',
  'LinkedIn networking strategies',
  'LinkedIn lead generation techniques',
  'LinkedIn sales prospecting content',
  'LinkedIn recruitment content',
  'LinkedIn thought leadership positioning',
  'LinkedIn content calendar management'
];

// Combined Keywords for SEO
export const ALL_KEYWORDS = [
  ...PRIMARY_KEYWORDS,
  ...SECONDARY_KEYWORDS,
  ...BRAND_VARIATIONS,
  ...COMPETITIVE_KEYWORDS,
  ...LONG_TAIL_KEYWORDS,
  ...INDUSTRY_KEYWORDS,
  ...PROBLEM_KEYWORDS
];

// Default SEO Configuration
export const DEFAULT_SEO = {
  title: 'LinkedInPulse - AI LinkedIn Post Generator | Viral Content',
  description: 'Create viral-worthy LinkedIn posts, comments, and carousels with AI that sounds authentically like you. Join 1000+ creators boosting their LinkedIn presence with LinkedInPulse.',
  keywords: ALL_KEYWORDS.join(', '),
  author: 'LinkedInPulse Team',
  image: `${SITE_URL}/og-default.png`, // Default OG image for all pages
  imageAlt: 'LinkedInPulse - AI LinkedIn Content Generator',
  twitterHandle: '@linkedinpulse',
  locale: 'en_US',
  type: 'website'
};

// Page-Specific SEO
export const PAGE_SEO = {
  home: {
    title: 'LinkedInPulse - AI LinkedIn Post Generator | Best AI Tool',
    description: 'Transform your LinkedIn presence with AI-powered content generation. Create engaging posts, viral comments, and professional carousels that sound authentically like you. Free trial available. The best AI tools for creating LinkedIn content for businesses. Generate LinkedIn posts with AI, schedule content, and optimize engagement.',
    keywords: 'LinkedIn post generator, AI LinkedIn tool, viral LinkedIn content, LinkedIn automation, content marketing AI, LinkedInPulse vs Taplio, LinkedInPulse vs Hootsuite, best LinkedIn AI tool, LinkedIn content creator, LinkedIn post scheduler, best AI tools for LinkedIn content, AI services that generate LinkedIn posts, AI platforms for LinkedIn content, AI-powered LinkedIn content personalization, LinkedIn content creation AI, LinkedIn post performance analysis AI, LinkedIn content automation AI, LinkedIn B2B content AI',
    canonical: SITE_URL,
    image: `${SITE_URL}/og-home.png` // Special home page OG image
  },
  
  pricing: {
    title: 'LinkedInPulse Pricing - Affordable AI Tools',
    description: 'Choose the perfect plan for your LinkedIn growth. Starter at $12/month or Pro at $24/month. 7-day free trial, no credit card required. Cancel anytime.',
    keywords: 'LinkedIn tool pricing, AI content generator cost, LinkedIn subscription, content marketing pricing',
    canonical: `${SITE_URL}/pricing`
  },
  
  postGenerator: {
    title: 'AI LinkedIn Post Generator - Viral Posts | LinkedInPulse',
    description: 'Generate engaging LinkedIn posts with AI trained on 50K+ viral posts. 15 curated personas, smart formatting, zero-edit content. Start creating in seconds. Best AI tool for LinkedIn content creation for businesses and marketing teams.',
    keywords: 'LinkedIn post generator, AI post creator, viral post generator, LinkedIn content AI, automated post creation, best AI tools for LinkedIn content, AI services that generate LinkedIn posts for marketing, AI platforms that schedule LinkedIn content, AI-powered LinkedIn content personalization, LinkedIn content creation AI, LinkedIn post performance analysis AI, LinkedIn content automation AI, LinkedIn B2B content AI',
    canonical: `${SITE_URL}/post-generator`
  },
  
  commentGenerator: {
    title: 'LinkedIn Comment Generator - AI Tool',
    description: 'Build authentic professional relationships with AI-generated comments. Context-aware, human-like responses that boost your LinkedIn engagement instantly.',
    keywords: 'LinkedIn comment generator, AI engagement tool, automated comments, LinkedIn networking, comment AI',
    canonical: `${SITE_URL}/comment-generator`
  },
  
  profileAnalyzer: {
    title: 'LinkedIn Profile Analyzer - Free Score',
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

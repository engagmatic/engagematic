/**
 * SEO Constants and Keywords for Engagematic
 * Centralized SEO configuration for consistency across all pages
 */

// Primary Brand
export const SITE_NAME = 'Engagematic';
export const SITE_URL = 'https://www.engagematic.com';
export const SITE_DOMAIN = 'engagematic.com';

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
  'Engagematic',
  'Engagematic AI',
  'Engagematic tool',
  'Engagematic app',
  'Engagematic software',
  'Engagematic platform'
];

// Competitive Keywords
export const COMPETITIVE_KEYWORDS = [
  // Direct Competitors
  'Engagematic vs Taplio',
  'Engagematic vs Hootsuite',
  'Engagematic vs ChatGPT',
  'Engagematic vs AuthoredUp',
  'Engagematic vs Kleo',
  'Engagematic vs Buffer',
  'Engagematic vs Sprout Social',
  'Engagematic vs Later',
  'Engagematic vs CoSchedule',
  'Engagematic vs Canva',
  
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
  title: 'Engagematic - AI LinkedIn Post Generator | Viral Content',
  description: 'Create viral-worthy LinkedIn posts, comments, and carousels with AI that sounds authentically like you. Join 1000+ creators boosting their LinkedIn presence with Engagematic.',
  keywords: ALL_KEYWORDS.join(', '),
  author: 'Engagematic Team',
  image: `${SITE_URL}/og-default.png`, // Default OG image for all pages
  imageAlt: 'Engagematic - AI LinkedIn Content Generator',
  twitterHandle: '@engagematic',
  locale: 'en_US',
  type: 'website'
};

// Page-Specific SEO
export const PAGE_SEO = {
  home: {
    title: 'Engagematic - AI LinkedIn Post Generator | Best AI Tool',
    description: 'Transform your LinkedIn presence with AI-powered content generation. Create engaging posts, viral comments, and professional carousels that sound authentically like you. Free trial available. The best AI tools for creating LinkedIn content for businesses. Generate LinkedIn posts with AI, schedule content, and optimize engagement.',
    keywords: 'LinkedIn post generator, AI LinkedIn tool, viral LinkedIn content, LinkedIn automation, content marketing AI, Engagematic vs Taplio, Engagematic vs Hootsuite, best LinkedIn AI tool, LinkedIn content creator, LinkedIn post scheduler, best AI tools for LinkedIn content, AI services that generate LinkedIn posts, AI platforms for LinkedIn content, AI-powered LinkedIn content personalization, LinkedIn content creation AI, LinkedIn post performance analysis AI, LinkedIn content automation AI, LinkedIn B2B content AI',
    canonical: SITE_URL,
    image: `${SITE_URL}/og-home.png` // Special home page OG image
  },
  
  pricing: {
    title: 'Engagematic Pricing - Affordable AI Tools',
    description: 'Choose the perfect plan for your LinkedIn growth. Starter at $12/month or Pro at $24/month. 7-day free trial, no credit card required. Cancel anytime.',
    keywords: 'LinkedIn tool pricing, AI content generator cost, LinkedIn subscription, content marketing pricing',
    canonical: `${SITE_URL}/pricing`
  },
  
  postGenerator: {
    title: 'AI LinkedIn Post Generator - Viral Posts | Engagematic',
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

  // Free Tools Pages - SEO Optimized
  freeTools: {
    title: 'Free LinkedIn Tools - Profile Analyzer, Post Generator & More | Engagematic',
    description: 'Access 100% free LinkedIn tools: Profile Analyzer, Post Generator, Comment Generator, and Idea Generator. No signup required. Get instant AI-powered LinkedIn optimization and content creation tools.',
    keywords: 'free linkedin tools, free linkedin profile analyzer, free linkedin post generator, free linkedin comment generator, free linkedin idea generator, linkedin tools free, linkedin content generator free, linkedin profile checker free',
    canonical: `${SITE_URL}/tools`
  },

  linkedinProfileAnalyzerTool: {
    title: 'Free LinkedIn Profile Analyzer - Get Your Profile Score & Optimization Tips | Engagematic',
    description: 'Analyze your LinkedIn profile for free. Get instant AI-powered score (0-100), headline optimization, about section rewrite, skills recommendations, and exportable PDF report. No signup required for first analysis.',
    keywords: 'free linkedin profile analyzer, linkedin profile score, linkedin profile checker, linkedin profile optimization, linkedin profile analyzer free, linkedin profile analyzer tool, linkedin profile analysis, linkedin profile review, linkedin profile audit, linkedin profile grader',
    canonical: `${SITE_URL}/tools/linkedin-profile-analyzer`
  },

  linkedinPostGeneratorTool: {
    title: 'Free LinkedIn Post Generator - AI-Powered Viral Posts | Engagematic',
    description: 'Generate viral LinkedIn posts in seconds with AI trained on 50,000+ high-performing posts. Free post generator with 15+ personas, viral hooks, and zero-edit ready content. No signup required.',
    keywords: 'free linkedin post generator, linkedin post generator ai, linkedin content generator, ai linkedin posts, linkedin post creator, linkedin post generator free, linkedin content generator free, linkedin ai tool, linkedin post maker, linkedin content creator',
    canonical: `${SITE_URL}/tools/linkedin-post-generator`
  },

  linkedinEngagementCalculator: {
    title: 'LinkedIn Engagement Rate Calculator (Free) – Measure & Improve Your Posts',
    description: 'Free LinkedIn engagement rate calculator and post engagement score tool for creators and marketers. Enter impressions and engagements to get your rate, benchmarks, and actionable tips.',
    keywords: 'linkedin engagement rate calculator, linkedin engagement rate, linkedin post engagement, free linkedin analytics, linkedin metrics, linkedin engagement calculator',
    canonical: `${SITE_URL}/tools/linkedin-engagement-rate-calculator`
  },

  linkedinTextFormatter: {
    title: 'LinkedIn Text Formatter (Free) – Bold, Italic & More for Posts',
    description: 'Format LinkedIn post text with bold, italic, underlined, strikethrough and more for free. Unicode-based styles work in LinkedIn. No login required.',
    keywords: 'linkedin text formatter, linkedin bold text, linkedin italic, format linkedin post, linkedin post formatter, free linkedin formatter, linkedin unicode text',
    canonical: `${SITE_URL}/tools/linkedin-text-formatter`
  },
  
  waitlist: {
    title: 'Join the Waitlist - Be First to Access Engagematic Premium',
    description: 'Join 500+ professionals waiting for Engagematic premium features. Get exclusive early bird pricing and priority access when we launch.',
    keywords: 'Engagematic waitlist, early access, beta signup, LinkedIn tool launch',
    canonical: `${SITE_URL}/waitlist`
  },
  
  faq: {
    title: 'FAQ - Frequently Asked Questions | Engagematic',
    description: 'Find answers to common questions about Engagematic AI content generation, pricing, features, and LinkedIn best practices.',
    keywords: 'Engagematic FAQ, LinkedIn tool questions, AI content help, support',
    canonical: `${SITE_URL}/faq`
  },
  
  blog: {
    title: 'Blog - LinkedIn Tips, AI Content Strategy & Creator Growth | Engagematic',
    description: 'Expert insights on LinkedIn growth, AI content creation, viral post strategies, and creator economy trends. Learn from top LinkedIn creators.',
    keywords: 'LinkedIn blog, content marketing tips, viral post strategy, LinkedIn growth, creator economy',
    canonical: `${SITE_URL}/blog`
  },
  
  register: {
    title: 'Sign Up Free - Start Your 7-Day Trial | Engagematic',
    description: 'Create your free Engagematic account. No credit card required. Start generating viral LinkedIn content in seconds. Join 1000+ creators.',
    keywords: 'LinkedIn tool signup, free trial, AI content free, register Engagematic',
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

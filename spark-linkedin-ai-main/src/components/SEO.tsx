import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: Record<string, unknown>;
}

export const SEO = ({
  title = "LinkedInPulse - AI-Powered LinkedIn Content Generator",
  description = "Stop staring at blank screens! LinkedInPulse uses AI to create engaging LinkedIn posts, comments, and content in 30 seconds. Join 500+ professionals growing their reach with authentic, viral-worthy content.",
  keywords = "LinkedIn content generator, AI LinkedIn posts, LinkedIn automation, social media content, LinkedIn marketing, content creation, viral posts, professional networking, LinkedIn growth, AI writing tool",
  image = "https://linkedinpulse.ai/og-image.png",
  url = "https://linkedinpulse.ai",
  type = "website",
  structuredData
}: SEOProps) => {
  const fullTitle = title.includes("LinkedInPulse") ? title : `${title} | LinkedInPulse`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="LinkedInPulse" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

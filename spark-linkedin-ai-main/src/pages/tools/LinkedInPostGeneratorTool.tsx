import { SEO } from "@/components/SEO";
import { PAGE_SEO } from "@/constants/seo";
import { SITE_URL, generateFAQSchema, generateBreadcrumbSchema } from "@/constants/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const faqData = [
  {
    question: "Is the LinkedIn Post Generator really free?",
    answer: "Yes! You can generate your first LinkedIn post completely free without any signup. Simply use the tool on our homepage or create a free account to save your posts and generate unlimited content. Premium plans offer advanced features like persona customization and bulk generation."
  },
  {
    question: "Do I need to create an account to use the post generator?",
    answer: "No account required for your first post! You can use the free post generator immediately. Creating a free account allows you to save your generated posts, access your content history, and customize your AI persona for more personalized content."
  },
  {
    question: "How does the AI post generator work?",
    answer: "Our AI is trained on 50,000+ viral LinkedIn posts to understand what drives engagement. Simply provide a topic, angle, or idea, and our AI generates multiple post variations optimized for LinkedIn's algorithm. You can choose from 15+ curated personas or create your own custom persona."
  },
  {
    question: "Can I customize the generated posts?",
    answer: "Absolutely! All generated posts are fully editable. You can modify the content, adjust the tone, add your personal touch, or combine elements from different variations. The AI provides a strong foundation that you can customize to match your unique voice."
  },
  {
    question: "What makes these posts different from ChatGPT?",
    answer: "Unlike generic AI tools, our post generator is specifically trained on viral LinkedIn content. It understands LinkedIn's algorithm, B2B marketing dynamics, engagement patterns, and what actually works on the platform. Every post is optimized for LinkedIn, not just generic social media content."
  },
  {
    question: "Can I use generated posts for commercial purposes?",
    answer: "Yes! All generated content can be used for personal and commercial purposes. Whether you're a freelancer, entrepreneur, marketer, or business owner, you're free to use the generated posts on your LinkedIn profile or company page."
  }
];

const LinkedInPostGeneratorTool = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Free Tools", url: `${SITE_URL}/tools` },
    { name: "LinkedIn Post Generator", url: `${SITE_URL}/tools/linkedin-post-generator` }
  ]);

  const faqSchema = generateFAQSchema(faqData);

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Free LinkedIn Post Generator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "2800",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Create viral-worthy LinkedIn posts in seconds with AI trained on 50,000+ high-performing posts. No signup required for first post. Generate engaging, optimized content that sounds authentically like you.",
    "url": `${SITE_URL}/tools/linkedin-post-generator`,
    "featureList": [
      "AI-powered post generation",
      "15+ curated personas",
      "Viral hook suggestions",
      "Smart formatting",
      "Zero-edit ready content",
      "Multiple post variations",
      "Engagement optimization"
    ]
  };

  const structuredData = [toolSchema, breadcrumbSchema, faqSchema];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <SEO
        title={PAGE_SEO.linkedinPostGeneratorTool.title}
        description={PAGE_SEO.linkedinPostGeneratorTool.description}
        keywords={PAGE_SEO.linkedinPostGeneratorTool.keywords}
        url={`${SITE_URL}/tools/linkedin-post-generator`}
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
              <Sparkles className="w-3 h-3 mr-1" />
              100% Free - No Signup Required
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Free LinkedIn Post Generator AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Generate viral LinkedIn posts instantly with our free AI post generator. Trained on 50,000+ high-performing posts. 
              No signup required. Create engaging LinkedIn content in seconds. The best free LinkedIn post generator tool for creators, marketers, and professionals.
            </p>
            <Link to="/#free-generator">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Generate Free Post Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Why Our Post Generator Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Trained on 50K+ Viral Posts",
                description: "Our AI learned from thousands of high-performing LinkedIn posts to understand what actually drives engagement."
              },
              {
                icon: Sparkles,
                title: "15+ Curated Personas",
                description: "Choose from personas like 'Thought Leader', 'Startup Founder', 'Career Coach', or create your own custom persona."
              },
              {
                icon: Zap,
                title: "Instant Results",
                description: "Generate multiple post variations in seconds. No waiting, no delays. Get content ready to publish immediately."
              },
              {
                icon: FileText,
                title: "Zero-Edit Ready",
                description: "Posts are formatted perfectly for LinkedIn with proper line breaks, structure, and engagement-optimized formatting."
              },
              {
                icon: Users,
                title: "Algorithm Optimized",
                description: "Every post is optimized for LinkedIn's algorithm, using proven patterns that increase visibility and engagement."
              },
              {
                icon: CheckCircle2,
                title: "Fully Customizable",
                description: "Edit, modify, or combine generated posts to match your unique voice and style. Full creative control."
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Enter Your Topic or Idea",
                description: "Simply describe what you want to post about. It can be a topic, question, story, or any idea you have in mind."
              },
              {
                step: "2",
                title: "Choose Your Persona (Optional)",
                description: "Select from 15+ curated personas or use the default. Each persona has a unique writing style optimized for LinkedIn."
              },
              {
                step: "3",
                title: "AI Generates Multiple Variations",
                description: "Our AI creates multiple post variations in seconds, each optimized for engagement and LinkedIn's algorithm."
              },
              {
                step: "4",
                title: "Copy, Edit & Publish",
                description: "Choose your favorite variation, customize it if needed, and publish directly to LinkedIn. It's that simple!"
              }
            ].map((step) => (
              <Card key={step.step} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h2 className="text-3xl font-bold mb-6">What is a LinkedIn Post Generator?</h2>
            <p className="text-muted-foreground mb-4">
              A LinkedIn post generator is an AI-powered tool that helps you create engaging, professional LinkedIn content quickly and easily. Our free LinkedIn post generator uses advanced artificial intelligence trained on over 50,000 viral LinkedIn posts to understand what drives engagement on the platform.
            </p>
            <p className="text-muted-foreground mb-4">
              Unlike generic AI content generators, our LinkedIn post generator is specifically designed for LinkedIn's unique algorithm and B2B marketing dynamics. Whether you're a content creator, marketer, entrepreneur, or professional looking to grow your LinkedIn presence, our free LinkedIn post generator tool can help you create posts that resonate with your audience.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">Why Use Our Free LinkedIn Post Generator?</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>No Signup Required:</strong> Start generating LinkedIn posts immediately without creating an account</li>
              <li><strong>AI-Powered:</strong> Our LinkedIn post generator AI understands LinkedIn's algorithm and engagement patterns</li>
              <li><strong>Multiple Variations:</strong> Generate several post variations instantly to choose the best one</li>
              <li><strong>Persona-Based:</strong> Create posts in different styles using our curated personas or create your own</li>
              <li><strong>Viral-Worthy Content:</strong> Trained on 50,000+ high-performing posts to create engaging content</li>
              <li><strong>Fully Customizable:</strong> Edit and modify generated posts to match your unique voice</li>
            </ul>

            <h3 className="text-2xl font-bold mt-8 mb-4">How to Use the LinkedIn Post Generator</h3>
            <p className="text-muted-foreground mb-4">
              Using our free LinkedIn post generator is simple. Enter your topic, idea, or what you want to post about. Our AI LinkedIn post generator will create multiple post variations optimized for LinkedIn engagement. You can then copy, edit, and publish directly to LinkedIn.
            </p>
            <p className="text-muted-foreground mb-4">
              Our LinkedIn content generator is perfect for creating posts that drive engagement, build your professional brand, and grow your LinkedIn network. Whether you need LinkedIn post ideas, want to create viral LinkedIn content, or simply save time on content creation, our LinkedIn post creator tool has you covered.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">Best Free LinkedIn Post Generator Features</h3>
            <p className="text-muted-foreground mb-4">
              Our LinkedIn post generator free tool offers features that make it the best LinkedIn post generator available:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Instant post generation in seconds</li>
              <li>15+ curated personas for different writing styles</li>
              <li>Viral hook suggestions to increase engagement</li>
              <li>LinkedIn-optimized formatting and structure</li>
              <li>Multiple post variations to choose from</li>
              <li>No credit card or signup required</li>
            </ul>

            <p className="text-muted-foreground mt-6">
              Start using our free LinkedIn post generator today and create engaging LinkedIn content that drives results. No signup required, completely free, and optimized for LinkedIn's algorithm.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Create Viral LinkedIn Posts?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start generating your first post now. No signup required. Free forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/#free-generator">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Generate Free Post Now
              </Button>
            </Link>
            <Link to="/tools">
              <Button size="lg" variant="outline">
                View All Free Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LinkedInPostGeneratorTool;


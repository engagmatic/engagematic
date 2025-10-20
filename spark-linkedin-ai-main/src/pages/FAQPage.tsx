import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search, ChevronDown, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      icon: "🚀",
      questions: [
        {
          question: "How do I get started with LinkedInPulse?",
          answer: "Getting started is easy! Simply sign up for a free account, complete your profile, and create your first AI persona. Then you can start generating LinkedIn posts and comments right away. We recommend starting with our onboarding tutorial to get the most out of the platform."
        },
        {
          question: "Do I need any technical knowledge to use LinkedInPulse?",
          answer: "Not at all! LinkedInPulse is designed to be user-friendly for professionals of all technical levels. Our intuitive interface guides you through each step, and our AI handles the complex content generation for you."
        },
        {
          question: "Can I try LinkedInPulse before subscribing?",
          answer: "Yes! We offer a free trial that includes 5 posts and 10 comments per month. This gives you a chance to experience the full power of our AI content generation before committing to a paid plan."
        },
        {
          question: "What information do I need to provide during signup?",
          answer: "We only ask for essential information: your name, email address, and basic professional details. You can also optionally connect your LinkedIn profile to help us personalize your content better."
        }
      ]
    },
    {
      title: "AI Content Generation",
      icon: "🤖",
      questions: [
        {
          question: "How does the AI content generation work?",
          answer: "Our AI uses advanced language models trained on successful LinkedIn content patterns. It analyzes your persona, topic, and selected viral hooks to generate authentic, engaging content that sounds like you. The AI considers your industry, tone, and style preferences to create personalized posts and comments."
        },
        {
          question: "Will the AI-generated content sound robotic or fake?",
          answer: "No! Our AI is specifically trained to create authentic, human-like content. We use advanced techniques to ensure the content reflects your unique voice and personality. You can always edit and customize the generated content to make it even more personal."
        },
        {
          question: "Can I customize the AI's writing style?",
          answer: "Absolutely! You can create multiple personas with different writing styles, tones, and expertise areas. Each persona can be customized for different audiences or content types, giving you complete control over how the AI writes for you."
        },
        {
          question: "What types of content can the AI generate?",
          answer: "Our AI can generate LinkedIn posts, comments, viral hooks, and content ideas. It can create educational content, personal stories, industry insights, motivational posts, and more. The AI adapts to your specific needs and industry requirements."
        },
        {
          question: "How accurate and reliable is the AI content?",
          answer: "Our AI is highly accurate and continuously improved through machine learning. However, we always recommend reviewing and customizing the generated content to ensure it aligns with your specific goals and brand voice. The AI provides a strong foundation that you can build upon."
        }
      ]
    },
    {
      title: "Subscription & Billing",
      icon: "💳",
      questions: [
        {
          question: "What subscription plans do you offer?",
          answer: "We offer three main plans: Starter (free trial with 5 posts/month), Professional ($29/month with 50 posts/month), and Enterprise ($99/month with unlimited posts). Each plan includes different features like analytics, priority support, and advanced AI capabilities."
        },
        {
          question: "Can I change my subscription plan anytime?",
          answer: "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period. We'll prorate any charges accordingly."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual subscriptions. All payments are processed securely through our payment partners."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer refunds within 30 days of your initial subscription if you're not satisfied with our service. Refunds are processed within 5-7 business days. Contact our support team to request a refund."
        },
        {
          question: "What happens if I exceed my monthly limits?",
          answer: "If you exceed your monthly limits, you'll be notified and can either wait until the next billing cycle or upgrade your plan for additional capacity. We never cut off your access abruptly."
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: "🔒",
      questions: [
        {
          question: "Is my data secure with LinkedInPulse?",
          answer: "Absolutely! We use enterprise-grade security measures including SSL encryption, secure data centers, and regular security audits. Your data is encrypted both in transit and at rest, and we never share your personal information with third parties."
        },
        {
          question: "What data do you collect and how is it used?",
          answer: "We collect only the information necessary to provide our service: your profile information, content preferences, and usage analytics. This data is used to improve our AI models and personalize your experience. We never sell your data to third parties."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes! You can delete your account at any time from your account settings. This will permanently remove all your data from our systems within 30 days. You can also request a copy of your data before deletion."
        },
        {
          question: "Do you comply with data protection regulations?",
          answer: "Yes, we comply with GDPR, CCPA, and other major data protection regulations. We have comprehensive privacy policies and data protection measures in place to ensure your rights are protected."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: "🛠️",
      questions: [
        {
          question: "What if I encounter technical issues?",
          answer: "Our support team is here to help! You can contact us through our support portal, email, or live chat. We typically respond within 24 hours and offer priority support for paid subscribers."
        },
        {
          question: "Do you offer training or onboarding sessions?",
          answer: "Yes! We provide comprehensive onboarding tutorials, video guides, and webinars. Enterprise customers also receive dedicated training sessions and account management support."
        },
        {
          question: "Can I integrate LinkedInPulse with other tools?",
          answer: "Currently, we offer direct LinkedIn integration and export features. We're working on integrations with popular CRM and marketing tools. Contact us if you have specific integration needs."
        },
        {
          question: "What browsers and devices are supported?",
          answer: "LinkedInPulse works on all modern browsers (Chrome, Firefox, Safari, Edge) and is fully responsive for mobile and tablet devices. We recommend using the latest browser versions for the best experience."
        }
      ]
    },
    {
      title: "LinkedIn Integration",
      icon: "💼",
      questions: [
        {
          question: "How does LinkedIn integration work?",
          answer: "You can connect your LinkedIn profile to LinkedInPulse to get personalized content suggestions and seamless posting. The integration is secure and only accesses the information you explicitly grant permission for."
        },
        {
          question: "Can I post directly to LinkedIn from LinkedInPulse?",
          answer: "Yes! Once you connect your LinkedIn account, you can post content directly from LinkedInPulse. You can also schedule posts for optimal timing and review them before publishing."
        },
        {
          question: "Will LinkedIn know I'm using AI-generated content?",
          answer: "LinkedIn doesn't specifically detect AI-generated content, but we always recommend personalizing and customizing the content to make it authentically yours. Our AI is designed to create content that sounds natural and human."
        },
        {
          question: "Can I use LinkedInPulse for multiple LinkedIn accounts?",
          answer: "Yes! You can connect multiple LinkedIn accounts and manage them from a single LinkedInPulse account. This is especially useful for agencies or professionals managing multiple brands."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about LinkedInPulse. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Help Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="#getting-started">
              <Card className="p-4 gradient-card shadow-card hover-lift text-center cursor-pointer">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-semibold">Getting Started</h3>
              </Card>
            </Link>
            <Link to="#ai-content">
              <Card className="p-4 gradient-card shadow-card hover-lift text-center cursor-pointer">
                <div className="text-2xl mb-2">🤖</div>
                <h3 className="font-semibold">AI Content</h3>
              </Card>
            </Link>
            <Link to="#billing">
              <Card className="p-4 gradient-card shadow-card hover-lift text-center cursor-pointer">
                <div className="text-2xl mb-2">💳</div>
                <h3 className="font-semibold">Billing</h3>
              </Card>
            </Link>
            <Link to="#support">
              <Card className="p-4 gradient-card shadow-card hover-lift text-center cursor-pointer">
                <div className="text-2xl mb-2">🛠️</div>
                <h3 className="font-semibold">Support</h3>
              </Card>
            </Link>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} id={category.title.toLowerCase().replace(/\s+/g, '-')}>
              <Card className="gradient-card shadow-card">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-semibold">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pt-2">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* No Results */}
        {searchQuery && filteredCategories.length === 0 && (
          <Card className="p-8 gradient-card shadow-card text-center">
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try searching with different keywords or browse our categories above.
            </p>
            <Button onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </Card>
        )}

        {/* Contact Support */}
        <div className="mt-16">
          <Card className="p-8 gradient-card shadow-card text-center">
            <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our support team is here to help you succeed with LinkedInPulse. Get in touch and we'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline" size="lg">
                  Resources
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

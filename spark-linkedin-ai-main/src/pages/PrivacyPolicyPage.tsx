import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Lock, Database, Users, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-xl gradient-pulse flex items-center justify-center mx-auto mb-4 shadow-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Privacy{" "}
            <span className="gradient-pulse bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 15, 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Eye className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground mb-4">
                LinkedInPulse ("we," "our," or "us") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Service").
              </p>
              <p className="text-muted-foreground">
                By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use the Service.
              </p>
            </div>
          </div>
        </Card>

        {/* Information We Collect */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Database className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
                  <p className="text-muted-foreground mb-3">
                    We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Name and email address</li>
                    <li>Professional information (job title, company, industry)</li>
                    <li>LinkedIn profile information (with your permission)</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Content you create using our AI tools</li>
                    <li>Communication preferences and support requests</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Usage Information</h3>
                  <p className="text-muted-foreground mb-3">
                    We automatically collect certain information about your use of our Service:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage patterns and preferences</li>
                    <li>Content generation history and analytics</li>
                    <li>Performance metrics and engagement data</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* How We Use Information */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Users className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to provide, maintain, and improve our Service:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Provision</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Generate personalized LinkedIn content</li>
                    <li>Provide AI-powered writing assistance</li>
                    <li>Track usage quotas and subscription limits</li>
                    <li>Deliver customer support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Improvement</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Analyze usage patterns and preferences</li>
                    <li>Improve AI models and content quality</li>
                    <li>Develop new features and functionality</li>
                    <li>Conduct research and analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Information Sharing */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Lock className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Service Providers</h3>
                  <p className="text-muted-foreground">
                    We may share information with trusted third-party service providers who assist us in operating our Service, such as:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                    <li>Google AI (for content generation)</li>
                    <li>Razorpay (for payment processing)</li>
                    <li>MongoDB Atlas (for data storage)</li>
                    <li>Formspree (for contact forms)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Legal Requirements</h3>
                  <p className="text-muted-foreground">
                    We may disclose information if required by law or to protect our rights, property, or safety, or that of our users.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Transfers</h3>
                  <p className="text-muted-foreground">
                    In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Security */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Shield className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Technical Measures</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Encrypted data storage</li>
                    <li>Secure authentication systems</li>
                    <li>Regular security audits and updates</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Organizational Measures</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Access controls and user permissions</li>
                    <li>Employee training on data protection</li>
                    <li>Incident response procedures</li>
                    <li>Regular backup and recovery systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Your Rights */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Users className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-4">
                You have certain rights regarding your personal information:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold">Access and Portability</h3>
                    <p className="text-muted-foreground text-sm">Request a copy of your personal information in a portable format.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold">Correction</h3>
                    <p className="text-muted-foreground text-sm">Update or correct inaccurate personal information.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold">Deletion</h3>
                    <p className="text-muted-foreground text-sm">Request deletion of your personal information (subject to legal requirements).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold">Opt-out</h3>
                    <p className="text-muted-foreground text-sm">Unsubscribe from marketing communications and data processing.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Cookies */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Eye className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Essential Cookies</h3>
                  <p className="text-muted-foreground text-sm">Required for basic functionality, authentication, and security.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                  <p className="text-muted-foreground text-sm">Help us understand how you use our Service to improve performance.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Preference Cookies</h3>
                  <p className="text-muted-foreground text-sm">Remember your settings and preferences for a personalized experience.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* International Transfers */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Database className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">International Data Transfers</h2>
              <p className="text-muted-foreground mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Standard contractual clauses approved by relevant authorities</li>
                <li>Adequacy decisions by data protection authorities</li>
                <li>Certification schemes and codes of conduct</li>
                <li>Other legally recognized transfer mechanisms</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Children's Privacy */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Users className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </div>
          </div>
        </Card>

        {/* Changes to Policy */}
        <Card className="p-8 gradient-card shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Mail className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Sending you an email notification</li>
                <li>Updating the "Last updated" date at the top of this policy</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We encourage you to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-8 gradient-card shadow-card">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">privacy@linkedinpulse.com</p>
              </div>
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-muted-foreground">
                  LinkedInPulse Privacy Team<br />
                  123 Innovation Drive<br />
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/contact">
                <Button variant="outline">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

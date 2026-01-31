import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Scale, Shield, AlertTriangle, Users, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PAGE_SEO } from "@/constants/seo";

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen gradient-hero">
      <SEO {...PAGE_SEO.terms} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-pulse">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Please read these terms carefully before using Engagematic services.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 15, 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Scale className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                These Terms of Service ("Terms") govern your use of Engagematic's website, mobile application, and services (collectively, the "Service") operated by Engagematic ("us," "we," or "our").
              </p>
              <p className="text-muted-foreground mb-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
              <p className="text-muted-foreground">
                We reserve the right to update or change these Terms at any time. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </div>
          </div>
        </Card>

        {/* Service Description */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Users className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Service Description</h2>
              <p className="text-muted-foreground mb-4">
                Engagematic provides AI-powered content creation tools and services to help professionals build their LinkedIn presence. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>AI-generated LinkedIn posts and comments</li>
                <li>Content templates and viral hook suggestions</li>
                <li>Personal brand persona management</li>
                <li>Analytics and performance tracking</li>
                <li>Educational resources and best practices</li>
                <li>Community features and networking tools</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* User Accounts */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Shield className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">User Accounts and Registration</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Account Creation</h3>
                  <p className="text-muted-foreground mb-3">
                    To access certain features of our Service, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and update your account information</li>
                    <li>Keep your password secure and confidential</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Account Requirements</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>You must be at least 18 years old to create an account</li>
                    <li>One account per person or organization</li>
                    <li>No sharing of account credentials with others</li>
                    <li>Compliance with all applicable laws and regulations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Acceptable Use */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Acceptable Use Policy</h2>
              <p className="text-muted-foreground mb-4">
                You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Prohibited Activities</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Transmit harmful or malicious content</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use automated tools to access the Service</li>
                    <li>Resell or redistribute our Service</li>
                    <li>Create content that is defamatory, harassing, or discriminatory</li>
                    <li>Generate content for illegal or unethical purposes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Content Guidelines</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Ensure all generated content complies with LinkedIn's terms</li>
                    <li>Use content responsibly and ethically</li>
                    <li>Respect others' intellectual property rights</li>
                    <li>Maintain professional standards in all communications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription and Payment */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <FileText className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Subscription and Payment Terms</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Subscription Plans</h3>
                  <p className="text-muted-foreground mb-3">
                    We offer various subscription plans with different features and usage limits. All plans are subject to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Monthly or annual billing cycles</li>
                    <li>Automatic renewal unless cancelled</li>
                    <li>Usage quotas and limits as specified in your plan</li>
                    <li>Price changes with 30 days notice</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Payment Terms</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Payment is due in advance for each billing period</li>
                    <li>All fees are non-refundable except as required by law</li>
                    <li>Failed payments may result in service suspension</li>
                    <li>You are responsible for all applicable taxes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Cancellation and Refunds</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>You may cancel your subscription at any time</li>
                    <li>Cancellation takes effect at the end of the current billing period</li>
                    <li>No refunds for partial billing periods</li>
                    <li>We may offer refunds at our discretion for technical issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Intellectual Property */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Scale className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Intellectual Property Rights</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Our Intellectual Property</h3>
                  <p className="text-muted-foreground mb-3">
                    The Service and its original content, features, and functionality are owned by Engagematic and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Your Content Rights</h3>
                  <p className="text-muted-foreground mb-3">
                    You retain ownership of any content you create using our Service. By using our Service, you grant us a limited license to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Process and store your content to provide the Service</li>
                    <li>Use anonymized data to improve our AI models</li>
                    <li>Generate derivative works for your benefit</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">AI-Generated Content</h3>
                  <p className="text-muted-foreground">
                    Content generated by our AI tools is provided for your use. You are responsible for ensuring such content complies with all applicable laws and platform terms. We do not claim ownership of AI-generated content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy and Data */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Shield className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Privacy and Data Protection</h2>
              <p className="text-muted-foreground mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="text-muted-foreground mb-4">
                By using our Service, you consent to the collection and use of information as described in our Privacy Policy.
              </p>
              <div className="mt-4">
                <Link to="/privacy">
                  <Button variant="outline">
                    View Privacy Policy
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Service Availability */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Service Availability and Modifications</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Service Availability</h3>
                  <p className="text-muted-foreground">
                    We strive to maintain high service availability but cannot guarantee uninterrupted access. We may experience downtime for maintenance, updates, or technical issues.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Service Modifications</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to modify, suspend, or discontinue any part of our Service at any time with or without notice. We are not liable for any loss or damage resulting from such changes.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Feature Updates</h3>
                  <p className="text-muted-foreground">
                    We continuously improve our Service and may add, modify, or remove features. We will provide reasonable notice of significant changes that affect your use of the Service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Limitation of Liability */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                To the maximum extent permitted by law, Engagematic shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages resulting from use or inability to use the Service</li>
                <li>Damages resulting from unauthorized access to your account</li>
                <li>Damages resulting from content generated by our AI tools</li>
                <li>Any other damages arising from these Terms or the Service</li>
              </ul>
              <p className="text-muted-foreground">
                Our total liability to you for any claims arising from these Terms or the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </div>
          </div>
        </Card>

        {/* Termination */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <FileText className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Termination by You</h3>
                  <p className="text-muted-foreground">
                    You may terminate your account and stop using our Service at any time by cancelling your subscription and deleting your account.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Termination by Us</h3>
                  <p className="text-muted-foreground">
                    We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Effect of Termination</h3>
                  <p className="text-muted-foreground">
                    Upon termination, your right to use the Service will cease immediately. We may delete your account and data, though we may retain certain information as required by law or for legitimate business purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Governing Law */}
        <Card className="p-8 shadow-card mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Scale className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Governing Law and Disputes</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Governing Law</h3>
                  <p className="text-muted-foreground">
                    These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Dispute Resolution</h3>
                  <p className="text-muted-foreground">
                    Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Class Action Waiver</h3>
                  <p className="text-muted-foreground">
                    You agree that any arbitration or legal proceeding will be conducted on an individual basis and not as a class action or other representative proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-8 shadow-card mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">legal@engagematic.com</p>
              </div>
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-muted-foreground">
                  Engagematic Legal Team<br />
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

        {/* LinkedIn Disclaimer */}
        <Card className="p-6 shadow-card">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Engagematic© is not affiliated, associated, authorized, endorsed by, or in any way officially connected with LinkedIn Corporation. LinkedIn is a registered trademark of LinkedIn Corporation in the U.S. and other countries.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServicePage;

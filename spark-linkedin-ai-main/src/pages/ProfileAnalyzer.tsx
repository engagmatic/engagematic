import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  Download,
  Sparkles,
  Target,
  Award,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "../services/api";

const ProfileAnalyzer = () => {
  const [profileUrl, setProfileUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedSection, setCopiedSection] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!profileUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter your LinkedIn profile URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await apiClient.request("/profile-analyzer/analyze", {
        method: "POST",
        body: JSON.stringify({ profileUrl }),
      });

      if (response.success) {
        setAnalysis(response.data);
        toast({
          title: "Analysis Complete! 🎉",
          description: "Your profile has been analyzed",
        });
      } else {
        throw new Error(response.message || "Analysis failed");
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze profile",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
    setTimeout(() => setCopiedSection(""), 2000);
  };

  const handleExportPDF = async () => {
    if (!analysis || !analysis.id) {
      toast({
        title: "No Analysis Available",
        description: "Please analyze a profile first",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your report",
      });

      // Get token for authenticated request
      const token = localStorage.getItem('token');
      
      // Fetch PDF from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile-analyzer/export-pdf/${analysis.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LinkedIn_Profile_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Downloaded! 🎉",
        description: "Your analysis report has been saved",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Poor";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            LinkedIn Profile{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Analyzer
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered insights and recommendations to optimize your LinkedIn profile for maximum visibility and engagement
          </p>
        </div>

        {/* URL Input */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileUrl" className="text-lg font-semibold">
                LinkedIn Profile URL
              </Label>
              <div className="flex gap-3">
                <Input
                  id="profileUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  disabled={isAnalyzing}
                  className="flex-1 text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  size="lg"
                  className="gap-2 shadow-pulse hover-pulse"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="h-5 w-5" />
                      Analyze Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground mb-1">
                  Enter your public LinkedIn profile URL to get started
                </p>
                {analysis?.subscription && (
                  <p className="text-xs text-muted-foreground">
                    {analysis.subscription.limit === -1 ? (
                      <span className="text-green-600 font-medium">Unlimited analyses</span>
                    ) : (
                      <span>
                        {analysis.subscription.remaining} of {analysis.subscription.limit} analyses remaining
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Score Dashboard */}
            <Card className="p-8 border-2">
              <div className="text-center mb-8">
                <div className={`text-7xl font-bold mb-2 ${getScoreColor(analysis.scores.overall)}`}>
                  {analysis.scores.overall}
                  <span className="text-3xl text-muted-foreground">/100</span>
                </div>
                <p className="text-xl text-muted-foreground mb-4">
                  Overall Profile Score - <span className="font-semibold">{getScoreLabel(analysis.scores.overall)}</span>
                </p>
                <Progress value={analysis.scores.overall} className="h-3 max-w-md mx-auto" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(analysis.scores)
                  .filter(([key]) => key !== "overall")
                  .map(([key, value]) => (
                    <div key={key} className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">{value}</div>
                      <div className="text-sm text-muted-foreground capitalize">{key}</div>
                      <Progress value={value * 10} className="h-1 mt-2" />
                    </div>
                  ))}
              </div>
            </Card>

            {/* Recommendations Tabs */}
            <Tabs defaultValue="headlines" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="headlines">Headlines</TabsTrigger>
                <TabsTrigger value="about">About Section</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
                <TabsTrigger value="insights">Industry Insights</TabsTrigger>
              </TabsList>

              {/* Headlines */}
              <TabsContent value="headlines" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold">Optimized Headlines</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Choose one of these AI-generated headlines to make a stronger first impression
                  </p>
                  <div className="space-y-3">
                    {analysis.recommendations.headlines?.map((headline, i) => (
                      <div
                        key={i}
                        className="p-4 bg-muted/50 rounded-lg border-2 border-border hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="flex-1 text-base">{headline}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(headline, `headline-${i}`)}
                            className="gap-2"
                          >
                            {copiedSection === `headline-${i}` ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {copiedSection === `headline-${i}` ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* About Section */}
              <TabsContent value="about" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold">Optimized About Section</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    AI-generated about section with storytelling, achievements, and a clear call-to-action
                  </p>
                  <div className="p-6 bg-muted/50 rounded-lg border-2 border-border">
                    <p className="whitespace-pre-wrap text-base leading-relaxed mb-4">
                      {analysis.recommendations.aboutSection}
                    </p>
                    <Button
                      onClick={() => copyToClipboard(analysis.recommendations.aboutSection, "about")}
                      className="gap-2"
                    >
                      {copiedSection === "about" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedSection === "about" ? "Copied!" : "Copy About Section"}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Skills */}
              <TabsContent value="skills" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold">Recommended Skills</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Add these skills to improve your profile's searchability
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.recommendations.skills?.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(analysis.recommendations.skills?.join(", "), "skills")}
                    className="gap-2"
                  >
                    {copiedSection === "skills" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copy All Skills
                  </Button>

                  <div className="mt-8">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      SEO Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.recommendations.keywords?.map((keyword, i) => (
                        <Badge key={i} className="text-sm px-3 py-1 bg-primary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Improvements */}
              <TabsContent value="improvements" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold">Action Items</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Prioritized recommendations to improve your profile
                  </p>
                  <div className="space-y-3">
                    {analysis.recommendations.improvements?.map((improvement, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border-2 ${
                          improvement.priority === "high"
                            ? "bg-red-50 border-red-200"
                            : improvement.priority === "medium"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Badge
                            variant={
                              improvement.priority === "high"
                                ? "destructive"
                                : improvement.priority === "medium"
                                ? "secondary"
                                : "default"
                            }
                            className="mt-0.5"
                          >
                            {improvement.priority}
                          </Badge>
                          <div className="flex-1">
                            <div className="font-semibold capitalize mb-1">{improvement.category}</div>
                            <p className="text-sm mb-2">{improvement.suggestion}</p>
                            {improvement.expectedImpact && (
                              <div className="flex items-start gap-2 mt-2 p-2 bg-white/50 rounded border border-primary/20">
                                <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-primary font-medium">
                                  Expected Impact: {improvement.expectedImpact}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Industry Insights */}
              <TabsContent value="insights" className="space-y-4">
                {analysis.recommendations.industryInsights ? (
                  <>
                    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple/5">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">Current Industry Trends</h3>
                      </div>
                      <div className="space-y-3">
                        {analysis.recommendations.industryInsights.trends?.map((trend, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">{i + 1}</span>
                            </div>
                            <p className="text-sm flex-1">{trend}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6 border-2 border-green-200 bg-green-50">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-green-600" />
                        <h3 className="text-xl font-bold text-green-900">Opportunities</h3>
                      </div>
                      <p className="text-base text-green-800 leading-relaxed">
                        {analysis.recommendations.industryInsights.opportunities}
                      </p>
                    </Card>

                    <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="h-5 w-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-blue-900">Competitive Edge</h3>
                      </div>
                      <p className="text-base text-blue-800 leading-relaxed">
                        {analysis.recommendations.industryInsights.competitiveEdge}
                      </p>
                    </Card>
                  </>
                ) : (
                  <Card className="p-6">
                    <p className="text-muted-foreground text-center">
                      Industry insights not available for this analysis
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Export Actions */}
            <Card className="p-6">
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gap-2" onClick={handleExportPDF}>
                  <Download className="h-5 w-5" />
                  Export as PDF
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => {
                    setAnalysis(null);
                    setProfileUrl("");
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                  Analyze Another Profile
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAnalyzer;


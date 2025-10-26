import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  ExternalLink, 
  User, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Star, 
  Brain, 
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Search,
  Award,
  Users,
  MessageSquare,
  BarChart3,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const LinkedInProfileAnalyzer = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyzeProfile = async () => {
    if (!profileUrl.trim()) {
      toast.error('Please enter a LinkedIn profile URL');
      return;
    }

    if (!profileUrl.includes('linkedin.com/in/')) {
      toast.error('Please enter a valid LinkedIn profile URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const response = await fetch('http://localhost:5000/api/profile-analyzer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ profileUrl })
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisData(result.data);
        toast.success('Profile analysis completed successfully!');
      } else {
        setError(result.message || result.error || 'Analysis failed');
        toast.error(result.message || result.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error occurred');
      toast.error('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAnalyzer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/profile-analyzer/test');
      const result = await response.json();
      
      if (result.success) {
        toast.success('LinkedIn Profile Analyzer is ready!');
      } else {
        toast.error('Analyzer test failed');
      }
    } catch (err) {
      toast.error('Analyzer test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          LinkedIn Profile Analyzer
        </h1>
        <p className="text-lg text-muted-foreground">
          World-class AI-powered LinkedIn profile analysis with actionable insights for recruiters and industry standards
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-6 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Search className="h-6 w-6 text-blue-600" />
            Profile Analysis
          </CardTitle>
          <CardDescription className="text-base">
            Enter a LinkedIn profile URL to get comprehensive AI-powered analysis with actionable insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profileUrl" className="text-sm font-medium">LinkedIn Profile URL</Label>
            <Input
              id="profileUrl"
              type="url"
              placeholder="https://www.linkedin.com/in/username"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              disabled={isLoading}
              className="text-base"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAnalyzeProfile} 
              disabled={isLoading || !profileUrl.trim()}
              className="flex-1 h-12 text-base"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Profile...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Analyze Profile
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTestAnalyzer}
              disabled={isLoading}
              className="h-12"
            >
              Test Analyzer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-600 font-medium">
            Error: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Profile Overview */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-6 w-6 text-blue-600" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-xl font-semibold">{analysisData.profileData?.fullName || analysisData.profileData?.name || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="flex items-center gap-1 text-lg">
                    <MapPin className="h-4 w-4" />
                    {analysisData.profileData?.location || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Profile Completeness</Label>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={analysisData.profileData?.profileCompleteness?.completenessScore || 0} 
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {analysisData.profileData?.profileCompleteness?.completenessScore || 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Headline</Label>
                <p className="text-base">{analysisData.profileData?.headline || 'N/A'}</p>
              </div>
              
              {analysisData.profileData?.about && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">About</Label>
                  <Textarea 
                    value={analysisData.profileData.about} 
                    readOnly 
                    className="min-h-[120px] text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Strength Score */}
          {analysisData.scores?.overall && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Profile Strength Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold">
                    <span className={getScoreColor(analysisData.scores.overall)}>
                      {analysisData.scores.overall}
                    </span>
                    <span className="text-4xl text-muted-foreground">/100</span>
                  </div>
                  <Badge 
                    variant={getScoreBadgeVariant(analysisData.scores.overall)}
                    className="text-lg px-4 py-2"
                  >
                    {analysisData.scores.overall >= 80 ? 'Excellent' : 
                     analysisData.scores.overall >= 60 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                  <p className="text-muted-foreground">
                    Based on industry standards and recruiter preferences
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comprehensive Analysis */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                Comprehensive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Profile Scores
                      </h4>
                      <div className="space-y-2">
                        {analysisData.scores && (
                          <>
                            <div className="text-sm">
                              <span className="font-medium">Overall:</span> {analysisData.scores.overall}/100
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Headline:</span> {analysisData.scores.headline}/10
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">About:</span> {analysisData.scores.about}/10
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Completeness:</span> {analysisData.scores.completeness}/10
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Keywords:</span> {analysisData.scores.keywords}/10
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Engagement:</span> {analysisData.scores.engagement}/10
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        Areas for Improvement
                      </h4>
                      <div className="space-y-1">
                        {analysisData.recommendations?.improvements?.map((improvement, index) => (
                          <div key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                            <strong>{improvement.category}:</strong> {improvement.suggestion}
                          </div>
                        )) || (
                          <p className="text-sm text-muted-foreground">Analysis in progress...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="sections" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Experience */}
                    {analysisData.profileData?.experience?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Experience ({analysisData.profileData.experience.length})
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {analysisData.profileData.experience.map((exp, index) => (
                            <div key={index} className="border-l-2 border-blue-200 pl-3 py-2">
                              <h5 className="font-medium text-sm">{exp.title}</h5>
                              <p className="text-xs text-muted-foreground">{exp.company}</p>
                              <p className="text-xs text-muted-foreground">{exp.duration}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {analysisData.profileData?.education?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Education ({analysisData.profileData.education.length})
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {analysisData.profileData.education.map((edu, index) => (
                            <div key={index} className="border-l-2 border-green-200 pl-3 py-2">
                              <h5 className="font-medium text-sm">{edu.school}</h5>
                              <p className="text-xs text-muted-foreground">{edu.degree}</p>
                              <p className="text-xs text-muted-foreground">{edu.duration}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {analysisData.profileData?.skills?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Skills ({analysisData.profileData.skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.profileData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {typeof skill === 'string' ? skill : skill.name}
                            {typeof skill === 'object' && skill.endorsements && (
                              <span className="ml-1 text-muted-foreground">
                                ({skill.endorsements})
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="keywords" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Recommended Keywords
                    </h4>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {analysisData.recommendations?.keywords?.map((keyword, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {keyword}
                          </Badge>
                        )) || (
                          <p className="text-sm text-muted-foreground">Analysis in progress...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Actionable Recommendations
                    </h4>
                    <div className="space-y-3">
                      {analysisData.recommendations?.improvements?.map((improvement, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {improvement.category} - {improvement.priority || 'medium'} priority
                            </Badge>
                          </div>
                          <p className="text-sm">{improvement.suggestion}</p>
                          {improvement.expectedImpact && (
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              Expected impact: {improvement.expectedImpact}
                            </p>
                          )}
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Detailed recommendations will appear here...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Headline Recommendations */}
          {analysisData.recommendations?.headlines && analysisData.recommendations.headlines.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6 text-indigo-600" />
                  Recommended Headlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.recommendations.headlines.map((headline, index) => (
                    <div key={index} className="border-l-2 border-indigo-500 pl-4 py-2 bg-indigo-50 rounded-r">
                      <p className="text-sm">{headline}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* About Section Recommendation */}
          {analysisData.recommendations?.aboutSection && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  Recommended About Section
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea 
                    value={analysisData.recommendations.aboutSection} 
                    readOnly 
                    className="min-h-[200px] text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkedInProfileAnalyzer;

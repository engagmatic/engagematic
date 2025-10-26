import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ExternalLink, User, Briefcase, GraduationCap, MapPin, Star, Brain, Target } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const LinkedInScraper = () => {
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
      const response = await fetch('/api/linkedin-scraper/analyze', {
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
        setError(result.error || 'Analysis failed');
        toast.error(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error occurred');
      toast.error('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestScraper = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/linkedin-scraper/test');
      const result = await response.json();
      
      if (result.success) {
        toast.success('LinkedIn Scraper is ready!');
      } else {
        toast.error('Scraper test failed');
      }
    } catch (err) {
      toast.error('Scraper test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LinkedIn Profile Analyzer</h1>
        <p className="text-muted-foreground">
          Extract real LinkedIn profile data and get AI-powered insights for profile enhancement
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Profile Analysis
          </CardTitle>
          <CardDescription>
            Enter a LinkedIn profile URL to analyze and get AI-powered suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profileUrl">LinkedIn Profile URL</Label>
            <Input
              id="profileUrl"
              type="url"
              placeholder="https://www.linkedin.com/in/username"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAnalyzeProfile} 
              disabled={isLoading || !profileUrl.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Profile
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTestScraper}
              disabled={isLoading}
            >
              Test Scraper
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 font-medium">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Profile Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-lg font-semibold">{analysisData.profileData?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {analysisData.profileData?.location || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Headline</Label>
                  <p className="text-sm">{analysisData.profileData?.headline || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">About</Label>
                  <Textarea 
                    value={analysisData.profileData?.about || 'N/A'} 
                    readOnly 
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          {analysisData.profileData?.experience?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.profileData.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="font-semibold">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {analysisData.profileData?.education?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.profileData.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-green-200 pl-4">
                      <h4 className="font-semibold">{edu.school}</h4>
                      <p className="text-sm text-muted-foreground">{edu.degree}</p>
                      <p className="text-xs text-muted-foreground">{edu.duration}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {analysisData.profileData?.skills?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisData.profileData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {analysisData.analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  AI Analysis & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.analysis.profileStrength && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Profile Strength:</Label>
                      <Badge variant={analysisData.analysis.profileStrength >= 80 ? "default" : 
                                      analysisData.analysis.profileStrength >= 60 ? "secondary" : "destructive"}>
                        {analysisData.analysis.profileStrength}/100
                      </Badge>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Key Insights:</h4>
                    <Textarea 
                      value={JSON.stringify(analysisData.analysis, null, 2)} 
                      readOnly 
                      className="min-h-[200px] font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Persona Context */}
          {analysisData.personaContext && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Persona Context for Content Creation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea 
                    value={JSON.stringify(analysisData.personaContext, null, 2)} 
                    readOnly 
                    className="min-h-[200px] font-mono text-xs"
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

export default LinkedInScraper;

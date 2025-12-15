"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import type { AnalysisResponse } from "@/lib/ai/gemini-client"

interface AnalyzerFormProps {
  onSuccess: (data: AnalysisResponse) => void
}

export function AnalyzerForm({ onSuccess }: AnalyzerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [profileUrl, setProfileUrl] = useState("")

  const handleAnalyze = async () => {
    if (!profileUrl || !profileUrl.includes("linkedin.com/in/")) {
      toast.error("Please enter a valid LinkedIn profile URL")
      return
    }

    setIsLoading(true)
    toast.loading("Analyzing LinkedIn profile...")

    try {
      const response = await fetch("/api/profile-analyzer/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          profileUrl,
          persona: "Job Seeker" // Default persona, can be enhanced later
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(result.message || "Rate limit exceeded")
          throw new Error("RATE_LIMIT_EXCEEDED")
        }
        throw new Error(result.error || "Analysis failed")
      }

      toast.success("Profile analysis completed!")
      onSuccess(result.data)
    } catch (error) {
      console.error("Analysis error:", error)
      if (error instanceof Error && error.message !== "RATE_LIMIT_EXCEEDED") {
        toast.error(error.message || "Failed to analyze profile. Please try again.")
      }
    } finally {
      setIsLoading(false)
      toast.dismiss()
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>LinkedIn Profile Analyzer</CardTitle>
        <CardDescription>
          Enter your LinkedIn profile URL to get AI-powered analysis and optimization recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="profileUrl" className="text-sm font-medium">
              LinkedIn Profile URL <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="profileUrl"
                placeholder="https://www.linkedin.com/in/username"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading || !profileUrl}
                size="default"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Analyze Profile
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your LinkedIn profile URL to analyze and get personalized optimization recommendations
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


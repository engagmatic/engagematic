"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScoreCard } from "./ScoreCard"
import { UpgradeCTA } from "./UpgradeCTA"
import { Copy, Check, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import type { AnalysisResponse } from "@/lib/ai/gemini-client"
import { cn } from "@/lib/utils"

interface ResultsDisplayProps {
  data: AnalysisResponse
  onReset: () => void
  showUpgrade?: boolean
}

export function ResultsDisplay({ data, onReset, showUpgrade = false }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 70) return "text-blue-600 dark:text-blue-400"
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-blue-500"
    if (score >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Overall Score */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Profile Analysis Results</CardTitle>
              <CardDescription>Your LinkedIn profile optimization score</CardDescription>
            </div>
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Analyze Another
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="text-center">
              <div className={cn("text-6xl font-bold mb-2", getScoreColor(data.score))}>
                {data.score}
              </div>
              <div className="text-muted-foreground">Overall Score</div>
            </div>
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{data.score}%</span>
              </div>
              <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500", getScoreBgColor(data.score))}
                  style={{ width: `${data.score}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard
          title="Headline"
          score={data.headline_feedback.score}
          strengths={data.headline_feedback.strengths}
          improvements={data.headline_feedback.improvements}
          rewrittenExample={data.headline_feedback.rewritten_example}
        />
        <ScoreCard
          title="About Section"
          score={data.about_feedback.score}
          strengths={data.about_feedback.strengths}
          improvements={data.about_feedback.improvements}
        />
      </div>

      {/* Persona Alignment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Persona Alignment</CardTitle>
            <Badge variant={data.persona_alignment.score >= 70 ? "default" : "secondary"}>
              {data.persona_alignment.score}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{data.persona_alignment.feedback}</p>
        </CardContent>
      </Card>

      {/* Top 3 Priorities */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Top 3 Priorities</CardTitle>
          <CardDescription>Focus on these improvements first</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {data.top_3_priorities.map((priority, index) => (
              <li key={index} className="flex gap-3">
                <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <span className="flex-1 text-sm">{priority}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Generated Post */}
      <Card>
        <CardHeader>
          <CardTitle>Generated LinkedIn Post</CardTitle>
          <CardDescription>Ready-to-publish post tailored to your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(data.generated_post.content)}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <p className="text-sm whitespace-pre-line pr-12">{data.generated_post.content}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Why this hook works:</h4>
            <p className="text-sm text-muted-foreground">{data.generated_post.hook_explanation}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Engagement Tactics:</h4>
            <ul className="space-y-1">
              {data.generated_post.engagement_tactics.map((tactic, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {tactic}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {showUpgrade && (
        <UpgradeCTA />
      )}
    </div>
  )
}


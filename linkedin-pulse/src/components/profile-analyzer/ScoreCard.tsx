"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScoreCardProps {
  title: string
  score: number
  strengths: string[]
  improvements: string[]
  rewrittenExample?: string
}

export function ScoreCard({
  title,
  score,
  strengths,
  improvements,
  rewrittenExample,
}: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-blue-500"
    if (score >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return "default"
    if (score >= 70) return "secondary"
    if (score >= 50) return "outline"
    return "destructive"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={getScoreVariant(score)} className="text-sm">
            {score}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Score</span>
            <span className="font-medium">{score}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500", getScoreColor(score))}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
              Strengths
            </h4>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Improvements
            </h4>
            <ul className="space-y-2">
              {improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewritten Example */}
        {rewrittenExample && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold">Suggested Rewrite</h4>
            <p className="text-sm text-muted-foreground italic">{rewrittenExample}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


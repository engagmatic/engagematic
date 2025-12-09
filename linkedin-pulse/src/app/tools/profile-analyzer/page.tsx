"use client"

import { useState } from "react"
import { AnalyzerForm } from "@/components/profile-analyzer/AnalyzerForm"
import { ResultsDisplay } from "@/components/profile-analyzer/ResultsDisplay"
import type { AnalysisResponse } from "@/lib/ai/gemini-client"

export default function ProfileAnalyzerPage() {
  const [results, setResults] = useState<AnalysisResponse | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const handleSuccess = (data: AnalysisResponse) => {
    setResults(data)
    // Check if user hit rate limit (this would come from API response)
    // For now, we'll show upgrade after first analysis
    setShowUpgrade(false) // Set to true if rate limit exceeded
  }

  const handleReset = () => {
    setResults(null)
    setShowUpgrade(false)
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            LinkedIn Profile Analyzer
          </h1>
          <p className="text-muted-foreground text-lg">
            Get AI-powered insights to optimize your LinkedIn profile and boost your visibility
          </p>
        </div>

        {!results ? (
          <AnalyzerForm onSuccess={handleSuccess} />
        ) : (
          <ResultsDisplay data={results} onReset={handleReset} showUpgrade={showUpgrade} />
        )}
      </div>
    </div>
  )
}


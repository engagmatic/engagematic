"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProfileAnalyzerInputSchema, type ProfileAnalyzerInput } from "@/lib/utils/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import type { AnalysisResponse } from "@/lib/ai/gemini-client"

interface AnalyzerFormProps {
  onSuccess: (data: AnalysisResponse) => void
}

export function AnalyzerForm({ onSuccess }: AnalyzerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [inputMode, setInputMode] = useState<"manual" | "url">("manual")
  const [profileUrl, setProfileUrl] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileAnalyzerInput>({
    resolver: zodResolver(ProfileAnalyzerInputSchema),
    defaultValues: {
      persona: "Job Seeker",
      headline: "",
      about: "",
    },
  })

  const headlineLength = watch("headline")?.length || 0
  const aboutLength = watch("about")?.length || 0

  // Handle profile URL scraping
  const handleScrapeProfile = async () => {
    if (!profileUrl || !profileUrl.includes("linkedin.com/in/")) {
      toast.error("Please enter a valid LinkedIn profile URL")
      return
    }

    setIsScraping(true)
    toast.loading("Scraping LinkedIn profile...")

    try {
      const response = await fetch("/api/profile-analyzer/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileUrl }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to scrape profile")
      }

      // Populate form with scraped data
      if (result.data) {
        setValue("headline", result.data.headline || "")
        setValue("about", result.data.about || "")
        setValue("currentRole", result.data.experience?.[0]?.title || "")
        setValue("industry", result.data.industry || "")
        
        toast.success("Profile scraped successfully!")
        setInputMode("manual") // Switch to manual mode to show the form
      }
    } catch (error) {
      console.error("Scraping error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to scrape profile")
    } finally {
      setIsScraping(false)
      toast.dismiss()
    }
  }

  const onSubmit = async (data: ProfileAnalyzerInput) => {
    setIsLoading(true)
    toast.loading("Analyzing your profile...")

    try {
      const response = await fetch("/api/profile-analyzer/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
          Get AI-powered insights to optimize your LinkedIn profile and boost your visibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Input Mode Toggle */}
        <div className="mb-6 p-4 bg-muted rounded-lg space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={inputMode === "url" ? "default" : "outline"}
              onClick={() => setInputMode("url")}
              className="flex-1"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Scrape from URL
            </Button>
            <Button
              type="button"
              variant={inputMode === "manual" ? "default" : "outline"}
              onClick={() => setInputMode("manual")}
              className="flex-1"
            >
              Manual Input
            </Button>
          </div>

          {inputMode === "url" && (
            <div className="space-y-2">
              <label htmlFor="profileUrl" className="text-sm font-medium">
                LinkedIn Profile URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="profileUrl"
                  placeholder="https://www.linkedin.com/in/username"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  disabled={isScraping}
                />
                <Button
                  type="button"
                  onClick={handleScrapeProfile}
                  disabled={isScraping || !profileUrl}
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    "Scrape"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a LinkedIn profile URL to automatically fetch headline and about section
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="persona" className="text-sm font-medium">
              Persona <span className="text-destructive">*</span>
            </label>
            <Select
              id="persona"
              {...register("persona")}
              className={errors.persona ? "border-destructive" : ""}
            >
              <option value="Student">Student</option>
              <option value="Job Seeker">Job Seeker</option>
              <option value="Entrepreneur">Entrepreneur</option>
              <option value="Executive">Executive</option>
            </Select>
            {errors.persona && (
              <p className="text-sm text-destructive">{errors.persona.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="headline" className="text-sm font-medium">
              Headline <span className="text-destructive">*</span>
              <span className="text-muted-foreground ml-2">
                ({headlineLength}/220 characters)
              </span>
            </label>
            <Input
              id="headline"
              placeholder="e.g., Software Engineer | Building scalable web applications"
              {...register("headline")}
              className={errors.headline ? "border-destructive" : ""}
            />
            {errors.headline && (
              <p className="text-sm text-destructive">{errors.headline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="about" className="text-sm font-medium">
              About Section <span className="text-destructive">*</span>
              <span className="text-muted-foreground ml-2">
                ({aboutLength}/2600 characters)
              </span>
            </label>
            <Textarea
              id="about"
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
              rows={8}
              {...register("about")}
              className={errors.about ? "border-destructive" : ""}
            />
            {errors.about && (
              <p className="text-sm text-destructive">{errors.about.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="currentRole" className="text-sm font-medium">
                Current Role (Optional)
              </label>
              <Input
                id="currentRole"
                placeholder="e.g., Senior Software Engineer"
                {...register("currentRole")}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="industry" className="text-sm font-medium">
                Industry (Optional)
              </label>
              <Input
                id="industry"
                placeholder="e.g., Technology"
                {...register("industry")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="targetAudience" className="text-sm font-medium">
                Target Audience (Optional)
              </label>
              <Input
                id="targetAudience"
                placeholder="e.g., Tech recruiters, Startup founders"
                {...register("targetAudience")}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="goal" className="text-sm font-medium">
                Goal (Optional)
              </label>
              <Input
                id="goal"
                placeholder="e.g., Get hired, Build credibility"
                {...register("goal")}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


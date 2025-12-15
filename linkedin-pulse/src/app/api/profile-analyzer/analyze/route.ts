import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { analyzeProfile } from "@/lib/ai/gemini-client"
import { checkRateLimit } from "@/lib/rate-limit/limiter"
import { getDb } from "@/lib/db/mongodb"
import { ProfileAnalyzerInputSchema } from "@/lib/utils/validation"
import { scrapeLinkedInProfile } from "@/lib/scraper/linkedin-scraper"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    console.log("📊 Profile analyzer API request received")

    // Get user ID from Clerk (or IP for anonymous)
    // Clerk is optional - if not configured, use IP address
    let userId: string | null = null
    try {
      const authResult = await auth()
      userId = authResult?.userId || null
    } catch (error) {
      // Clerk not configured or error - continue without auth
      console.log("Clerk not configured, using anonymous identifier")
    }
    const identifier = userId || request.ip || "anonymous"
    const isPaidUser = false // TODO: Check subscription status from database

    console.log(`🔍 Checking rate limit for: ${identifier}`)

    // Check rate limit
    const rateLimit = await checkRateLimit(identifier, isPaidUser)

    if (!rateLimit.allowed) {
      console.log(`❌ Rate limit exceeded for: ${identifier}`)
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message: "You've used your free analysis. Please sign up for more!",
          rateLimit: {
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          },
        },
        { status: 429 }
      )
    }

    console.log(`✅ Rate limit check passed. Remaining: ${rateLimit.remaining}`)

    // Parse and validate input
    const body = await request.json()
    
    // Profile URL is required for analysis
    if (!body.profileUrl || typeof body.profileUrl !== 'string' || body.profileUrl.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile URL required",
          message: "Please provide a LinkedIn profile URL to analyze.",
        },
        { status: 400 }
      )
    }

    if (!body.profileUrl.includes("linkedin.com/in/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid LinkedIn profile URL",
          message: "Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username).",
        },
        { status: 400 }
      )
    }

    console.log("🔍 Analyzing LinkedIn profile:", body.profileUrl)
    
    // Analyze the profile from URL
    const profileData = await scrapeLinkedInProfile(body.profileUrl)
    
    // If profile analysis fails, return error - NO FALLBACKS, only real profile data
    if (!profileData.success || !profileData.data) {
      console.error("❌ Profile analysis failed - returning error")
      return NextResponse.json(
        {
          success: false,
          error: profileData.error || "Failed to analyze profile",
          message: "Could not analyze the profile from the provided URL. Please ensure the profile URL is correct and the profile is public.",
        },
        { status: 400 }
      )
    }
    
    // Validate that we got real profile data
    if (!profileData.data.headline || profileData.data.headline.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient profile data",
          message: "The profile could not be fully analyzed. Please ensure the profile is public and contains a headline.",
        },
        { status: 400 }
      )
    }
    
    if (!profileData.data.about || profileData.data.about.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient profile data",
          message: "The profile's about section could not be analyzed or is too short. Please ensure the profile has a complete about section.",
        },
        { status: 400 }
      )
    }
    
    // Profile analysis succeeded - use ONLY real profile data
    console.log("✅ Profile analyzed successfully - using real profile data")
    let validatedInput = {
      persona: body.persona || "Job Seeker",
      headline: profileData.data.headline, // ONLY real profile data
      about: profileData.data.about, // ONLY real profile data
      currentRole: profileData.data.experience?.[0]?.title || "",
      industry: profileData.data.industry || "",
      targetAudience: body.targetAudience,
      goal: body.goal,
    }

    // Validate that we have real profile data
    if (!validatedInput.headline || validatedInput.headline.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient profile data",
          message: "The profile headline could not be analyzed. Please ensure the profile is public and contains a headline.",
        },
        { status: 400 }
      )
    }

    if (!validatedInput.about || validatedInput.about.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient profile data",
          message: "The profile about section could not be analyzed. Please ensure the profile has a complete about section.",
        },
        { status: 400 }
      )
    }

    // Validate with schema
    try {
      validatedInput = ProfileAnalyzerInputSchema.parse(validatedInput)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            details: validationError.errors,
            message: "Please check your input and try again.",
          },
          { status: 400 }
        )
      }
      throw validationError
    }

    console.log("🤖 Starting AI analysis...")

    // Call AI analysis
    const analysis = await analyzeProfile({
      persona: validatedInput.persona,
      headline: validatedInput.headline,
      about: validatedInput.about,
      currentRole: validatedInput.currentRole,
      industry: validatedInput.industry,
      targetAudience: validatedInput.targetAudience,
      goal: validatedInput.goal,
    })

    console.log("✅ Analysis completed. Saving to database...")

    // Save to MongoDB
    try {
      const db = await getDb()
      const collection = db.collection("profile_analyses")

      await collection.insertOne({
        userId: userId || null,
        sessionId: identifier,
        input: validatedInput,
        analysis,
        metadata: {
          userAgent: request.headers.get("user-agent"),
          ip: request.ip,
        },
        createdAt: new Date(),
      })

      console.log("✅ Analysis saved to database")
    } catch (dbError) {
      console.error("⚠️ Failed to save to database:", dbError)
      // Continue even if DB save fails
    }

    return NextResponse.json({
      success: true,
      data: analysis,
      meta: {
        remainingQuota: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
      },
    })
  } catch (error) {
    console.error("❌ Profile analyzer API error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Analysis failed",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}


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
    const { userId } = await auth()
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
    
    // Check if profileUrl is provided for scraping
    let validatedInput = body
    if (body.profileUrl && typeof body.profileUrl === 'string') {
      console.log("🔍 Profile URL provided, scraping profile...")
      const scrapeResult = await scrapeLinkedInProfile(body.profileUrl)
      
      if (!scrapeResult.success || !scrapeResult.data) {
        return NextResponse.json(
          {
            success: false,
            error: scrapeResult.error || "Failed to scrape profile",
          },
          { status: 400 }
        )
      }

      // Merge scraped data with user input
      validatedInput = {
        persona: body.persona || "Job Seeker",
        headline: scrapeResult.data.headline || body.headline || "",
        about: scrapeResult.data.about || body.about || "",
        currentRole: scrapeResult.data.experience?.[0]?.title || body.currentRole,
        industry: scrapeResult.data.industry || body.industry,
        targetAudience: body.targetAudience,
        goal: body.goal,
      }
    }

    // Validate input
    validatedInput = ProfileAnalyzerInputSchema.parse(validatedInput)

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


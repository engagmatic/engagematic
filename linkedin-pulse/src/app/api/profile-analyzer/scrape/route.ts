import { NextRequest, NextResponse } from "next/server"
import { scrapeLinkedInProfile } from "@/lib/scraper/linkedin-scraper"
import { z } from "zod"

const ScrapeRequestSchema = z.object({
  profileUrl: z.string().url("Invalid URL format").refine(
    (url) => url.includes("linkedin.com/in/"),
    "Must be a LinkedIn profile URL (linkedin.com/in/username)"
  ),
})

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 LinkedIn profile scraping request received")

    // Parse and validate input
    const body = await request.json()
    const validatedInput = ScrapeRequestSchema.parse(body)

    console.log("🤖 Starting profile scraping...")

    // Scrape profile
    const result = await scrapeLinkedInProfile(validatedInput.profileUrl)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to scrape profile",
        },
        { status: 400 }
      )
    }

    console.log("✅ Profile scraped successfully")

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error("❌ Profile scraping API error:", error)

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
          error: error.message || "Scraping failed",
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


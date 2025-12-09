import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"
import { SYSTEM_PROMPT, buildUserPrompt, type ProfileAnalysisInput } from "./prompts"

// Response schema
const AnalysisResponseSchema = z.object({
  score: z.number().min(0).max(100),
  headline_feedback: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()).min(2).max(3),
    improvements: z.array(z.string()).length(3),
    rewritten_example: z.string().min(10),
  }),
  about_feedback: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()).min(2).max(3),
    improvements: z.array(z.string()).length(3),
    structure_suggestions: z.array(z.string()).min(4),
  }),
  persona_alignment: z.object({
    score: z.number().min(0).max(100),
    feedback: z.string().min(50),
  }),
  top_3_priorities: z.array(z.string()).length(3),
  generated_post: z.object({
    content: z.string().min(150).max(500),
    hook_explanation: z.string().min(20),
    engagement_tactics: z.array(z.string()).length(3),
  }),
})

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>

// Input validation schema
const ProfileInputSchema = z.object({
  persona: z.enum(["Student", "Job Seeker", "Entrepreneur", "Executive"]),
  headline: z.string().min(10).max(220),
  about: z.string().min(50).max(2600),
  currentRole: z.string().optional(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  goal: z.string().optional(),
})

export async function analyzeProfile(
  input: ProfileAnalysisInput
): Promise<AnalysisResponse> {
  try {
    // Validate input
    const validatedInput = ProfileInputSchema.parse(input)

    // Get API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured")
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: SYSTEM_PROMPT,
    })

    // Build prompt
    const userPrompt = buildUserPrompt(validatedInput)

    console.log("🤖 Calling Google Gemini for profile analysis...")

    // Generate content with JSON response
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    })

    const response = await result.response
    const text = response.text()

    // Parse JSON
    let jsonData: unknown
    try {
      jsonData = JSON.parse(text)
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", text)
      throw new Error("Invalid JSON response from AI")
    }

    // Validate response schema
    const analysis = AnalysisResponseSchema.parse(jsonData)

    console.log("✅ Profile analysis completed successfully")
    return analysis
  } catch (error) {
    console.error("❌ Profile analysis error:", error)

    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(", ")}`)
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error("Unknown error during profile analysis")
  }
}


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
    optimized_about: z.string().min(200).max(2600).optional(),
  }),
  keywords: z.array(z.string()).min(5).max(10).optional(),
  recommended_skills: z.array(z.string()).min(5).max(10).optional(),
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

    // Initialize Gemini - first check what models are available
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // List available models to find one that works
    let availableModel: string | null = null
    try {
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json()
        const models = modelsData.models || []
        
        // Find a flash model first (cheapest), then pro, then any model
        const flashModel = models.find((m: any) => 
          m.name?.includes('flash') && m.supportedGenerationMethods?.includes('generateContent')
        )
        const proModel = models.find((m: any) => 
          m.name?.includes('pro') && m.supportedGenerationMethods?.includes('generateContent')
        )
        const anyModel = models.find((m: any) => 
          m.supportedGenerationMethods?.includes('generateContent')
        )
        
        availableModel = flashModel?.name || proModel?.name || anyModel?.name || null
        
        if (availableModel) {
          // Remove 'models/' prefix if present
          availableModel = availableModel.replace('models/', '')
          console.log(`📋 Found available model: ${availableModel}`)
        }
      }
    } catch (listError) {
      console.warn("⚠️ Could not list available models, will try default")
    }
    
    // Use available model or fallback to user's choice or default
    const modelName = process.env.GEMINI_MODEL || availableModel || "gemini-pro"
    
    // Initialize model with systemInstruction
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    })
    
    console.log(`🤖 Using Gemini model: ${modelName}`)
    
    // Build prompt
    // Note: systemInstruction is already applied during model initialization if supported
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

    // Parse JSON - handle markdown code blocks and extra text
    let jsonData: unknown
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim()
      if (cleanText.includes('```json')) {
        cleanText = cleanText.split('```json')[1].split('```')[0].trim()
      } else if (cleanText.includes('```')) {
        cleanText = cleanText.split('```')[1].split('```')[0].trim()
      }
      
      // Try to extract JSON object if there's extra text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanText = jsonMatch[0]
      }
      
      jsonData = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", text.substring(0, 500))
      console.error("Parse error:", parseError)
      
      // Try to extract partial data and provide fallback
      throw new Error("AI returned invalid response format. Please try again.")
    }

    // Validate response schema - NO FALLBACKS, only real results
    const analysis = AnalysisResponseSchema.parse(jsonData)
    
    // Additional validation to ensure all data is genuine
    if (!analysis.headline_feedback.rewritten_example || analysis.headline_feedback.rewritten_example.length < 10) {
      throw new Error("AI returned incomplete headline feedback")
    }
    
    if (!analysis.generated_post.content || analysis.generated_post.content.length < 150) {
      throw new Error("AI returned incomplete generated post")
    }
    
    // Ensure all arrays have real content
    if (analysis.headline_feedback.strengths.length < 2) {
      throw new Error("AI returned insufficient headline strengths")
    }
    
    if (analysis.headline_feedback.improvements.length !== 3) {
      throw new Error("AI returned incorrect number of headline improvements")
    }
    
    if (analysis.top_3_priorities.length !== 3) {
      throw new Error("AI returned incorrect number of priorities")
    }
    
    if (analysis.generated_post.engagement_tactics.length !== 3) {
      throw new Error("AI returned incorrect number of engagement tactics")
    }
    
    // Validate optimized_about if provided (should be complete and ready to use)
    if (analysis.about_feedback.optimized_about) {
      if (analysis.about_feedback.optimized_about.length < 200) {
        throw new Error("AI returned incomplete optimized About section (must be at least 200 characters)")
      }
      if (analysis.about_feedback.optimized_about.includes("[Insert") || analysis.about_feedback.optimized_about.includes("[Your")) {
        throw new Error("AI returned placeholder text in optimized About section")
      }
    }

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


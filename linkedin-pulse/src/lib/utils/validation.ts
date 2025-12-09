import { z } from "zod"

export const ProfileAnalyzerInputSchema = z.object({
  persona: z.enum(["Student", "Job Seeker", "Entrepreneur", "Executive"], {
    required_error: "Please select a persona",
  }),
  headline: z
    .string()
    .min(10, "Headline must be at least 10 characters")
    .max(220, "Headline must be at most 220 characters")
    .or(z.literal("")), // Allow empty for scraping
  about: z
    .string()
    .min(50, "About section must be at least 50 characters")
    .max(2600, "About section must be at most 2600 characters")
    .or(z.literal("")), // Allow empty for scraping
  currentRole: z.string().optional(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  goal: z.string().optional(),
})

export type ProfileAnalyzerInput = z.infer<typeof ProfileAnalyzerInputSchema>


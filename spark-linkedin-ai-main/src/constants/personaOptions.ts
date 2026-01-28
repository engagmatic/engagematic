/**
 * Standardized Persona Options
 * Used across onboarding, post generator, and comment generator
 */

export const WRITING_STYLES = [
  { value: "professional", label: "Professional & Formal", desc: "Formal and authoritative", icon: "👔" },
  { value: "conversational", label: "Conversational & Friendly", desc: "Friendly and approachable", icon: "😊" },
  { value: "storyteller", label: "Storytelling & Personal", desc: "Narrative and engaging", icon: "📖" },
  { value: "analytical", label: "Data-Driven & Analytical", desc: "Facts and insights", icon: "📊" },
  { value: "authoritative", label: "Authoritative & Expert", desc: "Industry thought leader", icon: "🎯" },
  { value: "motivational", label: "Motivational & Inspiring", desc: "Uplifting and encouraging", icon: "⭐" },
] as const;

export const TONE_OPTIONS = [
  { value: "confident", label: "Confident", desc: "Self-assured and decisive", icon: "💪" },
  { value: "humble", label: "Humble", desc: "Modest and gracious", icon: "🙏" },
  { value: "enthusiastic", label: "Enthusiastic", desc: "Energetic and passionate", icon: "🔥" },
  { value: "thoughtful", label: "Thoughtful", desc: "Reflective and insightful", icon: "💭" },
  { value: "direct", label: "Direct", desc: "Clear and straightforward", icon: "🎯" },
  { value: "empathetic", label: "Empathetic", desc: "Understanding and caring", icon: "❤️" },
  { value: "friendly", label: "Friendly", desc: "Warm and approachable", icon: "😊" },
  { value: "professional", label: "Professional", desc: "Polished and credible", icon: "👔" },
] as const;

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Sales",
  "Consulting",
  "Real Estate",
  "Manufacturing",
  "Retail",
  "Media",
  "Non-profit",
  "Government",
  "Legal",
  "E-commerce",
  "Hospitality",
  "Transportation",
  "Energy",
  "Telecommunications",
  "Agriculture",
  "Construction",
  "Entertainment",
  "Fitness & Wellness",
  "Food & Beverage",
  "Fashion",
  "Beauty & Cosmetics",
  "Travel & Tourism",
  "Sports",
  "Gaming",
  "Automotive",
  "Aerospace",
  "Pharmaceuticals",
  "Biotechnology",
  "Insurance",
  "Banking",
  "Investment",
  "Accounting",
  "Human Resources",
  "Recruiting",
  "Design",
  "Architecture",
  "Engineering",
  "Research",
  "Non-profit",
  "Startups",
  "Venture Capital",
  "Private Equity",
  "Other"
] as const;

// Popular industries shown first (most common)
export const POPULAR_INDUSTRIES = [
  "Technology",
  "Marketing",
  "Sales",
  "Healthcare",
  "Finance",
  "Education",
  "Consulting",
  "E-commerce",
  "Real Estate",
  "Media",
  "Human Resources",
  "Design"
] as const;

export const EXPERIENCE_LEVELS = [
  "Student/Entry Level",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
  "Executive"
] as const;

export const CONTENT_TYPES = [
  "Industry Insights",
  "Personal Stories",
  "How-To Guides",
  "Thought Leadership",
  "Company Updates",
  "Team Spotlights",
  "Product Launches",
  "Career Tips",
  "Industry News",
  "Success Stories"
] as const;


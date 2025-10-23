import ProfileAnalysis from "../models/ProfileAnalysis.js";

/**
 * Service to retrieve and use profile analysis insights for content generation
 */
class ProfileInsightsService {
  /**
   * Get the latest profile analysis for a user
   */
  async getLatestAnalysis(userId) {
    try {
      const analysis = await ProfileAnalysis.findOne({ userId })
        .sort({ analyzedAt: -1 })
        .lean();

      if (!analysis) {
        return null;
      }

      return analysis;
    } catch (error) {
      console.error("Error fetching profile analysis:", error);
      return null;
    }
  }

  /**
   * Extract content generation insights from profile analysis
   */
  async getContentInsights(userId) {
    const analysis = await this.getLatestAnalysis(userId);

    if (!analysis) {
      return null;
    }

    // Extract useful data for content personalization
    return {
      // Profile Data
      headline: analysis.profileData.headline,
      industry: analysis.profileData.industry,
      location: analysis.profileData.location,
      experience: analysis.profileData.experience,
      skills: analysis.profileData.skills || [],

      // Recommendations for better content
      recommendedKeywords: analysis.recommendations.keywords || [],
      aboutSection: analysis.recommendations.aboutSection,
      topSkills: analysis.recommendations.skills?.slice(0, 5) || [],

      // Analysis scores for personalization
      scores: analysis.scores,

      // Derived insights
      writingStyle: this.inferWritingStyle(analysis),
      contentFocus: this.inferContentFocus(analysis),
      expertiseLevel: this.inferExpertiseLevel(analysis),
    };
  }

  /**
   * Infer writing style from profile analysis
   */
  inferWritingStyle(analysis) {
    const about = analysis.profileData.about || "";
    const headline = analysis.profileData.headline || "";
    const combined = `${headline} ${about}`.toLowerCase();

    // Analyze language patterns
    if (
      combined.match(
        /\b(innovative|cutting-edge|transformative|revolutionary)\b/i
      )
    ) {
      return "innovative";
    }
    if (combined.match(/\b(data|metrics|results|ROI|KPIs)\b/i)) {
      return "data-driven";
    }
    if (combined.match(/\b(passionate|love|believe|inspire)\b/i)) {
      return "passionate";
    }
    if (combined.match(/\b(strategic|leadership|vision|growth)\b/i)) {
      return "strategic";
    }

    return "professional";
  }

  /**
   * Infer content focus areas from profile
   */
  inferContentFocus(analysis) {
    const skills = analysis.profileData.skills || [];
    const industry = analysis.profileData.industry || "";
    const about = analysis.profileData.about || "";

    const focuses = [];

    // Check for common focus areas
    const focusMap = {
      leadership: ["leadership", "management", "team building"],
      technology: ["software", "ai", "machine learning", "cloud", "data"],
      marketing: ["marketing", "branding", "social media", "content"],
      sales: ["sales", "business development", "revenue"],
      strategy: ["strategy", "planning", "transformation"],
      innovation: ["innovation", "product", "design"],
    };

    const combinedText = `${industry} ${about} ${skills.join(
      " "
    )}`.toLowerCase();

    for (const [focus, keywords] of Object.entries(focusMap)) {
      if (keywords.some((keyword) => combinedText.includes(keyword))) {
        focuses.push(focus);
      }
    }

    return focuses.length > 0 ? focuses : ["professional development"];
  }

  /**
   * Infer expertise level
   */
  inferExpertiseLevel(analysis) {
    const headline = (analysis.profileData.headline || "").toLowerCase();
    
    // Handle experience as array (new format) or string (legacy)
    let experienceText = "";
    if (Array.isArray(analysis.profileData.experience)) {
      // Convert array of experience objects to searchable text
      experienceText = analysis.profileData.experience
        .map(exp => `${exp.title || ""} ${exp.company || ""} ${exp.description || ""}`)
        .join(" ")
        .toLowerCase();
    } else {
      // Legacy string format
      experienceText = (analysis.profileData.experience || "").toLowerCase();
    }

    // Count experience entries for senior level detection
    const experienceCount = Array.isArray(analysis.profileData.experience) 
      ? analysis.profileData.experience.length 
      : 0;

    // Senior level indicators
    if (
      headline.match(/\b(ceo|cto|founder|vp|director|head of|chief)\b/i) ||
      experienceText.match(/\b(10\+|15\+|20\+) years\b/i) ||
      experienceCount >= 5 // 5+ jobs typically indicates senior level
    ) {
      return "senior";
    }
    
    // Mid-level indicators
    if (
      headline.match(/\b(manager|lead|senior)\b/i) ||
      experienceText.match(/\b(5|6|7|8|9) years\b/i) ||
      experienceCount >= 3 // 3-4 jobs typically indicates mid-level
    ) {
      return "mid-level";
    }

    return "professional";
  }

  /**
   * Generate enhanced AI prompt context using profile insights
   */
  async buildEnhancedContext(userId) {
    const insights = await this.getContentInsights(userId);

    if (!insights) {
      return null;
    }

    return `
PROFILE CONTEXT (Use this to personalize the content):
- Industry: ${insights.industry || "General Professional"}
- Experience Level: ${insights.expertiseLevel}
- Writing Style Preference: ${insights.writingStyle}
- Content Focus Areas: ${insights.contentFocus.join(", ")}
- Top Skills: ${insights.topSkills.join(", ")}
- Key Topics/Keywords: ${insights.recommendedKeywords.join(", ")}

PERSONALIZATION INSTRUCTIONS:
- Match the ${insights.writingStyle} tone
- Focus on ${insights.contentFocus.join(" and ")} topics
- Use industry terminology from: ${insights.industry || "professional services"}
- Reflect ${insights.expertiseLevel} experience level
- Incorporate relevant keywords naturally
    `.trim();
  }

  /**
   * Get a summary for UI display
   */
  async getInsightsSummary(userId) {
    const insights = await this.getContentInsights(userId);

    if (!insights) {
      return {
        hasAnalysis: false,
        message:
          "No profile analysis found. Analyze your LinkedIn profile for better content personalization.",
      };
    }

    return {
      hasAnalysis: true,
      industry: insights.industry,
      writingStyle: insights.writingStyle,
      expertiseLevel: insights.expertiseLevel,
      topKeywords: insights.recommendedKeywords.slice(0, 3),
      profileScore: insights.scores.overall,
      message: `Using insights from your ${insights.industry} profile for personalized content`,
    };
  }
}

export default new ProfileInsightsService();

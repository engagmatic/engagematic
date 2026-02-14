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
    try {
      const analysis = await this.getLatestAnalysis(userId);

      if (!analysis || !analysis.profileData) {
        return null;
      }

      const pd = analysis.profileData;
      const rec = analysis.recommendations || {};
      return {
        headline: pd.headline || "",
        industry: pd.industry || "",
        location: pd.location || "",
        experience: pd.experience || "",
        skills: Array.isArray(pd.skills) ? pd.skills : [],

        recommendedKeywords: Array.isArray(rec.keywords) ? rec.keywords : [],
        aboutSection: rec.aboutSection || "",
        topSkills: Array.isArray(rec.skills) ? rec.skills.slice(0, 5) : [],

        scores: analysis.scores || {},

        writingStyle: this.inferWritingStyle(analysis),
        contentFocus: this.inferContentFocus(analysis),
        expertiseLevel: this.inferExpertiseLevel(analysis),
      };
    } catch (err) {
      console.warn("Profile insights getContentInsights error:", err.message);
      return null;
    }
  }

  /**
   * Infer writing style from profile analysis
   */
  inferWritingStyle(analysis) {
    const pd = analysis?.profileData || {};
    const about = pd.about || "";
    const headline = pd.headline || "";
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
    const pd = analysis?.profileData || {};
    const skills = Array.isArray(pd.skills) ? pd.skills : [];
    const industry = pd.industry || "";
    const about = pd.about || "";

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
    const pd = analysis?.profileData || {};
    const headline = (pd.headline || "").toLowerCase();

    // Handle experience as array (new format) or string (legacy)
    let experienceText = "";
    if (Array.isArray(pd.experience)) {
      experienceText = pd.experience
        .map(exp => `${exp.title || ""} ${exp.company || ""} ${exp.description || ""}`)
        .join(" ")
        .toLowerCase();
    } else {
      experienceText = (pd.experience || "").toLowerCase();
    }

    const experienceCount = Array.isArray(pd.experience) ? pd.experience.length : 0;

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

    const contentFocus = Array.isArray(insights.contentFocus) ? insights.contentFocus : ["professional development"];
    const topSkills = Array.isArray(insights.topSkills) ? insights.topSkills : [];
    const recommendedKeywords = Array.isArray(insights.recommendedKeywords) ? insights.recommendedKeywords : [];

    return `
PROFILE CONTEXT (Use this to personalize the content):
- Industry: ${insights.industry || "General Professional"}
- Experience Level: ${insights.expertiseLevel || "Mid-level"}
- Writing Style Preference: ${insights.writingStyle || "professional"}
- Content Focus Areas: ${contentFocus.join(", ")}
- Top Skills: ${topSkills.join(", ")}
- Key Topics/Keywords: ${recommendedKeywords.join(", ")}

PERSONALIZATION INSTRUCTIONS:
- Match the ${insights.writingStyle || "professional"} tone
- Focus on ${contentFocus.join(" and ")} topics
- Use industry terminology from: ${insights.industry || "professional services"}
- Reflect ${insights.expertiseLevel || "mid-level"} experience level
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

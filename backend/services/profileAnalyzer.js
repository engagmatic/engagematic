import linkedinProfileService from "./linkedinProfileService.js";
import googleAI from "./googleAI.js";
import ProfileAnalysis from "../models/ProfileAnalysis.js";

class ProfileAnalyzer {
  /**
   * Analyze a LinkedIn profile and generate recommendations
   */
  async analyzeProfile(profileUrl, userId) {
    try {
      console.log("🔍 Analyzing LinkedIn profile:", profileUrl);

      // Extract profile data
      const profileResult = await linkedinProfileService.extractProfileData(
        profileUrl
      );

      if (!profileResult.success) {
        throw new Error("Failed to extract profile data");
      }

      const profileData = profileResult.data;

      // Calculate scores
      const scores = this.calculateScores(profileData);

      // Generate AI recommendations
      const recommendations = await this.generateRecommendations(
        profileData,
        scores
      );

      // Save analysis
      const analysis = await ProfileAnalysis.create({
        userId,
        profileUrl,
        profileData: {
          headline: profileData.headline,
          about: profileData.about,
          location: profileData.location,
          industry: profileData.industry,
          experience: profileData.experience,
          skills: profileData.skills || [],
        },
        scores,
        recommendations,
        analyzedAt: new Date(),
      });

      console.log("✅ Profile analysis complete:", {
        userId,
        overallScore: scores.overall,
      });

      return {
        success: true,
        data: {
          id: analysis._id,
          scores,
          recommendations,
          profileData: analysis.profileData,
          analyzedAt: analysis.analyzedAt,
        },
      };
    } catch (error) {
      console.error("❌ Profile analysis error:", error);
      throw error;
    }
  }

  /**
   * Calculate profile scores
   */
  calculateScores(profile) {
    let overall = 0;

    // Headline score (0-10)
    const headlineScore = this.scoreHeadline(profile.headline);
    overall += headlineScore * 2; // Weight: 20%

    // About section score (0-10)
    const aboutScore = this.scoreAbout(profile.about);
    overall += aboutScore * 2.5; // Weight: 25%

    // Completeness score (0-10)
    const completenessScore = this.scoreCompleteness(profile);
    overall += completenessScore * 2; // Weight: 20%

    // Keywords score (0-10)
    const keywordsScore = this.scoreKeywords(profile);
    overall += keywordsScore * 1.5; // Weight: 15%

    // Engagement potential score (0-10)
    const engagementScore = this.scoreEngagement(profile);
    overall += engagementScore * 2; // Weight: 20%

    return {
      overall: Math.round(overall),
      headline: headlineScore,
      about: aboutScore,
      completeness: completenessScore,
      keywords: keywordsScore,
      engagement: engagementScore,
    };
  }

  scoreHeadline(headline) {
    if (!headline) return 0;

    let score = 0;
    const length = headline.length;

    // Length check (ideal: 50-120 characters)
    if (length >= 50 && length <= 120) score += 4;
    else if (length >= 30 && length < 50) score += 2;
    else if (length > 120) score += 1;

    // Contains keywords
    if (/\b(expert|specialist|manager|director|founder|lead)\b/i.test(headline))
      score += 2;

    // Contains value proposition
    if (/\b(help|helping|building|creating|driving|growing)\b/i.test(headline))
      score += 2;

    // Not generic
    if (!/^(seeking|looking for|open to)\b/i.test(headline)) score += 2;

    return Math.min(score, 10);
  }

  scoreAbout(about) {
    if (!about) return 0;

    let score = 0;
    const length = about.length;
    const wordCount = about.split(/\s+/).length;

    // Length check (ideal: 200-500 words)
    if (wordCount >= 200 && wordCount <= 500) score += 4;
    else if (wordCount >= 100 && wordCount < 200) score += 2;
    else if (wordCount > 0) score += 1;

    // Has storytelling elements
    if (/\b(I|my|journey|story|passion|experience)\b/i.test(about)) score += 2;

    // Has call to action
    if (/\b(reach out|contact|connect|email|message)\b/i.test(about))
      score += 2;

    // Has quantifiable achievements
    if (/\d+(%|x|\+|years|months|clients|projects)/i.test(about)) score += 2;

    return Math.min(score, 10);
  }

  scoreCompleteness(profile) {
    let score = 0;

    if (profile.headline) score += 2;
    if (profile.about && profile.about.length > 100) score += 3;
    if (profile.location) score += 1;
    if (profile.industry) score += 1;
    if (profile.experience) score += 2;
    if (profile.skills && profile.skills.length > 5) score += 1;

    return Math.min(score, 10);
  }

  scoreKeywords(profile) {
    const text = `${profile.headline || ""} ${
      profile.about || ""
    }`.toLowerCase();
    const importantKeywords = [
      "leadership",
      "management",
      "strategy",
      "growth",
      "innovation",
      "results",
      "team",
      "data",
      "digital",
      "technology",
    ];

    let keywordCount = 0;
    importantKeywords.forEach((keyword) => {
      if (text.includes(keyword)) keywordCount++;
    });

    return Math.min(keywordCount, 10);
  }

  scoreEngagement(profile) {
    let score = 5; // Base score

    // Has engaging headline
    if (profile.headline && profile.headline.length > 50) score += 2;

    // Has substantive about section
    if (profile.about && profile.about.length > 300) score += 2;

    // Has relevant skills
    if (profile.skills && profile.skills.length > 10) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Generate AI-powered recommendations
   */
  async generateRecommendations(profileData, scores) {
    try {
      const prompt = `You are a LinkedIn profile optimization expert. Analyze this profile and provide specific, actionable recommendations.

Current Profile:
- Headline: ${profileData.headline || "Missing"}
- About Section: ${profileData.about || "Missing"}
- Industry: ${profileData.industry || "Not specified"}
- Location: ${profileData.location || "Not specified"}
- Skills: ${profileData.skills?.join(", ") || "None listed"}

Current Scores:
- Headline: ${scores.headline}/10
- About: ${scores.about}/10
- Overall: ${scores.overall}/100

Generate the following in JSON format:
{
  "headlines": [3 improved headline options that are keyword-rich and value-focused],
  "aboutSection": "A rewritten 300-word about section with storytelling, achievements, and a clear CTA",
  "skills": [10 relevant skills to add based on industry],
  "keywords": [8 SEO keywords to incorporate],
  "improvements": [
    {"priority": "high|medium|low", "category": "headline|about|skills|photo|experience", "suggestion": "specific actionable advice"}
  ]
}

Only return valid JSON, no additional text.`;

      const response = await googleAI.generateContent(prompt);

      // Parse AI response
      let recommendations;
      try {
        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.log("⚠️ AI response parsing failed, using fallback");
        recommendations = this.getFallbackRecommendations(profileData, scores);
      }

      return recommendations;
    } catch (error) {
      console.error("❌ Recommendation generation error:", error);
      return this.getFallbackRecommendations(profileData, scores);
    }
  }

  /**
   * Fallback recommendations if AI fails
   */
  getFallbackRecommendations(profileData, scores) {
    const improvements = [];

    if (scores.headline < 7) {
      improvements.push({
        priority: "high",
        category: "headline",
        suggestion:
          "Improve your headline by adding your role, value proposition, and key skills. Aim for 50-120 characters.",
      });
    }

    if (scores.about < 7) {
      improvements.push({
        priority: "high",
        category: "about",
        suggestion:
          "Rewrite your about section with a personal story, key achievements, and a clear call-to-action. Aim for 200-300 words.",
      });
    }

    if (scores.keywords < 5) {
      improvements.push({
        priority: "medium",
        category: "keywords",
        suggestion:
          "Add more industry-relevant keywords throughout your profile for better search visibility.",
      });
    }

    return {
      headlines: [
        `${
          profileData.industry || "Professional"
        } Expert | Helping Companies Grow | ${
          profileData.location || "Global"
        }`,
        `${
          profileData.industry || "Senior"
        } Leader | Driving Innovation & Results | Open to Connect`,
        `Experienced ${
          profileData.industry || "Professional"
        } | Strategy & Execution | Let's Connect`,
      ],
      aboutSection: `I'm a passionate ${
        profileData.industry || "professional"
      } with a proven track record of delivering results. With extensive experience in ${
        profileData.industry || "my field"
      }, I help organizations achieve their goals through strategic thinking and hands-on execution.\n\nThroughout my career, I've successfully led initiatives that drive growth, innovation, and operational excellence. I believe in the power of collaboration and continuous learning.\n\nLet's connect! I'm always open to discussing new opportunities, partnerships, and ways to create value together.`,
      skills: [
        "Leadership",
        "Strategic Planning",
        "Team Management",
        "Project Management",
        "Communication",
        "Problem Solving",
        "Data Analysis",
        "Business Development",
        "Innovation",
        "Stakeholder Management",
      ],
      keywords: [
        "Leadership",
        "Strategy",
        "Growth",
        "Innovation",
        "Results-Driven",
        "Team Building",
        "Digital Transformation",
        "Industry Expert",
      ],
      improvements,
    };
  }

  /**
   * Get analysis history for user
   */
  async getAnalysisHistory(userId, limit = 10) {
    try {
      const analyses = await ProfileAnalysis.find({ userId })
        .sort({ analyzedAt: -1 })
        .limit(limit)
        .select("-__v");

      return {
        success: true,
        data: analyses,
      };
    } catch (error) {
      console.error("❌ Error fetching analysis history:", error);
      throw error;
    }
  }
}

export default new ProfileAnalyzer();

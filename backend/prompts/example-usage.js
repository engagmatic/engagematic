/**
 * Example: How to use the Profile Analyzer Prompt
 * 
 * This file demonstrates how to integrate the world-class profile analyzer prompt
 * into your existing profile analyzer service.
 */

import { buildProfileAnalyzerPrompt } from './profileAnalyzerPrompt.js';
import googleAI from '../services/googleAI.js';

/**
 * Example function: Analyze profile using the new prompt
 * 
 * @param {Object} profileData - User profile data
 * @returns {Promise<Object>} - Analysis result with score, suggestions, and post
 */
export async function analyzeProfileWithNewPrompt(profileData) {
  try {
    // Build the prompt with user data
    const prompt = buildProfileAnalyzerPrompt({
      userType: profileData.userType || "Other",
      headline: profileData.headline || "",
      about: profileData.about || profileData.summary || "",
      roleIndustry: `${profileData.role || ""} | ${profileData.industry || ""}`.trim(),
      location: profileData.location || "",
      targetAudience: profileData.targetAudience || "",
      mainGoal: profileData.mainGoal || "",
      additionalText: profileData.additionalText || "",
    });

    // Generate analysis using Google AI
    const response = await googleAI.generatePost(
      "LinkedIn Profile Analysis",
      prompt,
      {
        name: "LinkedInPulse Profile Coach",
        tone: "professional",
        writingStyle: "analytical",
      }
    );

    // Extract and parse JSON from response
    const textContent = response.content || JSON.stringify(response);
    
    // Try to extract JSON from response (handle markdown code blocks)
    let jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find JSON in markdown code blocks
      jsonMatch = textContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[0], jsonMatch[1]];
      }
    }

    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    // Parse the JSON
    const analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // Validate the structure
    validateAnalysisStructure(analysis);

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error("❌ Profile analysis error:", error);
    
    // Return fallback analysis
    return {
      success: false,
      error: error.message,
      data: getFallbackAnalysis(profileData),
    };
  }
}

/**
 * Validate the analysis structure
 * @param {Object} analysis - Analysis object to validate
 */
function validateAnalysisStructure(analysis) {
  const requiredFields = [
    'profile_score',
    'summary_points',
    'headline_suggestions',
    'about_outline',
    'quick_wins',
    'generated_post_intro',
    'generated_post',
  ];

  for (const field of requiredFields) {
    if (!(field in analysis)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate profile_score is a number between 0-100
  if (typeof analysis.profile_score !== 'number' || 
      analysis.profile_score < 0 || 
      analysis.profile_score > 100) {
    throw new Error('profile_score must be a number between 0 and 100');
  }

  // Validate arrays
  if (!Array.isArray(analysis.summary_points)) {
    throw new Error('summary_points must be an array');
  }
  if (!Array.isArray(analysis.headline_suggestions)) {
    throw new Error('headline_suggestions must be an array');
  }
  if (!Array.isArray(analysis.quick_wins)) {
    throw new Error('quick_wins must be an array');
  }
}

/**
 * Fallback analysis if AI generation fails
 * @param {Object} profileData - User profile data
 * @returns {Object} - Basic fallback analysis
 */
function getFallbackAnalysis(profileData) {
  const hasHeadline = !!(profileData.headline || profileData.headline);
  const hasAbout = !!(profileData.about || profileData.summary);
  const hasSkills = !!(profileData.skills && profileData.skills.length > 0);
  
  let score = 50; // Base score
  if (hasHeadline) score += 15;
  if (hasAbout) score += 20;
  if (hasSkills) score += 15;

  return {
    profile_score: Math.min(score, 100),
    summary_points: [
      hasHeadline 
        ? "Your headline is present, but could be optimized for better visibility." 
        : "Add a compelling headline that clearly states your value proposition.",
      hasAbout 
        ? "Your About section exists, but consider adding specific achievements and metrics." 
        : "Create an About section that tells your story and highlights your impact.",
      hasSkills 
        ? "You have skills listed. Consider adding more industry-relevant keywords." 
        : "Add 5-10 relevant skills to improve your profile's searchability.",
    ],
    headline_suggestions: [
      profileData.headline || "Professional | [Your Role] | [Your Value]",
      "[Your Role] | Helping [Target Audience] | [Key Skill/Expertise]",
    ],
    about_outline: "Start with who you are and what you do. Include 2-3 key achievements or results. Mention what you're passionate about. End with how people can connect with you.",
    quick_wins: [
      "Add a professional profile photo",
      "Complete your About section with specific achievements",
      "Add 5-10 relevant skills",
      "Include location and industry information",
      "Add a custom LinkedIn profile URL",
    ],
    generated_post_intro: "Here's a LinkedIn post tailored to your profile and goal.",
    generated_post: "Excited to share my journey in [your field]. Every challenge has been a learning opportunity, and I'm grateful for the growth. What's the biggest lesson you've learned in your career? Let's connect and share experiences!",
  };
}

/**
 * Example: Integration into existing ProfileAnalyzer service
 * 
 * You can add this method to your existing ProfileAnalyzer class:
 * 
 * async generateRecommendationsWithNewPrompt(profileData, scores) {
 *   try {
 *     const result = await analyzeProfileWithNewPrompt({
 *       userType: this.detectUserType(profileData),
 *       headline: profileData.headline || "",
 *       about: profileData.about || profileData.summary || "",
 *       role: this.extractRole(profileData),
 *       industry: profileData.industry || "",
 *       location: profileData.location || "",
 *       targetAudience: profileData.targetAudience || "",
 *       mainGoal: profileData.mainGoal || "build credibility",
 *     });
 * 
 *     if (result.success) {
 *       return {
 *         headlines: result.data.headline_suggestions,
 *         aboutSection: result.data.about_outline,
 *         skills: [], // Can be enhanced
 *         keywords: [], // Can be enhanced
 *         improvements: result.data.quick_wins.map(win => ({
 *           priority: "high",
 *           category: "optimization",
 *           suggestion: win,
 *           expectedImpact: "Improved profile visibility and engagement",
 *         })),
 *         profileScore: result.data.profile_score,
 *         summaryPoints: result.data.summary_points,
 *         generatedPost: {
 *           intro: result.data.generated_post_intro,
 *           content: result.data.generated_post,
 *         },
 *       };
 *     }
 *   } catch (error) {
 *     console.error("Error using new prompt:", error);
 *     // Fall back to existing method
 *     return this.generateRecommendations(profileData, scores);
 *   }
 * }
 */

export default {
  analyzeProfileWithNewPrompt,
  validateAnalysisStructure,
  getFallbackAnalysis,
};


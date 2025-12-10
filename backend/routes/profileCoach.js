import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import linkedinProfileCoach from "../services/linkedinProfileCoach.js";

const router = express.Router();

/**
 * POST /api/profile-coach/analyze
 * 
 * Analyze a LinkedIn profile from URL using the new LinkedInPulse Profile Coach
 * This endpoint scrapes the profile and generates AI-powered optimization suggestions.
 * 
 * Body:
 * {
 *   profileUrl: string (required) - LinkedIn profile URL
 *   userType: string (optional) - "Student", "Early Professional", "Senior Leader / Thought Leader", or "Other"
 *   targetAudience: string (optional) - Who they want to speak to
 *   mainGoal: string (optional) - "get interviews", "build credibility", "attract clients", "grow followers"
 * }
 */
router.post(
  "/analyze",
  authenticateToken,
  [
    body("profileUrl")
      .isURL()
      .withMessage("Valid LinkedIn profile URL is required")
      .matches(/linkedin\.com\/in\//)
      .withMessage("Must be a LinkedIn profile URL (linkedin.com/in/...)"),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { profileUrl, userType, targetAudience, mainGoal } = req.body;

      console.log("📊 Profile Coach Analysis Request:", {
        profileUrl,
        userType,
        targetAudience,
        mainGoal,
      });

      // Analyze profile from URL with comprehensive error handling
      try {
        const result = await linkedinProfileCoach.analyzeProfileFromUrl(profileUrl, {
          userType,
          targetAudience,
          mainGoal,
        });

        // Validate result
        if (!result || !result.success) {
          throw new Error("Analysis returned unsuccessful result");
        }

        if (!result.data) {
          throw new Error("Analysis returned empty data");
        }

        // Return successful result
        res.json({
          success: true,
          data: result.data,
          tokensUsed: result.tokensUsed || 0,
          message: "Profile analysis completed successfully",
        });
      } catch (error) {
        console.error("❌ Profile Coach error:", error);
        
        // Return user-friendly error
        const errorMessage = error.message || "An unexpected error occurred";
        const statusCode = errorMessage.includes('not found') || errorMessage.includes('Invalid') ? 400 : 500;
        
        res.status(statusCode).json({
          success: false,
          error: errorMessage,
          message: "Unable to complete profile analysis. Please check the error message and try again.",
        });
      }
    } catch (error) {
      console.error("❌ Profile Coach analysis error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to analyze profile",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

/**
 * POST /api/profile-coach/test
 * 
 * Test endpoint that doesn't require authentication
 * Accepts LinkedIn profile URL and optional user input
 */
router.post("/test", async (req, res) => {
  try {
    const { profileUrl, userType, targetAudience, mainGoal } = req.body;
    
    // Rate limiting for anonymous users (1 free analysis per IP per 24 hours)
    if (!req.user) {
      const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
      const rateLimitKey = `profile_analyzer_anonymous_${clientIp}`;
      
      try {
        const { checkAnonymousRateLimit } = await import("../middleware/rateLimit.js");
        const rateLimitCheck = await checkAnonymousRateLimit(rateLimitKey, 1, 24 * 60 * 60 * 1000);
        
        if (!rateLimitCheck.allowed) {
          return res.status(429).json({
            success: false,
            error: "Free analysis limit reached",
            message: "You've used your free analysis. Sign up for more analyses!",
            code: "RATE_LIMIT_EXCEEDED",
          });
        }
      } catch (rateLimitError) {
        console.warn("Rate limit check failed, allowing request:", rateLimitError);
        // Continue if rate limiting fails (graceful degradation)
      }
    }

    // If profileUrl is provided, use URL-based analysis
    if (profileUrl) {
      if (!profileUrl.includes("linkedin.com/in/")) {
        return res.status(400).json({
          success: false,
          error: "Invalid LinkedIn profile URL. Must include 'linkedin.com/in/'",
        });
      }

      console.log("🧪 Test Profile Coach Analysis from URL:", profileUrl);

      try {
        const result = await linkedinProfileCoach.analyzeProfileFromUrl(profileUrl, {
          userType,
          targetAudience,
          mainGoal,
        });

        // Validate result
        if (!result || !result.success || !result.data) {
          throw new Error("Analysis returned invalid result");
        }

        // Record anonymous usage if not authenticated
        if (!req.user) {
          try {
            const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
            const rateLimitKey = `profile_analyzer_anonymous_${clientIp}`;
            const { recordAnonymousUsage } = await import("../middleware/rateLimit.js");
            await recordAnonymousUsage(rateLimitKey);
          } catch (rateLimitError) {
            console.warn("Failed to record anonymous usage:", rateLimitError);
          }
        }

        return res.json({
          success: true,
          data: result.data,
          tokensUsed: result.tokensUsed || 0,
          message: "Test analysis completed successfully",
        });
      } catch (error) {
        console.error("❌ Test analysis error:", error);
        console.error("Error stack:", error.stack);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        
        const errorMessage = error.message || "An unexpected error occurred";
        const statusCode = errorMessage.includes('not found') || errorMessage.includes('Invalid') || errorMessage.includes('profile') || errorMessage.includes('URL') ? 400 : 500;
        
        // Provide more specific error messages
        let userMessage = errorMessage;
        if (errorMessage.includes('SerpApi') || errorMessage.includes('SERPAPI')) {
          if (errorMessage.includes('not configured') || errorMessage.includes('Invalid API key')) {
            userMessage = "LinkedIn profile scraping service is not configured. Please contact support.";
          } else if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('quota')) {
            userMessage = "LinkedIn profile scraping quota exceeded. Please try again later or upgrade your plan.";
          } else if (errorMessage.includes('not found') || errorMessage.includes('404') || errorMessage.includes('not indexed')) {
            userMessage = "LinkedIn profile not found via search. The profile may not be indexed by Google, may be private, or the URL may be incorrect. Please verify the profile URL is correct and the profile is public.";
          } else if (errorMessage.includes("Google hasn't returned")) {
            userMessage = "Google search did not return results for this LinkedIn profile. The profile may not be indexed by Google or may be private. Please verify the profile URL is correct.";
          } else {
            userMessage = "LinkedIn profile scraping service error. Please try again in a few minutes.";
          }
        } else if (errorMessage.includes('Google Gemini') || errorMessage.includes('overloaded') || errorMessage.includes('503')) {
          userMessage = "AI analysis service is temporarily overloaded. Please try again in a few moments.";
        } else if (errorMessage.includes('not found') || errorMessage.includes('Invalid') || errorMessage.includes('URL')) {
          userMessage = "LinkedIn profile not found or invalid URL. Please check the URL and ensure the profile is public.";
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          userMessage = "API rate limit exceeded. Please try again later.";
        } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          userMessage = "Request timed out. The profile may be taking too long to load. Please try again.";
        } else if (errorMessage.includes('Network error') || errorMessage.includes('fetch') || errorMessage.includes('SerpApi connection failed')) {
          // Show the actual error message from SerpApi, not a generic network error
          userMessage = errorMessage.includes('SerpApi') ? errorMessage : "Network error. Please check your internet connection and try again.";
        }
        
        return res.status(statusCode).json({
          success: false,
          error: errorMessage,
          message: userMessage,
        });
      }
    }

    // NO FALLBACK - profileUrl is REQUIRED
    return res.status(400).json({
      success: false,
      error: "profileUrl is required. Please provide a valid LinkedIn profile URL.",
      message: "A LinkedIn profile URL is required for analysis. No fallback data is allowed.",
    });
  } catch (error) {
    console.error("❌ Test analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Test analysis failed",
      error: error.message,
    });
  }
});

/**
 * POST /api/profile-coach/generate-post
 * 
 * Generate a LinkedIn post based on profile analysis
 * 
 * Body:
 * {
 *   profileUrl: string (optional) - LinkedIn profile URL
 *   analysis: object (optional) - Existing analysis data
 * }
 */
router.post("/generate-post", async (req, res) => {
  try {
    const { profileUrl, analysis } = req.body;

    if (!analysis && !profileUrl) {
      return res.status(400).json({
        success: false,
        error: "Either analysis data or profileUrl is required",
      });
    }

    console.log("📝 Generating LinkedIn post...");

    try {
      // If we have analysis, use it; otherwise analyze from URL
      let profileData = analysis;
      
      if (!profileData && profileUrl) {
        const analysisResult = await linkedinProfileCoach.analyzeProfileFromUrl(profileUrl, {});
        profileData = analysisResult.data;
      }

      // Generate post using the profile coach service
      const postResult = await linkedinProfileCoach.generatePost(profileData);

      if (!postResult || !postResult.success) {
        throw new Error("Post generation failed");
      }

      return res.json({
        success: true,
        data: {
          generated_post: postResult.data,
        },
        message: "Post generated successfully",
      });
    } catch (error) {
      console.error("❌ Post generation error:", error);
      const errorMessage = error.message || "An unexpected error occurred";
      return res.status(500).json({
        success: false,
        error: errorMessage,
        message: "Unable to generate post. Please try again.",
      });
    }
  } catch (error) {
    console.error("❌ Post generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate post",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;


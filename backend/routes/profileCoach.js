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
    console.log("✅ /api/profile-coach/test endpoint hit");
    console.log("Request body:", req.body);
    console.log("Request method:", req.method);
    console.log("Request path:", req.path);
    console.log("Request originalUrl:", req.originalUrl);
    
    const { profileUrl, userType, targetAudience, mainGoal } = req.body;
    
    // TEMPORARILY DISABLED: Rate limiting for anonymous users (1 free analysis per IP per 24 hours)
    // TODO: Re-enable rate limiting after testing is complete and feature is confirmed working
    // Uncomment the code below to restore rate limiting:
    /*
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
    */

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

        // TEMPORARILY DISABLED: Record anonymous usage if not authenticated
        // TODO: Re-enable usage recording after testing is complete
        // Uncomment the code below to restore usage tracking:
        /*
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
        */

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
        // Determine status code based on error type
        let statusCode = 500;
        if (errorMessage.includes('not found') || errorMessage.includes('Invalid') || errorMessage.includes('profile') || errorMessage.includes('URL') || errorMessage.includes('hasn\'t returned')) {
          statusCode = 400;
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('quota')) {
          statusCode = 429;
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('API key')) {
          statusCode = 401;
        }
        
        // Provide more specific error messages - CoreSignal specific
        let userMessage = errorMessage;
        
        // CoreSignal specific errors
        if (errorMessage.includes('CoreSignal') || errorMessage.includes('coresignal')) {
          if (errorMessage.includes('not configured') || errorMessage.includes('API key not configured')) {
            userMessage = "CoreSignal API key not configured. Please check your CORESIGNAL_API_KEY in the backend .env file.";
          } else if (errorMessage.includes('Invalid') && errorMessage.includes('API key')) {
            userMessage = "Invalid CoreSignal API key. Please verify your CORESIGNAL_API_KEY is correct in the backend .env file.";
          } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            userMessage = "CoreSignal API rate limit exceeded. Please try again later.";
          } else if (errorMessage.includes('not found') || errorMessage.includes('not in CoreSignal database') || errorMessage.includes('404')) {
            userMessage = `LinkedIn profile not found in CoreSignal database. This may be because:
1. The profile is not yet indexed in CoreSignal's database (new profiles may take time)
2. The profile URL format is incorrect
3. The profile may have privacy restrictions

Please verify:
- The profile URL is correct (format: https://www.linkedin.com/in/username)
- The profile is public and accessible
- Try with a well-known public LinkedIn profile to test

Note: CoreSignal may not have all LinkedIn profiles in their database.`;
          } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
            userMessage = "CoreSignal API request timed out. Please try again.";
          } else if (errorMessage.includes('incomplete') || errorMessage.includes('missing')) {
            userMessage = `CoreSignal returned incomplete profile data: ${errorMessage}`;
          } else {
            userMessage = `CoreSignal API error: ${errorMessage}`;
          }
        } else if (errorMessage.includes('SerpApi') || errorMessage.includes('SERPAPI')) {
          // Legacy - should not happen anymore
          userMessage = "LinkedIn profile scraping service error. Please contact support.";
        } else if (errorMessage.includes('Google Gemini') || errorMessage.includes('overloaded') || errorMessage.includes('503')) {
          userMessage = "AI analysis service is temporarily overloaded. Please try again in a few moments.";
        } else if (errorMessage.includes('not found') || errorMessage.includes('Invalid') || errorMessage.includes('URL')) {
          userMessage = `LinkedIn profile not found. ${errorMessage}`;
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          userMessage = "API rate limit exceeded. Please try again later.";
        } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          userMessage = "Request timed out. Please try again.";
        } else if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
          userMessage = "Network error. Please check your internet connection and try again.";
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


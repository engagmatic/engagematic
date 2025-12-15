import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import linkedinProfileCoach from "../services/linkedinProfileCoach.js";
import { checkAnalysisLimit, recordAnalysisUsage } from "../services/analysisLimits.js";
import { generateAnalysisPDF } from "../services/pdfExport.js";

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
        userId: req.user?.id,
      });

      // Check analysis limit for authenticated user
      const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
      const limitCheck = await checkAnalysisLimit(req.user?.id || null, clientIp);

      if (!limitCheck.allowed) {
        return res.status(429).json({
          success: false,
          error: "Analysis limit reached",
          message: limitCheck.message || "You've reached your analysis limit",
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
          plan: limitCheck.plan,
          redirectTo: limitCheck.redirectTo || "/pricing",
        });
      }

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

        // Record usage after successful analysis
        try {
          await recordAnalysisUsage(
            req.user?.id || null,
            clientIp,
            profileUrl,
            result.data,
            result.tokensUsed || 0
          );
        } catch (recordError) {
          console.warn("Failed to record analysis usage:", recordError);
          // Don't fail the request if recording fails
        }

        // Return successful result
        res.json({
          success: true,
          data: result.data,
          tokensUsed: result.tokensUsed || 0,
          message: "Profile analysis completed successfully",
          usage: {
            remaining: limitCheck.remaining - 1,
            limit: limitCheck.limit,
            plan: limitCheck.plan,
          },
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
    
    // Check analysis limit (1 free for anonymous, plan-based for authenticated)
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userId = req.user?.id || null;
    
    const limitCheck = await checkAnalysisLimit(userId, clientIp);
    
    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: "Analysis limit reached",
        message: limitCheck.message || "You've reached your analysis limit",
        limit: limitCheck.limit,
        remaining: limitCheck.remaining,
        plan: limitCheck.plan,
        redirectTo: limitCheck.redirectTo || (userId ? "/pricing" : "/signup"),
        requiresAuth: !userId,
      });
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

        // Record usage after successful analysis
        try {
          await recordAnalysisUsage(
            userId,
            clientIp,
            profileUrl,
            result.data,
            result.tokensUsed || 0
          );
        } catch (recordError) {
          console.warn("Failed to record analysis usage:", recordError);
          // Don't fail the request if recording fails
        }

        return res.json({
          success: true,
          data: result.data,
          tokensUsed: result.tokensUsed || 0,
          message: "Test analysis completed successfully",
          usage: {
            remaining: limitCheck.remaining - 1,
            limit: limitCheck.limit,
            plan: limitCheck.plan,
            requiresAuth: !userId,
          },
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
 * GET /api/profile-coach/export-pdf
 * 
 * Export analysis report as PDF
 * 
 * Query params:
 * - analysisId: ID of the analysis to export (optional)
 * - analysisData: JSON string of analysis data (optional)
 */
router.get("/export-pdf", async (req, res) => {
  try {
    const { analysisId, analysisData: analysisDataStr, profileName, profileHeadline } = req.query;

    let analysisData;
    let profileData = {};

    if (analysisId) {
      // Fetch from database if analysisId provided
      const ProfileAnalysisUsage = (await import("../models/ProfileAnalysisUsage.js")).default;
      const usage = await ProfileAnalysisUsage.findById(analysisId);
      if (!usage || !usage.analysisData) {
        return res.status(404).json({
          success: false,
          error: "Analysis not found",
        });
      }
      analysisData = usage.analysisData;
      profileData = {
        name: profileName || "LinkedIn Profile",
        headline: profileHeadline || "",
      };
    } else if (analysisDataStr) {
      // Parse from query string
      try {
        analysisData = JSON.parse(decodeURIComponent(analysisDataStr));
        profileData = {
          name: profileName || "LinkedIn Profile",
          headline: profileHeadline || "",
        };
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: "Invalid analysis data format",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: "Either analysisId or analysisData is required",
      });
    }

    if (!analysisData) {
      return res.status(400).json({
        success: false,
        error: "Analysis data is required",
      });
    }

    console.log("📄 Generating PDF report...");

    try {
      const pdfBuffer = await generateAnalysisPDF(analysisData, profileData);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="linkedin-profile-analysis-${Date.now()}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate PDF",
        message: error.message,
      });
    }
  } catch (error) {
    console.error("❌ PDF export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export PDF",
      error: error.message,
    });
  }
});

/**
 * POST /api/profile-coach/export-pdf
 * 
 * Export analysis report as PDF (POST method for larger data)
 * 
 * Body:
 * {
 *   analysisData: object - Analysis result data
 *   profileData: object - Profile data (name, headline, etc.)
 * }
 */
router.post("/export-pdf", async (req, res) => {
  try {
    const { analysisData, profileData = {} } = req.body;

    if (!analysisData) {
      return res.status(400).json({
        success: false,
        error: "Analysis data is required",
      });
    }

    console.log("📄 Generating PDF report...");

    try {
      const pdfBuffer = await generateAnalysisPDF(analysisData, profileData);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="linkedin-profile-analysis-${Date.now()}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate PDF",
        message: error.message,
      });
    }
  } catch (error) {
    console.error("❌ PDF export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export PDF",
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

/**
 * GET /api/profile-coach/export/:usageId
 * 
 * Export analysis report as PDF
 * Requires authentication
 */
router.get("/export/:usageId", authenticateToken, async (req, res) => {
  try {
    const { usageId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Find the analysis usage record
    const usage = await ProfileAnalysisUsage.findById(usageId);
    
    if (!usage) {
      return res.status(404).json({
        success: false,
        error: "Analysis not found",
      });
    }

    // Verify ownership (user can only export their own analyses)
    if (usage.userId?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (!usage.analysisData) {
      return res.status(400).json({
        success: false,
        error: "Analysis data not available",
      });
    }

    // Generate PDF
    const pdfBuffer = await generateAnalysisPDF(usage.analysisData, {
      name: usage.analysisData.name || "Profile",
      profileUrl: usage.profileUrl,
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="linkedin-profile-analysis-${usageId}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ PDF export error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate PDF",
      message: error.message,
    });
  }
});

/**
 * POST /api/profile-coach/export
 * 
 * Export analysis report as PDF from analysis data
 * Requires authentication
 */
router.post("/export", authenticateToken, async (req, res) => {
  try {
    const { analysisData, profileInfo } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!analysisData) {
      return res.status(400).json({
        success: false,
        error: "Analysis data is required",
      });
    }

    // Generate PDF
    const pdfBuffer = await generateAnalysisPDF(analysisData, profileInfo || {});

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="linkedin-profile-analysis-${Date.now()}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ PDF export error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate PDF",
      message: error.message,
    });
  }
});

export default router;


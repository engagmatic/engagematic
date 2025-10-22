import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import profileAnalyzer from "../services/profileAnalyzer.js";
import subscriptionService from "../services/subscriptionService.js";
import pdfExportService from "../services/pdfExportService.js";
import ProfileAnalysis from "../models/ProfileAnalysis.js";

const router = express.Router();

// Analyze LinkedIn profile
router.post(
  "/analyze",
  authenticateToken,
  [
    body("profileUrl")
      .isURL()
      .withMessage("Valid LinkedIn profile URL is required")
      .matches(/linkedin\.com/)
      .withMessage("Must be a LinkedIn URL"),
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

      const { profileUrl } = req.body;
      const userId = req.user.userId;

      // Check subscription for profile analysis
      const canAnalyze = await subscriptionService.canPerformAction(
        userId,
        "analyze_profile"
      );

      if (!canAnalyze.allowed) {
        return res.status(403).json({
          success: false,
          message: canAnalyze.reason,
          code: canAnalyze.code || "SUBSCRIPTION_LIMIT_EXCEEDED",
          current: canAnalyze.current,
          limit: canAnalyze.limit,
        });
      }

      // Analyze profile
      const result = await profileAnalyzer.analyzeProfile(profileUrl, userId);

      // Record usage for profile analysis
      await subscriptionService.recordUsage(userId, "analyze_profile");

      // Get updated subscription info
      const subscription = await subscriptionService.getUserSubscription(
        userId
      );

      res.json({
        ...result,
        subscription: {
          usage: subscription.usage.profileAnalyses,
          limit: subscription.limits.profileAnalyses,
          remaining:
            subscription.limits.profileAnalyses === -1
              ? -1
              : subscription.limits.profileAnalyses -
                subscription.usage.profileAnalyses,
        },
      });
    } catch (error) {
      console.error("Profile analysis error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to analyze profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Get analysis history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const result = await profileAnalyzer.getAnalysisHistory(userId, limit);

    res.json(result);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analysis history",
    });
  }
});

// Export analysis as PDF
router.get("/export-pdf/:analysisId", authenticateToken, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user.userId;

    console.log("📄 Generating PDF for analysis:", analysisId);

    // Find the analysis
    const analysis = await ProfileAnalysis.findById(analysisId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    // Check ownership
    if (analysis.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this analysis",
      });
    }

    // Prepare data for PDF
    const pdfData = {
      scores: analysis.scores,
      recommendations: {
        headlines: analysis.suggestedHeadlines || [],
        aboutSection: analysis.suggestedAbout || "",
        skills: analysis.suggestedSkills || [],
        keywords: analysis.keywords || [],
        improvements: analysis.recommendations || [],
        industryInsights: analysis.industryInsights || {},
      },
      profileData: analysis.profileData || {},
      analyzedAt: analysis.analyzedAt,
    };

    // Generate PDF
    const pdfBuffer = await pdfExportService.generateProfileAnalysisPDF(
      pdfData
    );

    // Set response headers for PDF download
    const fileName = `LinkedIn_Analysis_${
      analysis.profileData.fullName || "Report"
    }_${new Date().toISOString().split("T")[0]}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    console.log("✅ PDF generated successfully:", fileName);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ PDF export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
});

export default router;

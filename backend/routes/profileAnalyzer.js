import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import profileAnalyzer from "../services/profileAnalyzer.js";
import subscriptionService from "../services/subscriptionService.js";

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

export default router;

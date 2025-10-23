import express from "express";
import { body, param } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import subscriptionService from "../services/subscriptionService.js";
import { validationResult } from "express-validator";

const router = express.Router();

// Get user's subscription details
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await subscriptionService.getUserSubscription(userId);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription details",
      error: error.message,
    });
  }
});

// Get usage statistics
router.get("/usage", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await subscriptionService.getUsageStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Usage stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch usage statistics",
      error: error.message,
    });
  }
});

// Check if user can perform an action
router.post(
  "/check-action",
  authenticateToken,
  [
    body("action")
      .isIn([
        "generate_post",
        "generate_comment",
        "use_template",
        "analyze_linkedin",
      ])
      .withMessage("Valid action is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.userId;
      const { action } = req.body;

      const result = await subscriptionService.canPerformAction(userId, action);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Action check error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check action permission",
        error: error.message,
      });
    }
  }
);

// Record usage
router.post(
  "/record-usage",
  authenticateToken,
  [
    body("action")
      .isIn([
        "generate_post",
        "generate_comment",
        "use_template",
        "analyze_linkedin",
      ])
      .withMessage("Valid action is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.userId;
      const { action } = req.body;

      const subscription = await subscriptionService.recordUsage(
        userId,
        action
      );

      res.json({
        success: true,
        message: "Usage recorded successfully",
        data: {
          usage: subscription.usage,
          tokens: subscription.tokens,
          limits: subscription.limits,
        },
      });
    } catch (error) {
      console.error("Usage recording error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to record usage",
        error: error.message,
      });
    }
  }
);

// Upgrade plan
router.post(
  "/upgrade",
  authenticateToken,
  [
    body("plan").isIn(["starter", "pro"]).withMessage("Valid plan is required"),
    body("billingInterval")
      .optional()
      .isIn(["monthly", "yearly"])
      .withMessage("Valid billing interval is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.userId;
      const { plan, billingInterval = "monthly" } = req.body;

      const subscription = await subscriptionService.upgradePlan(
        userId,
        plan,
        billingInterval
      );

      res.json({
        success: true,
        message: "Plan upgraded successfully",
        data: subscription,
      });
    } catch (error) {
      console.error("Plan upgrade error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upgrade plan",
        error: error.message,
      });
    }
  }
);

// Cancel subscription
router.post("/cancel", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await subscriptionService.cancelSubscription(userId);

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
});

// Get analytics (admin only)
router.get("/analytics", authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin check
    const analytics = await subscriptionService.getAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
});

// Handle expired trials (cron job endpoint)
router.post("/handle-expired-trials", async (req, res) => {
  try {
    const expiredCount = await subscriptionService.handleExpiredTrials();

    res.json({
      success: true,
      message: `Processed ${expiredCount} expired trials`,
      data: { expiredCount },
    });
  } catch (error) {
    console.error("Expired trials handling error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to handle expired trials",
      error: error.message,
    });
  }
});

export default router;

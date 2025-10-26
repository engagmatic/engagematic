import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import trialService from "../services/trialService.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

/**
 * Get trial status for authenticated user
 */
router.get("/status", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const trialStatus = await trialService.getTrialStatus(userId);

    if (trialStatus.error) {
      return res.status(400).json({
        success: false,
        message: trialStatus.error,
      });
    }

    res.json({
      success: true,
      data: trialStatus,
    });
  } catch (error) {
    console.error("Get trial status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trial status",
    });
  }
});

/**
 * Check if user can perform specific action during trial
 */
router.post(
  "/check-action",
  authenticateToken,
  [
    body("action")
      .isIn([
        "generate_post",
        "generate_comment",
        "generate_idea",
        "use_template",
        "analyze_linkedin",
      ])
      .withMessage("Invalid action type"),
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

      const userId = req.user.id;
      const { action } = req.body;

      const canPerform = await trialService.canPerformTrialAction(
        userId,
        action
      );

      res.json({
        success: true,
        data: canPerform,
      });
    } catch (error) {
      console.error("Check trial action error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check trial action",
      });
    }
  }
);

/**
 * Create trial subscription for new user
 */
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await trialService.createTrialSubscription(userId);

    res.json({
      success: true,
      message: "Trial subscription created successfully",
      data: {
        subscription,
        limits: trialService.getTrialLimits(),
      },
    });
  } catch (error) {
    console.error("Create trial subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create trial subscription",
    });
  }
});

/**
 * Handle trial expiry (admin only)
 */
router.post("/expire", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const subscription = await trialService.handleTrialExpiry(userId);

    res.json({
      success: true,
      message: "Trial expired successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Expire trial error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to expire trial",
    });
  }
});

/**
 * Send trial reminder (admin only)
 */
router.post("/send-reminder", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { userId, daysLeft } = req.body;
    if (!userId || daysLeft === undefined) {
      return res.status(400).json({
        success: false,
        message: "User ID and days left are required",
      });
    }

    const result = await trialService.sendTrialReminder(userId, daysLeft);

    res.json({
      success: result.success,
      message: result.success
        ? "Trial reminder sent successfully"
        : "Failed to send trial reminder",
      error: result.error,
    });
  } catch (error) {
    console.error("Send trial reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send trial reminder",
    });
  }
});

/**
 * Get trial metrics (admin only)
 */
router.get("/metrics", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const metrics = await trialService.getTrialMetrics();

    if (metrics.error) {
      return res.status(400).json({
        success: false,
        message: metrics.error,
      });
    }

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Get trial metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trial metrics",
    });
  }
});

/**
 * Get trial limits (public)
 */
router.get("/limits", (req, res) => {
  try {
    const limits = trialService.getTrialLimits();

    res.json({
      success: true,
      data: {
        limits,
        description: "7-day free trial limits",
        breakdown: {
          posts: "1 post per day for 7 days",
          comments: "2 comments per day for 7 days",
          ideas: "2 ideas per day for 7 days",
        },
      },
    });
  } catch (error) {
    console.error("Get trial limits error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trial limits",
    });
  }
});

export default router;

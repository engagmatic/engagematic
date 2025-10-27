// Backend API routes for Chrome Extension

import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import razorpayService from "../services/razorpay.js";
import pricingService from "../services/pricingService.js";
import UserSubscription from "../models/UserSubscription.js";
import { body } from "express-validator";
import { validationResult } from "express-validator";

const router = express.Router();

// Verify extension authentication
router.get("/auth/verify", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      authenticated: true,
      user: req.user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      authenticated: false,
      error: error.message,
    });
  }
});

// Check premium access for extension
router.get("/premium-check", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await UserSubscription.findOne({ userId });

    if (!subscription) {
      return res.json({
        success: true,
        hasAccess: false,
        plan: "trial",
        status: "none",
        message: "No subscription found",
      });
    }

    const isActive =
      subscription.status === "active" && subscription.plan !== "trial";

    res.json({
      success: true,
      hasAccess: isActive,
      plan: subscription.plan,
      status: subscription.status,
      limits: subscription.limits,
      usage: subscription.usage,
    });
  } catch (error) {
    console.error("Premium check error:", error);
    res.status(500).json({
      success: false,
      hasAccess: false,
      error: error.message,
    });
  }
});

// Generate content for extension
router.post(
  "/generate",
  authenticateToken,
  [
    body("type")
      .isIn(["post", "comment", "idea"])
      .withMessage("Valid content type is required"),
    body("topic").optional().isString(),
    body("context").optional().isString(),
    body("personaId").optional().isString(),
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
      const { type, topic, context, personaId } = req.body;

      // Check subscription
      const subscription = await UserSubscription.findOne({ userId });
      if (!subscription || subscription.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Active subscription required",
        });
      }

      // Check usage limits
      const actionType = type === "post" ? "generate_post" : "generate_comment";
      const checkResult = subscription.checkUsage(actionType);

      if (!checkResult.allowed) {
        return res.status(403).json({
          success: false,
          message: checkResult.reason,
          code: checkResult.code,
        });
      }

      // Generate content (this would call your AI service)
      // For now, returning placeholder
      res.json({
        success: true,
        content: "Generated content placeholder",
        usage: {
          action: actionType,
          creditsRemaining: checkResult.remaining,
        },
      });
    } catch (error) {
      console.error("Extension generation error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// Record extension usage
router.post(
  "/record-usage",
  authenticateToken,
  [
    body("action")
      .isIn(["generate_post", "generate_comment"])
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

      // Record usage
      const subscription = await UserSubscription.findOne({ userId });
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      subscription.recordUsage(action);
      await subscription.save();

      res.json({
        success: true,
        message: "Usage recorded",
        usage: subscription.usage,
      });
    } catch (error) {
      console.error("Usage recording error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

export default router;

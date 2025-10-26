import express from "express";
import { body, param } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import pricingService from "../services/pricingService.js";
import { validationResult } from "express-validator";

const router = express.Router();

// Get pricing configurations
router.get("/config", async (req, res) => {
  try {
    const configs = pricingService.getPricingConfigs();
    const presets = pricingService.getPresets();

    res.json({
      success: true,
      data: {
        configs,
        presets,
      },
    });
  } catch (error) {
    console.error("Pricing config error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pricing configurations",
      error: error.message,
    });
  }
});

// Calculate price for custom credits
router.post(
  "/calculate",
  [
    body("credits.posts")
      .isInt({ min: 10, max: 100 })
      .withMessage("Posts must be between 10 and 100"),
    body("credits.comments")
      .isInt({ min: 10, max: 100 })
      .withMessage("Comments must be between 10 and 100"),
    body("credits.ideas")
      .isInt({ min: 10, max: 100 })
      .withMessage("Ideas must be between 10 and 100"),
    body("currency")
      .optional()
      .isIn(["INR", "USD"])
      .withMessage("Currency must be INR or USD"),
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

      const { credits, currency = "USD" } = req.body;

      // Detect user region if currency not specified
      const detectedCurrency =
        currency || (await pricingService.detectUserRegion(req));

      const price = pricingService.getDisplayPrice(credits, detectedCurrency);
      const planName = pricingService.getPlanName(credits);
      const breakdown = pricingService.getPricingBreakdown(
        credits,
        detectedCurrency
      );

      res.json({
        success: true,
        data: {
          price,
          planName,
          currency: detectedCurrency,
          breakdown,
          credits,
        },
      });
    } catch (error) {
      console.error("Price calculation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate price",
        error: error.message,
      });
    }
  }
);

// Detect user's region/currency
router.get("/detect-region", async (req, res) => {
  try {
    const currency = await pricingService.detectUserRegion(req);

    res.json({
      success: true,
      data: {
        currency,
        region: currency === "INR" ? "India" : "International",
      },
    });
  } catch (error) {
    console.error("Region detection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to detect region",
      error: error.message,
    });
  }
});

// Create credit-based subscription
router.post(
  "/create-subscription",
  authenticateToken,
  [
    body("credits.posts")
      .isInt({ min: 10, max: 100 })
      .withMessage("Posts must be between 10 and 100"),
    body("credits.comments")
      .isInt({ min: 10, max: 100 })
      .withMessage("Comments must be between 10 and 100"),
    body("credits.ideas")
      .isInt({ min: 10, max: 100 })
      .withMessage("Ideas must be between 10 and 100"),
    body("currency")
      .optional()
      .isIn(["INR", "USD"])
      .withMessage("Currency must be INR or USD"),
    body("billingInterval")
      .optional()
      .isIn(["monthly", "yearly"])
      .withMessage("Billing interval must be monthly or yearly"),
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
      const {
        credits,
        currency = "USD",
        billingInterval = "monthly",
      } = req.body;

      // Validate credits
      const validation = pricingService.validateCredits(credits);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid credit selection",
          errors: validation.errors,
        });
      }

      const result = await pricingService.createCreditSubscription(
        userId,
        credits,
        currency,
        billingInterval
      );

      res.json({
        success: true,
        message: "Credit subscription created successfully",
        data: result,
      });
    } catch (error) {
      console.error("Credit subscription creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create credit subscription",
        error: error.message,
      });
    }
  }
);

// Update subscription credits
router.put(
  "/update-credits",
  authenticateToken,
  [
    body("credits.posts")
      .isInt({ min: 10, max: 100 })
      .withMessage("Posts must be between 10 and 100"),
    body("credits.comments")
      .isInt({ min: 10, max: 100 })
      .withMessage("Comments must be between 10 and 100"),
    body("credits.ideas")
      .isInt({ min: 10, max: 100 })
      .withMessage("Ideas must be between 10 and 100"),
    body("currency")
      .optional()
      .isIn(["INR", "USD"])
      .withMessage("Currency must be INR or USD"),
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
      const { credits, currency = "USD" } = req.body;

      // Validate credits
      const validation = pricingService.validateCredits(credits);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid credit selection",
          errors: validation.errors,
        });
      }

      const result = await pricingService.updateSubscriptionCredits(
        userId,
        credits,
        currency
      );

      res.json({
        success: true,
        message: "Subscription credits updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Subscription credits update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update subscription credits",
        error: error.message,
      });
    }
  }
);

// Get current subscription with pricing details
router.get("/current-subscription", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await pricingService.getCurrentSubscription(userId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    const credits = {
      posts: subscription.limits.postsPerMonth,
      comments: subscription.limits.commentsPerMonth,
      ideas: subscription.limits.ideasPerMonth,
    };

    const pricing = pricingService.getPricingBreakdown(
      credits,
      subscription.billing.currency
    );
    const planName = pricingService.getPlanName(credits);

    res.json({
      success: true,
      data: {
        subscription,
        pricing,
        planName,
        credits,
      },
    });
  } catch (error) {
    console.error("Current subscription fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current subscription",
      error: error.message,
    });
  }
});

// Validate credit selection
router.post(
  "/validate-credits",
  [
    body("credits.posts")
      .isInt({ min: 10, max: 100 })
      .withMessage("Posts must be between 10 and 100"),
    body("credits.comments")
      .isInt({ min: 10, max: 100 })
      .withMessage("Comments must be between 10 and 100"),
    body("credits.ideas")
      .isInt({ min: 10, max: 100 })
      .withMessage("Ideas must be between 10 and 100"),
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

      const { credits } = req.body;
      const validation = pricingService.validateCredits(credits);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      console.error("Credit validation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate credits",
        error: error.message,
      });
    }
  }
);

export default router;

import express from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import { validationResult } from "express-validator";
import Offer from "../models/Offer.js";

const router = express.Router();

// Validate coupon code
router.post(
  "/validate",
  authenticateToken,
  [body("code").notEmpty().withMessage("Coupon code is required")],
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

      const { code } = req.body;
      const userId = req.user.userId;

      // Find active offer
      const offer = await Offer.findOne({
        code: code.toUpperCase(),
        isActive: true,
      });

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: "Invalid coupon code",
        });
      }

      // Check if offer is valid
      const now = new Date();
      if (now < offer.startDate || now > offer.endDate) {
        return res.status(400).json({
          success: false,
          message: "Coupon code has expired",
        });
      }

      // Check usage limit
      if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "Coupon code usage limit exceeded",
        });
      }

      // Check per-user limit
      const userUsage = offer.usedBy.filter(
        (usage) => usage.userId.toString() === userId.toString()
      );
      const userUsageCount = userUsage.reduce(
        (sum, usage) => sum + (usage.usageCount || 1),
        0
      );

      if (userUsageCount >= offer.perUserLimit) {
        return res.status(400).json({
          success: false,
          message: "You have already used this coupon code",
        });
      }

      res.json({
        success: true,
        data: {
          code: offer.code,
          name: offer.name,
          description: offer.description,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          maxDiscountAmount: offer.maxDiscountAmount,
          minAmount: offer.minAmount,
          applicablePlans: offer.applicablePlans,
        },
      });
    } catch (error) {
      console.error("Coupon validation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate coupon",
        error: error.message,
      });
    }
  }
);

// Calculate discount amount (to be called during order creation)
router.post(
  "/calculate-discount",
  authenticateToken,
  [
    body("code").notEmpty().withMessage("Coupon code is required"),
    body("amount").isNumeric().withMessage("Valid amount is required"),
    body("plan").optional().isIn(["starter", "pro", "custom"]),
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

      const { code, amount, plan = "all" } = req.body;
      const userId = req.user.userId;

      const result = await Offer.validateOffer(code, amount, userId, plan);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      res.json({
        success: true,
        data: {
          discount: result.discount,
          finalAmount: Math.round((amount - result.discount) * 100) / 100,
          offerDetails: result.offer,
        },
      });
    } catch (error) {
      console.error("Discount calculation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate discount",
        error: error.message,
      });
    }
  }
);

// Get all active offers
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select("code name description discountType discountValue")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Fetch offers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
});

export default router;

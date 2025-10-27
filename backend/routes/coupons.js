import express from "express";
const router = express.Router();
import Coupon from "../models/Coupon.js";
import { authenticateToken } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";

// Public route to validate coupon code
router.post("/validate", async (req, res) => {
  try {
    const { code, amount, plan } = req.body;

    console.log("Coupon validation request:", { code, amount, plan });

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    console.log(
      "Found coupon:",
      coupon
        ? {
            code: coupon.code,
            isActive: coupon.isActive,
            applicablePlans: coupon.applicablePlans,
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            usageLimit: coupon.usageLimit,
            usageCount: coupon.usageCount,
          }
        : "Not found"
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    const userId = req.user?._id || null;
    const validation = coupon.isValid(userId, amount || 0);

    console.log("Coupon validation result:", validation);

    if (!validation.valid) {
      console.log("Coupon validation failed:", validation.error);
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    // Check if coupon applies to the selected plan
    // If applicablePlans is empty array, coupon applies to all plans
    // If it has values, the plan must be in the list
    console.log("Plan check:", {
      applicablePlans: coupon.applicablePlans,
      plan,
      planIncluded:
        coupon.applicablePlans && coupon.applicablePlans.includes(plan),
      shouldBlock:
        coupon.applicablePlans &&
        coupon.applicablePlans.length > 0 &&
        plan &&
        !coupon.applicablePlans.includes(plan),
    });

    if (
      coupon.applicablePlans &&
      coupon.applicablePlans.length > 0 &&
      plan &&
      !coupon.applicablePlans.includes(plan)
    ) {
      console.log("Coupon not applicable to plan:", plan);
      return res.status(400).json({
        success: false,
        message: "This coupon is not applicable to the selected plan",
      });
    }

    const discount = coupon.calculateDiscount(amount || 0);
    const finalAmount = (amount || 0) - discount;

    console.log("Coupon validation successful:", {
      discount,
      finalAmount,
      originalAmount: amount || 0,
    });

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        originalAmount: amount || 0,
        discount,
        finalAmount,
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
});

// Apply coupon (record usage)
router.post("/apply", authenticateToken, async (req, res) => {
  try {
    const { code, orderId } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    const validation = coupon.isValid(userId);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    // Record usage
    coupon.recordUsage(userId);
    await coupon.save();

    res.json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        couponCode: coupon.code,
        orderId,
      },
    });
  } catch (error) {
    console.error("Coupon application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
      error: error.message,
    });
  }
});

// Admin routes
// Get all coupons
router.get("/admin/all", authenticateToken, adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find({})
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("usedBy.userId", "name email");

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("Fetch coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
      error: error.message,
    });
  }
});

// Get single coupon
router.get("/admin/:id", authenticateToken, adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("usedBy.userId", "name email");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("Fetch coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
      error: error.message,
    });
  }
});

// Create coupon
router.post("/admin/create", authenticateToken, adminAuth, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      endDate,
      usageLimit,
      applicablePlans,
      isActive,
    } = req.body;

    if (!code || !discountType || !discountValue || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate: new Date(),
      endDate: new Date(endDate),
      usageLimit,
      applicablePlans,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    await coupon.save();

    res.json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      error: error.message,
    });
  }
});

// Update coupon
router.put("/admin/:id", authenticateToken, adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const updateData = req.body;

    // Handle date updates
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    Object.assign(coupon, updateData);
    await coupon.save();

    res.json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
      error: error.message,
    });
  }
});

// Delete coupon
router.delete("/admin/:id", authenticateToken, adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
      error: error.message,
    });
  }
});

export default router;

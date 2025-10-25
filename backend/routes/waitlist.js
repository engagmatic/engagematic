import express from "express";
import { body, validationResult } from "express-validator";
import Waitlist from "../models/Waitlist.js";

const router = express.Router();

// Submit to waitlist
router.post(
  "/join",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("name")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters"),
    body("linkedinUrl")
      .optional()
      .trim()
      .isURL()
      .withMessage("Valid LinkedIn URL required"),
    body("plan")
      .isIn(["starter", "pro"])
      .withMessage("Valid plan selection required"),
    body("billingPeriod")
      .optional()
      .isIn(["monthly", "yearly"])
      .withMessage("Billing period must be monthly or yearly"),
    body("currency")
      .optional()
      .isIn(["USD", "INR"])
      .withMessage("Currency must be USD or INR"),
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

      const {
        email,
        name,
        linkedinUrl,
        plan,
        billingPeriod,
        currency,
        referralCode,
      } = req.body;

      // Check if already in waitlist
      const existingEntry = await Waitlist.findOne({ email });
      if (existingEntry) {
        return res.status(200).json({
          success: true,
          message:
            "You're already on our waitlist! We'll notify you when premium plans launch.",
          data: {
            plan: existingEntry.plan,
            joinedAt: existingEntry.createdAt,
          },
        });
      }

      // Create waitlist entry
      const waitlistEntry = new Waitlist({
        email,
        name: name || null,
        linkedinUrl: linkedinUrl || null,
        plan,
        billingPeriod: billingPeriod || "monthly",
        currency: currency || "USD",
        referralCode: referralCode || null,
        source: "pricing_page",
      });

      await waitlistEntry.save();

      // Get position in waitlist
      const position = await Waitlist.countDocuments({
        plan,
        createdAt: { $lte: waitlistEntry.createdAt },
      });

      res.status(201).json({
        success: true,
        message:
          "🎉 You're on the waitlist! We'll notify you as soon as premium plans are available.",
        data: {
          email,
          plan,
          position,
          estimatedLaunch: "Q2 2025",
        },
      });
    } catch (error) {
      console.error("Waitlist join error:", error);

      if (error.code === 11000) {
        return res.status(200).json({
          success: true,
          message: "You're already on our waitlist! We'll be in touch soon.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to join waitlist. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Premium Waitlist - More detailed collection
router.post(
  "/add",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Name is required and cannot exceed 100 characters"),
    body("phone").optional().trim(),
    body("company").optional().trim(),
    body("role").optional().trim(),
    body("useCase").optional().trim(),
    body("preferredPlan").optional().trim(),
    body("source").optional().trim(),
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

      const {
        email,
        name,
        phone,
        company,
        role,
        useCase,
        preferredPlan,
        source,
        interestedFeatures,
      } = req.body;

      // Check if already in waitlist
      const existingEntry = await Waitlist.findOne({ email });
      if (existingEntry) {
        // Update with new information if provided
        if (phone) existingEntry.phone = phone;
        if (company) existingEntry.company = company;
        if (role) existingEntry.role = role;
        if (useCase) existingEntry.useCase = useCase;
        if (preferredPlan) existingEntry.preferredPlan = preferredPlan;
        if (interestedFeatures)
          existingEntry.interestedFeatures = interestedFeatures;

        await existingEntry.save();

        return res.status(200).json({
          success: true,
          message:
            "✨ Great news! You're already on our VIP waitlist. We've updated your preferences!",
          data: {
            email: existingEntry.email,
            name: existingEntry.name,
            joinedAt: existingEntry.createdAt,
            plan: existingEntry.preferredPlan || existingEntry.plan,
          },
        });
      }

      // Create waitlist entry with all details
      const waitlistEntry = new Waitlist({
        email,
        name,
        phone: phone || null,
        company: company || null,
        role: role || null,
        useCase: useCase || null,
        preferredPlan: preferredPlan || "Pro Plan",
        plan: "pro", // Default to pro for compatibility
        billingPeriod: "monthly",
        currency: "USD",
        source: source || "premium_modal",
        interestedFeatures: interestedFeatures || ["Premium Plans"],
        status: "pending",
      });

      await waitlistEntry.save();

      // Get position in waitlist
      const position = await Waitlist.countDocuments({
        createdAt: { $lte: waitlistEntry.createdAt },
      });

      console.log(`✨ New premium waitlist entry: ${email} from ${source}`);

      res.status(201).json({
        success: true,
        message:
          "🎉 Welcome to the VIP list! You'll be the first to know when we launch premium plans.",
        data: {
          email,
          name,
          preferredPlan: preferredPlan || "Pro Plan",
          position,
          estimatedLaunch: "Coming Soon",
          benefits: [
            "Early access before public launch",
            "Exclusive pricing (up to 40% off)",
            "Priority support and feature requests",
          ],
        },
      });
    } catch (error) {
      console.error("Premium waitlist error:", error);

      if (error.code === 11000) {
        return res.status(200).json({
          success: true,
          message:
            "✨ You're already on our VIP waitlist! We'll be in touch soon.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to join waitlist. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Get waitlist stats (admin only - add auth middleware later)
router.get("/stats", async (req, res) => {
  try {
    const stats = await Waitlist.aggregate([
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          contacted: {
            $sum: { $cond: [{ $eq: ["$status", "contacted"] }, 1, 0] },
          },
          converted: {
            $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
          },
        },
      },
    ]);

    const total = await Waitlist.countDocuments();

    res.json({
      success: true,
      data: {
        total,
        byPlan: stats,
      },
    });
  } catch (error) {
    console.error("Waitlist stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch waitlist stats",
    });
  }
});

export default router;

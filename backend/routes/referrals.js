import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";
import referralService from "../services/referralService.js";
import Referral from "../models/Referral.js";
import AffiliateCommission from "../models/AffiliateCommission.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   POST /api/referrals/generate
 * @desc    Generate referral code for current user
 * @access  Private
 */
router.post("/generate", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const referralCode = await referralService.generateReferralCode(user);

    res.json({
      success: true,
      data: {
        referralCode,
        referralLink: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/signup?ref=${referralCode}`,
      },
    });
  } catch (error) {
    console.error("Error generating referral code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate referral code",
    });
  }
});

/**
 * @route   GET /api/referrals/stats
 * @desc    Get current user's referral statistics
 * @access  Private
 */
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const stats = await referralService.getUserReferralStats(req.user._id);

    if (!stats.success) {
      return res.status(400).json(stats);
    }

    res.json(stats);
  } catch (error) {
    console.error("Error getting referral stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get referral stats",
    });
  }
});

/**
 * @route   POST /api/referrals/track
 * @desc    Track referral link click (public)
 * @access  Public
 */
router.post(
  "/track",
  [
    body("referralCode").notEmpty().withMessage("Referral code is required"),
    body("source").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { referralCode, source } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get("User-Agent");

      const result = await referralService.trackReferralClick(
        referralCode,
        ipAddress,
        userAgent,
        source
      );

      res.json(result);
    } catch (error) {
      console.error("Error tracking referral:", error);
      res.status(500).json({
        success: false,
        message: "Failed to track referral",
      });
    }
  }
);

/**
 * @route   GET /api/referrals/validate/:code
 * @desc    Validate referral code (public)
 * @access  Public
 */
router.get("/validate/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const referral = await Referral.findOne({
      referralCode: code.toUpperCase(),
    }).populate("referrerId", "name email");

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Invalid referral code",
      });
    }

    res.json({
      success: true,
      valid: true,
      data: {
        referrerName: referral.referrerId.name,
        extendedTrialDays: 14,
        benefit: "14-day trial instead of 7-day trial",
      },
    });
  } catch (error) {
    console.error("Error validating referral code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate referral code",
    });
  }
});

/**
 * @route   POST /api/referrals/apply-reward
 * @desc    Apply referral rewards to subscription
 * @access  Private
 */
router.post("/apply-reward", authenticateToken, async (req, res) => {
  try {
    const result = await referralService.applyReferralReward(req.user._id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error applying referral reward:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply referral reward",
    });
  }
});

/**
 * @route   POST /api/referrals/invite
 * @desc    Send referral invitations via email
 * @access  Private
 */
router.post(
  "/invite",
  [
    authenticateToken,
    body("emails")
      .isArray({ min: 1, max: 10 })
      .withMessage("Emails must be an array with 1-10 email addresses"),
    body("emails.*").isEmail().withMessage("Invalid email address"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { emails } = req.body;

      const result = await referralService.sendReferralInvites(
        req.user._id,
        emails
      );

      res.json(result);
    } catch (error) {
      console.error("Error sending referral invites:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send referral invites",
      });
    }
  }
);

/**
 * @route   GET /api/referrals/my-referrals
 * @desc    Get list of users referred by current user
 * @access  Private
 */
router.get("/my-referrals", authenticateToken, async (req, res) => {
  try {
    const referrals = await Referral.find({
      referrerId: req.user._id,
      status: { $in: ["completed", "rewarded"] },
    })
      .populate("referredUserId", "name email createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: referrals.map((ref) => ({
        id: ref._id,
        referredUser: {
          name: ref.referredUserId?.name || "Unknown",
          email: ref.referredUserId?.email || ref.referredUserEmail,
          joinedDate: ref.signupDate,
        },
        status: ref.status,
        rewardedDate: ref.rewardedDate,
        source: ref.source,
      })),
    });
  } catch (error) {
    console.error("Error getting user referrals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get referrals",
    });
  }
});

/**
 * @route   GET /api/referrals/commissions
 * @desc    Get commission history and stats for current affiliate
 * @access  Private
 */
router.get("/commissions", authenticateToken, async (req, res) => {
  try {
    const commissions = await AffiliateCommission.find({
      affiliateId: req.user._id,
    })
      .populate("referredUserId", "name email")
      .populate("subscriptionId", "plan status")
      .sort({ createdAt: -1 })
      .limit(50);

    // Get summary stats
    const stats = await AffiliateCommission.aggregate([
      { $match: { affiliateId: req.user._id } },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$monthlyCommissionAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        commissions,
        summary: stats.reduce(
          (acc, stat) => {
            acc[stat._id] = { total: stat.total, count: stat.count };
            return acc;
          },
          {}
        ),
      },
    });
  } catch (error) {
    console.error("Error getting commissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get commissions",
    });
  }
});


export default router;

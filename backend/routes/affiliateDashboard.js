import express from "express";
import { authenticateAffiliate } from "../middleware/affiliateAuth.js";
import AffiliateCommission from "../models/AffiliateCommission.js";
import Affiliate from "../models/Affiliate.js";
import Referral from "../models/Referral.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @route   GET /api/affiliate/dashboard/stats
 * @desc    Get affiliate dashboard statistics
 * @access  Private (Affiliate)
 */
router.get("/stats", authenticateAffiliate, async (req, res) => {
  try {
    const affiliateId = req.affiliateId;

    // Get affiliate with stats
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    // Calculate commission stats
    const commissionStats = await AffiliateCommission.aggregate([
      { $match: { affiliateId: new mongoose.Types.ObjectId(affiliateId) } },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: "$monthlyCommissionAmount" },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$monthlyCommissionAmount", 0],
            },
          },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, "$monthlyCommissionAmount", 0],
            },
          },
          activeSubscriptions: {
            $sum: {
              $cond: [{ $eq: ["$subscriptionActive", true] }, 1, 0],
            },
          },
          monthlyRecurring: {
            $sum: {
              $cond: [
                { $eq: ["$subscriptionActive", true] },
                "$monthlyCommissionAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const stats = commissionStats[0] || {
      totalEarned: 0,
      totalPending: 0,
      totalPaid: 0,
      activeSubscriptions: 0,
      monthlyRecurring: 0,
    };

    // Get total clicks
    const totalClicks = await Referral.aggregate([
      { $match: { referralCode: affiliate.affiliateCode } },
      { $group: { _id: null, total: { $sum: "$clickCount" } } },
    ]);

    // Get total signups
    const totalSignups = await Referral.countDocuments({
      referralCode: affiliate.affiliateCode,
      status: { $in: ["completed", "rewarded"] },
    });

    res.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate._id,
          name: affiliate.name,
          email: affiliate.email,
          affiliateCode: affiliate.affiliateCode,
          referralLink: affiliate.referralLink,
          status: affiliate.status,
        },
        stats: {
          totalClicks: totalClicks[0]?.total || 0,
          totalSignups: totalSignups,
          totalEarned: stats.totalEarned || 0,
          totalPending: stats.totalPending || 0,
          totalPaid: stats.totalPaid || 0,
          activeSubscriptions: stats.activeSubscriptions || 0,
          monthlyRecurring: stats.monthlyRecurring || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting affiliate stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get affiliate stats",
    });
  }
});

/**
 * @route   GET /api/affiliate/dashboard/commissions
 * @desc    Get affiliate commission history
 * @access  Private (Affiliate)
 */
router.get("/commissions", authenticateAffiliate, async (req, res) => {
  try {
    const affiliateId = req.affiliateId;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const commissions = await AffiliateCommission.find({
      affiliateId: affiliateId,
    })
      .populate("referredUserId", "name email")
      .populate("subscriptionId", "plan status")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await AffiliateCommission.countDocuments({
      affiliateId: affiliateId,
    });

    // Get summary by status
    const summary = await AffiliateCommission.aggregate([
      { $match: { affiliateId: new mongoose.Types.ObjectId(affiliateId) } },
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
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        summary: summary.reduce(
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

/**
 * @route   GET /api/affiliate/dashboard/referrals
 * @desc    Get list of referred users
 * @access  Private (Affiliate)
 */
router.get("/referrals", authenticateAffiliate, async (req, res) => {
  try {
    const affiliateId = req.affiliateId;
    const affiliate = await Affiliate.findById(affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    const referrals = await Referral.find({
      referralCode: affiliate.affiliateCode,
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
    console.error("Error getting referrals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get referrals",
    });
  }
});

export default router;


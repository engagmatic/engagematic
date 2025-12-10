import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import Affiliate from "../models/Affiliate.js";
import AffiliateCommission from "../models/AffiliateCommission.js";
import Referral from "../models/Referral.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @route   GET /api/admin/affiliates
 * @desc    Get all affiliates with filters
 * @access  Private (Admin)
 */
router.get("/", adminAuth, async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { affiliateCode: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const affiliates = await Affiliate.find(query)
      .select("-password")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Affiliate.countDocuments(query);

    res.json({
      success: true,
      data: {
        affiliates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error getting affiliates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get affiliates",
    });
  }
});

/**
 * @route   GET /api/admin/affiliates/stats
 * @desc    Get overall affiliate program statistics
 * @access  Private (Admin)
 */
router.get("/stats", adminAuth, async (req, res) => {
  try {
    // Total affiliates
    const totalAffiliates = await Affiliate.countDocuments();
    const activeAffiliates = await Affiliate.countDocuments({ status: "active" });
    const pendingAffiliates = await Affiliate.countDocuments({ status: "pending" });

    // Commission stats
    const commissionStats = await AffiliateCommission.aggregate([
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

    // Referral stats
    const referralStats = await Referral.aggregate([
      { $match: { referrerType: "Affiliate" } },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clickCount" },
          totalSignups: {
            $sum: {
              $cond: [{ $in: ["$status", ["completed", "rewarded"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Top affiliates by earnings
    const topAffiliates = await AffiliateCommission.aggregate([
      {
        $group: {
          _id: "$affiliateId",
          totalEarned: { $sum: "$monthlyCommissionAmount" },
          activeSubscriptions: {
            $sum: {
              $cond: [{ $eq: ["$subscriptionActive", true] }, 1, 0],
            },
          },
        },
      },
      { $sort: { totalEarned: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "affiliates",
          localField: "_id",
          foreignField: "_id",
          as: "affiliate",
        },
      },
      { $unwind: "$affiliate" },
      {
        $project: {
          _id: 0,
          affiliateId: "$_id",
          name: "$affiliate.name",
          email: "$affiliate.email",
          affiliateCode: "$affiliate.affiliateCode",
          totalEarned: 1,
          activeSubscriptions: 1,
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

    const referral = referralStats[0] || {
      totalClicks: 0,
      totalSignups: 0,
    };

    res.json({
      success: true,
      data: {
        affiliates: {
          total: totalAffiliates,
          active: activeAffiliates,
          pending: pendingAffiliates,
        },
        commissions: {
          totalEarned: stats.totalEarned,
          totalPending: stats.totalPending,
          totalPaid: stats.totalPaid,
          activeSubscriptions: stats.activeSubscriptions,
          monthlyRecurring: stats.monthlyRecurring,
        },
        referrals: {
          totalClicks: referral.totalClicks,
          totalSignups: referral.totalSignups,
        },
        topAffiliates,
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
 * @route   GET /api/admin/affiliates/:id
 * @desc    Get single affiliate details
 * @access  Private (Admin)
 */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id).select("-password");

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    // Get commission stats for this affiliate
    const commissionStats = await AffiliateCommission.aggregate([
      { $match: { affiliateId: new mongoose.Types.ObjectId(req.params.id) } },
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
        },
      },
    ]);

    // Get referral stats
    const referralStats = await Referral.aggregate([
      {
        $match: {
          referralCode: affiliate.affiliateCode,
        },
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clickCount" },
          totalSignups: {
            $sum: {
              $cond: [{ $in: ["$status", ["completed", "rewarded"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Get recent commissions
    const recentCommissions = await AffiliateCommission.find({
      affiliateId: req.params.id,
    })
      .populate("referredUserId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent referrals
    const recentReferrals = await Referral.find({
      referralCode: affiliate.affiliateCode,
    })
      .populate("referredUserId", "name email createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        affiliate,
        stats: {
          commissions: commissionStats[0] || {
            totalEarned: 0,
            totalPending: 0,
            totalPaid: 0,
            activeSubscriptions: 0,
          },
          referrals: referralStats[0] || {
            totalClicks: 0,
            totalSignups: 0,
          },
        },
        recentCommissions,
        recentReferrals,
      },
    });
  } catch (error) {
    console.error("Error getting affiliate details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get affiliate details",
    });
  }
});

/**
 * @route   PUT /api/admin/affiliates/:id/approve
 * @desc    Approve affiliate application
 * @access  Private (Admin)
 */
router.put("/:id/approve", adminAuth, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    if (affiliate.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Affiliate is already active",
      });
    }

    // Set status to active and record approval
    affiliate.status = "active";
    affiliate.approvalDate = new Date();
    affiliate.isActive = true; // Ensure isActive is also set
    await affiliate.save();

    console.log(`✅ Affiliate approved: ${affiliate.email} (${affiliate.affiliateCode})`);

    res.json({
      success: true,
      message: "Affiliate approved successfully. They can now start earning commissions.",
      data: affiliate,
    });
  } catch (error) {
    console.error("Error approving affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve affiliate",
    });
  }
});

/**
 * @route   PUT /api/admin/affiliates/:id/reject
 * @desc    Reject affiliate application
 * @access  Private (Admin)
 */
router.put("/:id/reject", adminAuth, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    affiliate.status = "rejected";
    await affiliate.save();

    res.json({
      success: true,
      message: "Affiliate application rejected",
      data: affiliate,
    });
  } catch (error) {
    console.error("Error rejecting affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject affiliate",
    });
  }
});

/**
 * @route   PUT /api/admin/affiliates/:id/suspend
 * @desc    Suspend active affiliate
 * @access  Private (Admin)
 */
router.put("/:id/suspend", adminAuth, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    affiliate.status = "suspended";
    affiliate.isActive = false;
    await affiliate.save();

    res.json({
      success: true,
      message: "Affiliate suspended successfully",
      data: affiliate,
    });
  } catch (error) {
    console.error("Error suspending affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to suspend affiliate",
    });
  }
});

/**
 * @route   PUT /api/admin/affiliates/:id/activate
 * @desc    Activate suspended affiliate
 * @access  Private (Admin)
 */
router.put("/:id/activate", adminAuth, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    affiliate.status = "active";
    affiliate.isActive = true;
    await affiliate.save();

    res.json({
      success: true,
      message: "Affiliate activated successfully",
      data: affiliate,
    });
  } catch (error) {
    console.error("Error activating affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to activate affiliate",
    });
  }
});

/**
 * @route   GET /api/admin/affiliates/:id/commissions
 * @desc    Get all commissions for an affiliate
 * @access  Private (Admin)
 */
router.get("/:id/commissions", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const commissions = await AffiliateCommission.find({
      affiliateId: req.params.id,
    })
      .populate("referredUserId", "name email")
      .populate("subscriptionId", "plan status")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await AffiliateCommission.countDocuments({
      affiliateId: req.params.id,
    });

    res.json({
      success: true,
      data: {
        commissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error getting affiliate commissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get commissions",
    });
  }
});

export default router;


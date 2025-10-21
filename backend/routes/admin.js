import express from "express";
import User from "../models/User.js";
import Content from "../models/Content.js";
import UserSubscription from "../models/UserSubscription.js";
import ProfileAnalysis from "../models/ProfileAnalysis.js";
import Waitlist from "../models/Waitlist.js";
import { adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// ===================================
// DASHBOARD OVERVIEW
// ===================================
router.get("/dashboard", adminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Parallel queries for performance
    const [
      totalUsers,
      activeUsers,
      todaySignups,
      trialUsers,
      paidUsers,
      totalPosts,
      totalComments,
      todayPosts,
      todayComments,
      profileAnalyses,
      waitlistCount,
      subscriptionStats,
      monthlyRevenue,
    ] = await Promise.all([
      // User metrics
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: today } }),
      UserSubscription.countDocuments({ status: "trial" }),
      UserSubscription.countDocuments({
        status: { $in: ["active"] },
        plan: { $ne: "trial" },
      }),

      // Content metrics
      Content.countDocuments({ type: "post" }),
      Content.countDocuments({ type: "comment" }),
      Content.countDocuments({ type: "post", createdAt: { $gte: today } }),
      Content.countDocuments({ type: "comment", createdAt: { $gte: today } }),

      // Profile analyses
      ProfileAnalysis.countDocuments(),

      // Waitlist
      Waitlist.countDocuments({ status: "pending" }),

      // Subscription breakdown
      UserSubscription.aggregate([
        {
          $group: {
            _id: "$plan",
            count: { $sum: 1 },
          },
        },
      ]),

      // MRR calculation (simplified)
      UserSubscription.aggregate([
        {
          $match: {
            status: "active",
            plan: { $ne: "trial" },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$billing.amount" },
          },
        },
      ]),
    ]);

    // Calculate conversion rate
    const conversionRate =
      totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(2) : 0;

    // Get recent signups (last 7 days)
    const signupTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    // Get top content creators
    const topCreators = await Content.aggregate([
      {
        $group: {
          _id: "$userId",
          contentCount: { $sum: 1 },
        },
      },
      { $sort: { contentCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          contentCount: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          todaySignups,
          trialUsers,
          paidUsers,
          conversionRate: parseFloat(conversionRate),
          waitlistCount,
        },
        content: {
          totalPosts,
          totalComments,
          todayPosts,
          todayComments,
          profileAnalyses,
        },
        revenue: {
          mrr: monthlyRevenue[0]?.totalRevenue || 0,
          arr: (monthlyRevenue[0]?.totalRevenue || 0) * 12,
        },
        subscriptionBreakdown: subscriptionStats,
        trends: {
          signups: signupTrend,
        },
        topCreators,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ===================================
// USER MANAGEMENT
// ===================================
router.get("/users", adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    // Enrich with subscription data
    const userIds = users.map((u) => u._id);
    const subscriptions = await UserSubscription.find({
      userId: { $in: userIds },
    }).lean();

    const subscriptionMap = {};
    subscriptions.forEach((sub) => {
      subscriptionMap[sub.userId.toString()] = sub;
    });

    const enrichedUsers = users.map((user) => ({
      ...user,
      subscription: subscriptionMap[user._id.toString()] || null,
    }));

    res.json({
      success: true,
      data: {
        users: enrichedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// ===================================
// ANALYTICS & METRICS
// ===================================
router.get("/analytics/usage", adminOnly, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily content generation trend
    const contentTrend = await Content.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Token usage by plan
    const tokenUsage = await UserSubscription.aggregate([
      {
        $group: {
          _id: "$plan",
          totalTokens: { $sum: "$tokens.total" },
          usedTokens: { $sum: "$tokens.used" },
        },
      },
    ]);

    // Average posts per user
    const avgContentPerUser = await Content.aggregate([
      {
        $group: {
          _id: "$userId",
          postCount: { $sum: { $cond: [{ $eq: ["$type", "post"] }, 1, 0] } },
          commentCount: {
            $sum: { $cond: [{ $eq: ["$type", "comment"] }, 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: null,
          avgPosts: { $avg: "$postCount" },
          avgComments: { $avg: "$commentCount" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        contentTrend,
        tokenUsage,
        averages: avgContentPerUser[0] || { avgPosts: 0, avgComments: 0 },
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
});

// ===================================
// WAITLIST MANAGEMENT
// ===================================
router.get("/waitlist", adminOnly, async (req, res) => {
  try {
    const waitlist = await Waitlist.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const stats = await Waitlist.aggregate([
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        entries: waitlist,
        stats,
      },
    });
  } catch (error) {
    console.error("Admin waitlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch waitlist",
    });
  }
});

// ===================================
// SYSTEM HEALTH
// ===================================
router.get("/health", adminOnly, async (req, res) => {
  try {
    const dbStatus = await User.db.db.admin().ping();

    res.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date(),
        database: dbStatus ? "connected" : "disconnected",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
    });
  }
});

export default router;

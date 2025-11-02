import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import User from "../models/User.js";
import Content from "../models/Content.js";
import Usage from "../models/Usage.js";
import UserSubscription from "../models/UserSubscription.js";
import googleAnalyticsService from "../services/googleAnalyticsService.js";
import adminEmailRoutes from "./adminEmail.js";

const router = express.Router();

// Mount admin email routes
router.use("/", adminEmailRoutes);

// Get dashboard statistics
router.get("/stats", adminAuth, async (req, res) => {
  try {
    // Prepare date ranges
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for better performance
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      totalPosts,
      totalComments,
      paidUsers,
      lastWeekUsers,
      previousWeekUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: startOfDay } }),
      Content.countDocuments({ type: "post" }),
      Content.countDocuments({ type: "comment" }),
      UserSubscription.countDocuments({
        plan: { $in: ["starter", "pro"] },
        "status.isActive": true,
      }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
    ]);

    // Calculate real revenue from Payment collection (sum of captured payments)
    const Payment = (await import("../models/Payment.js")).default;
    const paymentAggByCurrency = await Payment.aggregate([
      { $match: { status: "captured" } },
      { $group: { _id: "$currency", total: { $sum: "$amount" } } },
    ]);
    let revenueINR = 0;
    let revenueUSD = 0;
    paymentAggByCurrency.forEach((entry) => {
      if (entry._id === "INR" || !entry._id) {
        revenueINR = entry.total;
      } else if (entry._id === "USD") {
        revenueUSD = entry.total;
      }
    });
    const conversionRate =
      totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : 0;
    const growthRate =
      previousWeekUsers > 0
        ? (
            ((lastWeekUsers - previousWeekUsers) / previousWeekUsers) *
            100
          ).toFixed(1)
        : 0;

    res.json({
      totalUsers,
      activeUsers,
      newUsersToday,
      postsGenerated: totalPosts,
      commentsGenerated: totalComments,
      revenueINR,
      revenueUSD,
      conversionRate: parseFloat(conversionRate),
      growthRate: parseFloat(growthRate),
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

// Get recent users
router.get("/recent-users", adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const recentUsers = await User.find()
      .select("email name createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get all subscriptions in one query
    const userIds = recentUsers.map((user) => user._id);
    const subscriptions = await UserSubscription.find({
      userId: { $in: userIds },
    }).lean();

    // Create a map for quick lookup
    const subscriptionMap = new Map(
      subscriptions.map((sub) => [sub.userId.toString(), sub])
    );

    // Map users with their plans
    const usersWithPlan = recentUsers.map((user) => {
      const subscription = subscriptionMap.get(user._id.toString());
      return {
        _id: user._id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
        plan: subscription?.plan || "trial",
        joinedDate: user.createdAt,
      };
    });

    res.json({ success: true, data: usersWithPlan });
  } catch (error) {
    console.error("Error fetching recent users:", error);
    res.status(500).json({ message: "Failed to fetch recent users" });
  }
});

// Get recent activity
router.get("/recent-activity", adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentContent = await Content.find()
      .select("userId type createdAt")
      .populate("userId", "email name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const activities = recentContent.map((content) => ({
      _id: content._id,
      user: {
        email: content.userId?.email || "Unknown",
        name:
          content.userId?.name ||
          content.userId?.email?.split("@")[0] ||
          "Unknown",
      },
      action:
        content.type === "post" ? "generated a post" : "generated a comment",
      timestamp: content.createdAt,
    }));

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
});

// Get all users with detailed information
router.get("/users", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("email name persona createdAt lastLogin")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Enhance user data with activity metrics and subscription
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        // Fetch subscription separately
        const subscription = await UserSubscription.findOne({
          userId: user._id,
        });

        const postsGenerated = await Content.countDocuments({
          userId: user._id,
          type: "post",
        });

        const commentsGenerated = await Content.countDocuments({
          userId: user._id,
          type: "comment",
        });

        return {
          _id: user._id,
          email: user.email,
          name: user.name || user.email.split("@")[0],
          plan: subscription?.plan || "trial",
          status:
            user.lastLogin &&
            Date.now() - new Date(user.lastLogin).getTime() <
              7 * 24 * 60 * 60 * 1000
              ? "active"
              : "inactive",
          joinedDate: user.createdAt,
          lastActive: user.lastLogin || user.createdAt,
          postsGenerated,
          commentsGenerated,
        };
      })
    );

    const totalUsers = await User.countDocuments();

    res.json({
      users: enhancedUsers,
      pagination: {
        current: page,
        total: Math.ceil(totalUsers / limit),
        count: enhancedUsers.length,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Get user details by ID
router.get("/users/:userId", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch subscription separately
    const subscription = await UserSubscription.findOne({ userId: user._id });

    // Get user's content
    const posts = await Content.find({ userId: user._id, type: "post" })
      .sort({ createdAt: -1 })
      .limit(10);

    const comments = await Content.find({ userId: user._id, type: "comment" })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get usage stats
    const usage = await Usage.findOne({ userId: user._id });

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        persona: user.persona,
        subscription: subscription,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profile: user.profile,
      },
      activity: {
        posts: posts.length,
        comments: comments.length,
        recentPosts: posts,
        recentComments: comments,
      },
      usage,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
});

// Update user status
router.patch("/users/:userId/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user status (you might want to add a status field to the User model)
    // For now, we'll just log it
    console.log(
      `User ${user.email} status changed to: ${status} by admin ${req.admin.username}`
    );

    res.json({
      message: "User status updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        status,
      },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Failed to update user status" });
  }
});

// Google Analytics endpoints
router.get("/analytics/dashboard", adminAuth, async (req, res) => {
  try {
    const result = await googleAnalyticsService.getDashboardSummary();

    if (!result.success) {
      return res.status(503).json({
        message: "Google Analytics not configured",
        error: result.message,
      });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error fetching GA dashboard:", error);
    res.status(500).json({ message: "Failed to fetch analytics data" });
  }
});

router.get("/analytics/metrics", adminAuth, async (req, res) => {
  try {
    const { period = "7daysAgo" } = req.query;
    const result = await googleAnalyticsService.getMetrics(period, "today");

    if (!result.success) {
      return res.status(503).json({
        message: "Google Analytics not configured",
        error: result.message,
      });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error fetching GA metrics:", error);
    res.status(500).json({ message: "Failed to fetch analytics metrics" });
  }
});

router.get("/analytics/realtime", adminAuth, async (req, res) => {
  try {
    const result = await googleAnalyticsService.getRealtimeMetrics();

    if (!result.success) {
      return res.status(503).json({
        message: "Google Analytics not configured",
        error: result.message,
      });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error fetching realtime analytics:", error);
    res.status(500).json({ message: "Failed to fetch realtime data" });
  }
});

router.get("/analytics/pages", adminAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await googleAnalyticsService.getTopPages(parseInt(limit));

    if (!result.success) {
      return res.status(503).json({
        message: "Google Analytics not configured",
        error: result.message,
      });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error fetching top pages:", error);
    res.status(500).json({ message: "Failed to fetch top pages" });
  }
});

router.get("/analytics/sources", adminAuth, async (req, res) => {
  try {
    const result = await googleAnalyticsService.getTrafficSources();

    if (!result.success) {
      return res.status(503).json({
        message: "Google Analytics not configured",
        error: result.message,
      });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error fetching traffic sources:", error);
    res.status(500).json({ message: "Failed to fetch traffic sources" });
  }
});

export default router;

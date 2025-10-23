import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import User from "../models/User.js";
import Content from "../models/Content.js";
import Usage from "../models/Usage.js";
import UserSubscription from "../models/UserSubscription.js";

const router = express.Router();

// Get dashboard statistics
router.get("/stats", adminAuth, async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo },
    });

    // Get new users today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: startOfDay },
    });

    // Get content statistics
    const totalPosts = await Content.countDocuments({ type: "post" });
    const totalComments = await Content.countDocuments({ type: "comment" });

    // Get revenue statistics (placeholder)
    const paidUsers = await UserSubscription.countDocuments({
      plan: { $in: ["starter", "pro"] },
      "status.isActive": true,
    });

    const totalRevenue = paidUsers * 15; // Approximate average

    // Calculate conversion rate
    const conversionRate =
      totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : 0;

    // Calculate growth rate (placeholder - last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const lastWeekUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const previousWeekUsers = await User.countDocuments({
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
    });

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
      totalPosts,
      totalComments,
      totalRevenue,
      conversionRate: parseFloat(conversionRate),
      growthRate: parseFloat(growthRate),
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
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
      .populate("subscription")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Enhance user data with activity metrics
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
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
          plan: user.subscription?.plan || "trial",
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
    const user = await User.findById(req.params.userId).populate(
      "subscription"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
        subscription: user.subscription,
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

export default router;

import Usage from "../models/Usage.js";
import User from "../models/User.js";
import razorpayService from "./razorpay.js";

class UsageService {
  // Get current month usage for a user
  async getCurrentUsage(userId) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      let usage = await Usage.findOne({ userId, month: currentMonth });

      if (!usage) {
        usage = new Usage({
          userId,
          month: currentMonth,
          postsGenerated: 0,
          commentsGenerated: 0,
          ideasGenerated: 0,
          totalTokensUsed: 0,
        });
        await usage.save();
      }

      return usage;
    } catch (error) {
      console.error("Error getting current usage:", error);
      throw new Error("Failed to get usage data");
    }
  }

  // Increment usage counter
  async incrementUsage(userId, type, tokensUsed = 0) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      const usage = await Usage.findOneAndUpdate(
        { userId, month: currentMonth },
        {
          $inc: {
            [`${type}Generated`]: 1,
            totalTokensUsed: tokensUsed,
          },
        },
        { upsert: true, new: true }
      );

      return usage;
    } catch (error) {
      console.error("Error incrementing usage:", error);
      throw new Error("Failed to update usage");
    }
  }

  // Check if user has exceeded quota
  async checkQuotaExceeded(userId, type) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const usage = await this.getCurrentUsage(userId);
      const limits = razorpayService.getUsageLimits(user.plan);

      let currentUsage, limit;
      
      if (type === "posts") {
        currentUsage = usage.postsGenerated;
        limit = limits.postsPerMonth;
      } else if (type === "comments") {
        currentUsage = usage.commentsGenerated;
        limit = limits.commentsPerMonth;
      } else if (type === "ideas") {
        currentUsage = usage.ideasGenerated || 0;
        limit = limits.ideasPerMonth || 0;
        // -1 means unlimited
        if (limit === -1) {
          return {
            exceeded: false,
            currentUsage,
            limit: -1,
            remaining: -1, // -1 means unlimited
          };
        }
      } else {
        currentUsage = 0;
        limit = 0;
      }

      return {
        exceeded: currentUsage >= limit,
        currentUsage,
        limit,
        remaining: Math.max(0, limit - currentUsage),
      };
    } catch (error) {
      console.error("Error checking quota:", error);
      throw new Error("Failed to check quota");
    }
  }

  // Get usage history for a user
  async getUsageHistory(userId, months = 12) {
    try {
      const usageHistory = await Usage.find({ userId })
        .sort({ month: -1 })
        .limit(months);

      return usageHistory;
    } catch (error) {
      console.error("Error getting usage history:", error);
      throw new Error("Failed to get usage history");
    }
  }

  // Get usage statistics for dashboard
  async getUsageStats(userId) {
    try {
      const currentUsage = await this.getCurrentUsage(userId);
      const user = await User.findById(userId);
      const limits = razorpayService.getUsageLimits(user.plan);

      // Calculate growth from previous month
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousMonthStr = previousMonth.toISOString().slice(0, 7);

      const previousUsage = await Usage.findOne({
        userId,
        month: previousMonthStr,
      });

      const postsGrowth = previousUsage
        ? ((currentUsage.postsGenerated - previousUsage.postsGenerated) /
            Math.max(previousUsage.postsGenerated, 1)) *
          100
        : 0;

      const commentsGrowth = previousUsage
        ? ((currentUsage.commentsGenerated - previousUsage.commentsGenerated) /
            Math.max(previousUsage.commentsGenerated, 1)) *
          100
        : 0;

      const ideasGrowth = previousUsage
        ? ((currentUsage.ideasGenerated || 0) - (previousUsage.ideasGenerated || 0)) /
          Math.max(previousUsage.ideasGenerated || 1, 1) * 100
        : 0;

      return {
        current: {
          postsGenerated: currentUsage.postsGenerated,
          commentsGenerated: currentUsage.commentsGenerated,
          ideasGenerated: currentUsage.ideasGenerated || 0,
          totalTokensUsed: currentUsage.totalTokensUsed,
        },
        limits: {
          postsPerMonth: limits.postsPerMonth,
          commentsPerMonth: limits.commentsPerMonth,
          ideasPerMonth: limits.ideasPerMonth || 0,
        },
        remaining: {
          posts: Math.max(
            0,
            limits.postsPerMonth - currentUsage.postsGenerated
          ),
          comments: Math.max(
            0,
            limits.commentsPerMonth - currentUsage.commentsGenerated
          ),
          ideas: limits.ideasPerMonth === -1
            ? -1
            : Math.max(0, (limits.ideasPerMonth || 0) - (currentUsage.ideasGenerated || 0)),
        },
        growth: {
          posts: Math.round(postsGrowth),
          comments: Math.round(commentsGrowth),
          ideas: Math.round(ideasGrowth),
        },
      };
    } catch (error) {
      console.error("Error getting usage stats:", error);
      throw new Error("Failed to get usage statistics");
    }
  }

  // Reset usage for new month (called by cron job)
  async resetMonthlyUsage() {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      // This would typically be handled by a cron job
      // For now, we'll just ensure usage records exist for the current month
      const users = await User.find({ isActive: true });

      for (const user of users) {
        await this.getCurrentUsage(user._id);
      }

      console.log(`Usage reset completed for ${currentMonth}`);
    } catch (error) {
      console.error("Error resetting monthly usage:", error);
      throw new Error("Failed to reset monthly usage");
    }
  }
}

export default new UsageService();

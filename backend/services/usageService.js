import Usage from '../models/Usage.js';
import User from '../models/User.js';
import razorpayService from './razorpay.js';

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
          totalTokensUsed: 0
        });
        await usage.save();
      }
      
      return usage;
    } catch (error) {
      console.error('Error getting current usage:', error);
      throw new Error('Failed to get usage data');
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
            totalTokensUsed: tokensUsed
          }
        },
        { upsert: true, new: true }
      );
      
      return usage;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw new Error('Failed to update usage');
    }
  }

  // Check if user has exceeded quota
  async checkQuotaExceeded(userId, type) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      
      const usage = await this.getCurrentUsage(userId);
      const limits = razorpayService.getUsageLimits(user.plan);
      
      const currentUsage = type === 'posts' ? usage.postsGenerated : usage.commentsGenerated;
      const limit = type === 'posts' ? limits.postsPerMonth : limits.commentsPerMonth;
      
      return {
        exceeded: currentUsage >= limit,
        currentUsage,
        limit,
        remaining: Math.max(0, limit - currentUsage)
      };
    } catch (error) {
      console.error('Error checking quota:', error);
      throw new Error('Failed to check quota');
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
      console.error('Error getting usage history:', error);
      throw new Error('Failed to get usage history');
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
        month: previousMonthStr 
      });
      
      const postsGrowth = previousUsage 
        ? ((currentUsage.postsGenerated - previousUsage.postsGenerated) / Math.max(previousUsage.postsGenerated, 1)) * 100
        : 0;
        
      const commentsGrowth = previousUsage 
        ? ((currentUsage.commentsGenerated - previousUsage.commentsGenerated) / Math.max(previousUsage.commentsGenerated, 1)) * 100
        : 0;
      
      return {
        current: {
          postsGenerated: currentUsage.postsGenerated,
          commentsGenerated: currentUsage.commentsGenerated,
          totalTokensUsed: currentUsage.totalTokensUsed
        },
        limits: {
          postsPerMonth: limits.postsPerMonth,
          commentsPerMonth: limits.commentsPerMonth
        },
        remaining: {
          posts: Math.max(0, limits.postsPerMonth - currentUsage.postsGenerated),
          comments: Math.max(0, limits.commentsPerMonth - currentUsage.commentsGenerated)
        },
        growth: {
          posts: Math.round(postsGrowth),
          comments: Math.round(commentsGrowth)
        }
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw new Error('Failed to get usage statistics');
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
      console.error('Error resetting monthly usage:', error);
      throw new Error('Failed to reset monthly usage');
    }
  }
}

export default new UsageService();

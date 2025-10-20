import UserSubscription from "../models/UserSubscription.js";
import User from "../models/User.js";

class SubscriptionService {
  /**
   * Create a trial subscription for a new user
   */
  async createTrialSubscription(userId) {
    try {
      console.log("🎯 Creating trial subscription for user:", userId);

      // Check if user already has a subscription
      const existingSubscription = await UserSubscription.findOne({ userId });
      if (existingSubscription) {
        console.log(
          "⚠️ User already has a subscription:",
          existingSubscription.plan
        );
        return existingSubscription;
      }

      // Create trial subscription
      const trialSubscription = await UserSubscription.createTrial(userId);

      console.log("✅ Trial subscription created:", {
        userId,
        plan: trialSubscription.plan,
        trialEndDate: trialSubscription.trialEndDate,
        tokens: trialSubscription.tokens,
      });

      return trialSubscription;
    } catch (error) {
      console.error("❌ Error creating trial subscription:", error);
      throw error;
    }
  }

  /**
   * Get user's subscription details
   */
  async getUserSubscription(userId) {
    try {
      let subscription = await UserSubscription.findOne({ userId });

      if (!subscription) {
        // Create trial subscription if none exists
        subscription = await this.createTrialSubscription(userId);
      }

      // Reset monthly usage if needed
      await subscription.resetMonthlyUsage();

      return subscription;
    } catch (error) {
      console.error("❌ Error getting user subscription:", error);
      throw error;
    }
  }

  /**
   * Check if user can perform an action
   */
  async canPerformAction(userId, action) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const result = subscription.canPerformAction(action);

      console.log(`🔍 Action check for user ${userId}:`, {
        action,
        allowed: result.allowed,
        reason: result.reason,
        plan: subscription.plan,
        status: subscription.status,
        usage: subscription.usage,
      });

      return result;
    } catch (error) {
      console.error("❌ Error checking action permission:", error);
      return { allowed: false, reason: "Error checking permissions" };
    }
  }

  /**
   * Record usage of a feature
   */
  async recordUsage(userId, action) {
    try {
      const subscription = await this.getUserSubscription(userId);

      // Check if action is allowed
      const canPerform = subscription.canPerformAction(action);
      if (!canPerform.allowed) {
        throw new Error(canPerform.reason);
      }

      // Record the usage
      await subscription.recordUsage(action);

      console.log(`📊 Usage recorded for user ${userId}:`, {
        action,
        newUsage: subscription.usage,
        tokensRemaining: subscription.tokens.remaining,
      });

      return subscription;
    } catch (error) {
      console.error("❌ Error recording usage:", error);
      throw error;
    }
  }

  /**
   * Get usage statistics for user
   */
  async getUsageStats(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);

      const stats = {
        plan: subscription.plan,
        status: subscription.status,
        tokens: subscription.tokens,
        limits: subscription.limits,
        usage: subscription.usage,
        trialInfo: {
          isTrial: subscription.status === "trial",
          trialStartDate: subscription.trialStartDate,
          trialEndDate: subscription.trialEndDate,
          daysRemaining:
            subscription.status === "trial"
              ? Math.max(
                  0,
                  Math.ceil(
                    (subscription.trialEndDate - new Date()) /
                      (1000 * 60 * 60 * 24)
                  )
                )
              : 0,
        },
        subscriptionInfo: {
          isActive: subscription.status === "active",
          subscriptionStartDate: subscription.subscriptionStartDate,
          subscriptionEndDate: subscription.subscriptionEndDate,
          nextBillingDate: subscription.nextBillingDate,
        },
      };

      console.log(`📈 Usage stats for user ${userId}:`, stats);

      return stats;
    } catch (error) {
      console.error("❌ Error getting usage stats:", error);
      throw error;
    }
  }

  /**
   * Upgrade user's plan
   */
  async upgradePlan(userId, newPlan, billingInterval = "monthly") {
    try {
      const subscription = await this.getUserSubscription(userId);

      // Update billing interval
      subscription.billing.interval = billingInterval;

      // Upgrade the plan
      await subscription.upgradePlan(newPlan);

      console.log(`⬆️ Plan upgraded for user ${userId}:`, {
        oldPlan: subscription.plan,
        newPlan,
        billingInterval,
        newLimits: subscription.limits,
      });

      return subscription;
    } catch (error) {
      console.error("❌ Error upgrading plan:", error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);

      subscription.status = "cancelled";
      subscription.updatedAt = new Date();

      await subscription.save();

      console.log(`❌ Subscription cancelled for user ${userId}`);

      return subscription;
    } catch (error) {
      console.error("❌ Error cancelling subscription:", error);
      throw error;
    }
  }

  /**
   * Check and handle expired trials
   */
  async handleExpiredTrials() {
    try {
      const now = new Date();

      // Find expired trials
      const expiredTrials = await UserSubscription.find({
        status: "trial",
        trialEndDate: { $lt: now },
      });

      console.log(`🕐 Found ${expiredTrials.length} expired trials`);

      for (const subscription of expiredTrials) {
        subscription.status = "expired";
        subscription.updatedAt = new Date();
        await subscription.save();

        console.log(`⏰ Trial expired for user ${subscription.userId}`);
      }

      return expiredTrials.length;
    } catch (error) {
      console.error("❌ Error handling expired trials:", error);
      throw error;
    }
  }

  /**
   * Get subscription analytics
   */
  async getAnalytics() {
    try {
      const stats = await UserSubscription.aggregate([
        {
          $group: {
            _id: "$plan",
            count: { $sum: 1 },
            totalTokensUsed: { $sum: "$tokens.used" },
            avgUsage: { $avg: "$usage.postsGenerated" },
          },
        },
      ]);

      const totalUsers = await UserSubscription.countDocuments();
      const activeTrials = await UserSubscription.countDocuments({
        status: "trial",
      });
      const activeSubscriptions = await UserSubscription.countDocuments({
        status: "active",
      });

      return {
        totalUsers,
        activeTrials,
        activeSubscriptions,
        planBreakdown: stats,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("❌ Error getting analytics:", error);
      throw error;
    }
  }
}

export default new SubscriptionService();

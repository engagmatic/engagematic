/**
 * Analysis Limit Checking Middleware
 * Handles rate limiting for profile analysis based on user plan
 */

import UserSubscription from "../models/UserSubscription.js";
import ProfileAnalysisUsage from "../models/ProfileAnalysisUsage.js";
import { checkAnonymousRateLimit, recordAnonymousUsage } from "./rateLimit.js";

/**
 * Check if user can perform analysis
 * @param {string|null} userId - User ID (null for anonymous)
 * @param {string} clientIp - Client IP address
 * @returns {Promise<{allowed: boolean, remaining: number, limit: number, plan: string, message?: string, redirectTo?: string}>}
 */
export async function checkAnalysisLimit(userId, clientIp) {
  // Anonymous users: 1 free analysis
  if (!userId) {
    const rateLimitKey = `profile_analyzer_anonymous_${clientIp}`;
    const limitCheck = await checkAnonymousRateLimit(rateLimitKey, 1, 24 * 60 * 60 * 1000);
    
    if (!limitCheck.allowed) {
      return {
        allowed: false,
        remaining: 0,
        limit: 1,
        plan: "free",
        message: "You've used your free analysis. Sign up to get 1 more free analysis!",
        redirectTo: "/signup",
      };
    }
    
    return {
      allowed: true,
      remaining: limitCheck.remaining,
      limit: 1,
      plan: "free",
    };
  }

  // Authenticated users: Check subscription plan
  try {
    let subscription = await UserSubscription.findOne({ userId });
    
    // If no subscription, create trial subscription
    if (!subscription) {
      subscription = new UserSubscription({
        userId,
        plan: "trial",
        status: "trial",
        limits: {
          profileAnalyses: 1, // 1 free analysis for new users
        },
      });
      await subscription.save();
    }

    const plan = subscription.plan || "trial";
    const limit = subscription.limits?.profileAnalyses || 1;
    
    // Get current month usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const usageCount = await ProfileAnalysisUsage.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth },
    });

    const remaining = Math.max(0, limit - usageCount);
    const allowed = remaining > 0;

    if (!allowed) {
      let message = "You've reached your analysis limit for this month.";
      let redirectTo = "/pricing";
      
      if (plan === "trial") {
        message = "You've used your free analysis. Upgrade to a plan for more analyses!";
        redirectTo = "/pricing?plan=starter";
      } else if (plan === "starter") {
        message = "You've used all 5 analyses this month. Upgrade to Pro for 10 analyses/month!";
        redirectTo = "/pricing?plan=pro";
      } else if (plan === "pro") {
        message = "You've used all 10 analyses this month. Your limit will reset next month.";
        redirectTo = "/pricing?plan=elite";
      }

      return {
        allowed: false,
        remaining: 0,
        limit,
        plan,
        message,
        redirectTo,
      };
    }

    return {
      allowed: true,
      remaining,
      limit,
      plan,
    };
  } catch (error) {
    console.error("Error checking analysis limit:", error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: 1,
      limit: 1,
      plan: "error",
    };
  }
}

/**
 * Record analysis usage
 * @param {string|null} userId - User ID (null for anonymous)
 * @param {string} clientIp - Client IP address
 * @param {string} profileUrl - LinkedIn profile URL analyzed
 * @param {Object} analysisData - Analysis result data
 * @param {number} tokensUsed - Tokens used for analysis
 */
export async function recordAnalysisUsage(userId, clientIp, profileUrl, analysisData, tokensUsed = 0) {
  try {
    // Record anonymous usage
    if (!userId) {
      const rateLimitKey = `profile_analyzer_anonymous_${clientIp}`;
      await recordAnonymousUsage(rateLimitKey);
      return;
    }

    // Record authenticated user usage
    const usage = new ProfileAnalysisUsage({
      userId,
      profileUrl,
      analysisData,
      tokensUsed,
    });
    await usage.save();

    // Update subscription usage counter
    await UserSubscription.findOneAndUpdate(
      { userId },
      { $inc: { "usage.profileAnalyses": 1 } },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error recording analysis usage:", error);
    // Don't throw - usage recording failure shouldn't break the request
  }
}


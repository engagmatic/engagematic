import ProfileAnalysisUsage from "../models/ProfileAnalysisUsage.js";
import User from "../models/User.js";

/**
 * Get analysis limits based on user plan
 */
export function getAnalysisLimits(plan, subscriptionStatus) {
  // Free trial users get 1 analysis (after signup)
  if (subscriptionStatus === "trial" || !plan || plan === "free") {
    return {
      limit: 1,
      plan: "trial",
    };
  }

  // Starter plan: 5 per month
  if (plan === "starter") {
    return {
      limit: 5,
      plan: "starter",
    };
  }

  // Pro plan: 10 per month
  if (plan === "pro") {
    return {
      limit: 10,
      plan: "pro",
    };
  }

  // Elite plan: unlimited (or high limit)
  if (plan === "elite") {
    return {
      limit: 999999, // Effectively unlimited
      plan: "elite",
    };
  }

  // Default: 1 analysis (trial)
  return {
    limit: 1,
    plan: "trial",
  };
}

/**
 * Check if user can perform analysis
 * @param {string|null} userId - User ID (null for anonymous)
 * @param {string|null} clientIp - IP address (for anonymous users)
 * @returns {Promise<{allowed: boolean, remaining: number, limit: number, plan: string, message?: string, redirectTo?: string, requiresAuth?: boolean}>}
 */
export async function checkAnalysisLimit(userId, clientIp) {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // For anonymous users (no userId, only IP): 1 free analysis
  if (!userId) {
    // Check anonymous usage (1 free analysis total, not per month)
    const anonymousUsage = await ProfileAnalysisUsage.countDocuments({
      ipAddress: clientIp,
      userId: null,
    });

    if (anonymousUsage >= 1) {
      return {
        allowed: false,
        remaining: 0,
        limit: 1,
        plan: "anonymous",
        message: "You've used your free analysis. Sign up to get 1 more free analysis!",
        redirectTo: "/signup",
        requiresAuth: true,
      };
    }

    return {
      allowed: true,
      remaining: 1 - anonymousUsage,
      limit: 1,
      plan: "anonymous",
    };
  }

  // For authenticated users
  const user = await User.findById(userId);
  if (!user) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      plan: "none",
      message: "User not found",
    };
  }

  // Get limits based on plan
  const limits = getAnalysisLimits(user.plan, user.subscriptionStatus);

  // Count total usage (for trial: total usage, for paid plans: monthly usage)
  let usageCount;
  if (limits.plan === "trial") {
    // Trial users get 1 free analysis total (not per month) - this is the free analysis after signup
    usageCount = await ProfileAnalysisUsage.countDocuments({
      userId,
    });
  } else {
    // Paid plans: monthly usage
    usageCount = await ProfileAnalysisUsage.countDocuments({
      userId,
      month,
      year,
    });
  }

  if (usageCount >= limits.limit) {
    let message;
    let redirectTo = "/pricing";
    
    if (limits.plan === "trial") {
      message = "You've used your free analysis. Upgrade to Starter plan (5/month) or Pro plan (10/month) to get more!";
      redirectTo = "/pricing?plan=starter";
    } else if (limits.plan === "starter") {
      message = "You've used all 5 analyses this month. Upgrade to Pro plan for 10 analyses/month!";
      redirectTo = "/pricing?plan=pro";
    } else if (limits.plan === "pro") {
      message = "You've used all 10 analyses this month. Your limit will reset next month, or upgrade to Elite for unlimited!";
      redirectTo = "/pricing?plan=elite";
    } else {
      message = `You've reached your ${limits.plan} plan limit of ${limits.limit} analyses per month.`;
    }
    
    return {
      allowed: false,
      remaining: 0,
      limit: limits.limit,
      plan: limits.plan,
      message,
      redirectTo,
      requiresAuth: false,
    };
  }

  return {
    allowed: true,
    remaining: limits.limit - usageCount,
    limit: limits.limit,
    plan: limits.plan,
  };
}

/**
 * Record analysis usage
 * @param {string|null} userId - User ID
 * @param {string|null} clientIp - IP address
 * @param {string} profileUrl - Profile URL analyzed
 * @param {Object} analysisData - Analysis result data
 * @param {number} tokensUsed - Tokens used
 */
export async function recordAnalysisUsage(userId, clientIp, profileUrl, analysisData = null, tokensUsed = 0) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  await ProfileAnalysisUsage.create({
    userId: userId || null,
    ipAddress: clientIp || null,
    profileUrl,
    analysisData,
    tokensUsed,
    month,
    year,
  });
}


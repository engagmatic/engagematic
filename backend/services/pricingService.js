import UserSubscription from "../models/UserSubscription.js";
import User from "../models/User.js";

class PricingService {
  constructor() {
    this.pricingConfigs = {
      INR: {
        currency: "INR",
        postPrice: 5.5,
        commentPrice: 2.8,
        ideaPrice: 2.8,
        starterPrice: 249,
        proPrice: 649,
        elitePrice: 1299, // Value-driven pricing
      },
      USD: {
        currency: "USD",
        postPrice: 0.22,
        commentPrice: 0.11,
        ideaPrice: 0.11,
        starterPrice: 10,
        proPrice: 19,
        elitePrice: 49,
      },
    };

    this.presets = {
      starter: { posts: 15, comments: 30, ideas: 30 },
      pro: { posts: 60, comments: 80, ideas: 80 },
      elite: { posts: 200, comments: 300, ideas: 200 },
      80: { posts: 80, comments: 80, ideas: 80 },
      100: { posts: 100, comments: 100, ideas: 100 },
      custom: { posts: 10, comments: 10, ideas: 10 },
    };
  }

  // Calculate price for custom credit selection
  calculatePrice(credits, currency = "USD") {
    const config = this.pricingConfigs[currency];
    if (!config) {
      throw new Error("Invalid currency");
    }

    const totalPrice =
      credits.posts * config.postPrice +
      credits.comments * config.commentPrice +
      credits.ideas * config.ideaPrice;

    return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
  }

  // Check if selection matches preset plans
  isStarterPlan(credits) {
    return (
      credits.posts === this.presets.starter.posts &&
      credits.comments === this.presets.starter.comments &&
      credits.ideas === this.presets.starter.ideas
    );
  }

  isProPlan(credits) {
    return (
      credits.posts === this.presets.pro.posts &&
      credits.comments === this.presets.pro.comments &&
      credits.ideas === this.presets.pro.ideas
    );
  }

  isElitePlan(credits) {
    return (
      credits.posts === this.presets.elite.posts &&
      credits.comments === this.presets.elite.comments &&
      credits.ideas === this.presets.elite.ideas
    );
  }

  // Get display price (preset price or calculated price)
  getDisplayPrice(credits, currency = "USD") {
    const config = this.pricingConfigs[currency];

    if (this.isStarterPlan(credits)) return config.starterPrice;
    if (this.isProPlan(credits)) return config.proPrice;
    if (this.isElitePlan(credits)) return config.elitePrice;
    return this.calculatePrice(credits, currency);
  }

  // Get plan name
  getPlanName(credits) {
    if (this.isStarterPlan(credits)) return "Starter Plan";
    if (this.isProPlan(credits)) return "Pro Plan";
    if (this.isElitePlan(credits)) return "Elite Plan";
    return "Custom Plan";
  }

  // Get pricing breakdown
  getPricingBreakdown(credits, currency = "USD") {
    const config = this.pricingConfigs[currency];

    return {
      posts: {
        quantity: credits.posts,
        unitPrice: config.postPrice,
        total: credits.posts * config.postPrice,
      },
      comments: {
        quantity: credits.comments,
        unitPrice: config.commentPrice,
        total: credits.comments * config.commentPrice,
      },
      ideas: {
        quantity: credits.ideas,
        unitPrice: config.ideaPrice,
        total: credits.ideas * config.ideaPrice,
      },
      total: this.calculatePrice(credits, currency),
      currency: currency,
      isPreset: this.isStarterPlan(credits) || this.isProPlan(credits) || this.isElitePlan(credits),
    };
  }

  // Detect user's region based on IP or other factors
  async detectUserRegion(req) {
    try {
      // Try to get country from IP geolocation
      const ip = req.ip || req.connection.remoteAddress;

      // Get real IP from various headers
      const forwarded = req.headers["x-forwarded-for"];
      const realIp = req.headers["x-real-ip"];
      const cfConnectingIp = req.headers["cf-connecting-ip"]; // Cloudflare

      const clientIp =
        cfConnectingIp ||
        realIp ||
        (forwarded ? forwarded.split(",")[0].trim() : ip);

      // Use ipapi.co for geolocation (free tier allows 1000 requests/day)
      if (clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1") {
        try {
          const response = await fetch(`https://ipapi.co/${clientIp}/json/`);
          const data = await response.json();

          if (data.country_code === "IN") {
            return "INR";
          }
        } catch (error) {
          console.log("IP geolocation failed, trying alternative method");
        }
      }

      // Fallback: Check Accept-Language header
      const acceptLanguage = req.headers["accept-language"];
      if (acceptLanguage && acceptLanguage.includes("hi")) {
        return "INR"; // Hindi language suggests Indian user
      }

      // Default to USD
      return "USD";
    } catch (error) {
      console.error("Region detection error:", error);
      return "USD"; // Default fallback
    }
  }

  // Create credit-based subscription
  async createCreditSubscription(
    userId,
    credits,
    currency = "USD",
    billingInterval = "monthly"
  ) {
    try {
      const config = this.pricingConfigs[currency];
      const price = this.getDisplayPrice(credits, currency);
      const planName = this.getPlanName(credits);

      // Determine plan type based on credits
      const planType = this.isStarterPlan(credits)
        ? "starter"
        : this.isProPlan(credits)
        ? "pro"
        : this.isElitePlan(credits)
        ? "elite"
        : "custom";

      // Create or update user subscription
      let subscription = await UserSubscription.findOne({ userId });

      if (!subscription) {
        subscription = new UserSubscription({
          userId,
          plan: planType,
          status: "active", // Change from trial to active after payment
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          limits: {
            postsPerMonth: credits.posts,
            commentsPerMonth: credits.comments,
            ideasPerMonth: credits.ideas,
            templatesAccess: true,
            linkedinAnalysis: true,
            profileAnalyses: -1, // Unlimited
            prioritySupport: planType === "pro",
          },
          billing: {
            amount: price,
            currency: currency,
            interval: billingInterval,
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          tokens: {
            total: credits.posts * 5 + credits.comments * 3 + credits.ideas * 4,
            used: 0,
            remaining:
              credits.posts * 5 + credits.comments * 3 + credits.ideas * 4,
          },
        });
      } else {
        // Update existing subscription - upgrade from trial to paid
        subscription.plan = planType;
        subscription.status = "active"; // Activate subscription
        subscription.subscriptionStartDate = new Date();
        subscription.subscriptionEndDate = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );

        // Update limits
        subscription.limits.postsPerMonth = credits.posts;
        subscription.limits.commentsPerMonth = credits.comments;
        subscription.limits.ideasPerMonth = credits.ideas;
        subscription.limits.prioritySupport = planType === "pro";

        // Update billing
        subscription.billing.amount = price;
        subscription.billing.currency = currency;
        subscription.billing.interval = billingInterval;
        subscription.billing.nextBillingDate = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );

        // Reset and update tokens
        const newTokenTotal =
          credits.posts * 5 + credits.comments * 3 + credits.ideas * 4;
        subscription.tokens.total = newTokenTotal;
        subscription.tokens.used = 0; // Reset usage on new subscription
        subscription.tokens.remaining = newTokenTotal;
      }

      await subscription.save();

      // Also update top-level User document so frontend and other services reflect the change immediately
      try {
        await User.findByIdAndUpdate(userId, {
          plan: planType,
          subscriptionStatus: "active",
          subscriptionId: subscription._id?.toString(),
          subscriptionEndsAt: subscription.subscriptionEndDate || null,
        });
      } catch (err) {
        console.warn(
          "Failed to update User document after creating credit subscription:",
          err.message
        );
      }

      return {
        subscription,
        pricing: this.getPricingBreakdown(credits, currency),
        planName,
        price,
        currency,
      };
    } catch (error) {
      console.error("Credit subscription creation error:", error);
      throw new Error("Failed to create credit subscription");
    }
  }

  // Update subscription credits
  async updateSubscriptionCredits(userId, newCredits, currency = "USD") {
    try {
      const subscription = await UserSubscription.findOne({ userId });

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const newPrice = this.getDisplayPrice(newCredits, currency);
      const planName = this.getPlanName(newCredits);

      // Update limits and pricing
      subscription.limits.postsPerMonth = newCredits.posts;
      subscription.limits.commentsPerMonth = newCredits.comments;
      subscription.limits.ideasPerMonth = newCredits.ideas;
      subscription.billing.amount = newPrice;
      subscription.billing.currency = currency;

      // Update tokens
      const newTokenTotal =
        newCredits.posts * 5 + newCredits.comments * 3 + newCredits.ideas * 4;
      subscription.tokens.total = newTokenTotal;
      subscription.tokens.remaining = newTokenTotal - subscription.tokens.used;

      await subscription.save();

      // Keep top-level User document in sync when upgrading existing subscription
      try {
        await User.findByIdAndUpdate(userId, {
          plan: planType,
          subscriptionStatus: "active",
          subscriptionId: subscription._id?.toString(),
          subscriptionEndsAt: subscription.subscriptionEndDate || null,
        });
      } catch (err) {
        console.warn(
          "Failed to update User document after updating credit subscription:",
          err.message
        );
      }

      return {
        subscription,
        pricing: this.getPricingBreakdown(newCredits, currency),
        planName,
        price: newPrice,
        currency,
      };
    } catch (error) {
      console.error("Subscription credits update error:", error);
      throw new Error("Failed to update subscription credits");
    }
  }

  // Get available presets
  getPresets() {
    return this.presets;
  }

  // Get pricing configurations
  getPricingConfigs() {
    return this.pricingConfigs;
  }

  // Validate credit selection
  validateCredits(credits) {
    const errors = [];

    if (!credits.posts || credits.posts < 10 || credits.posts > 100) {
      errors.push("Posts must be between 10 and 100");
    }

    if (!credits.comments || credits.comments < 10 || credits.comments > 100) {
      errors.push("Comments must be between 10 and 100");
    }

    if (!credits.ideas || credits.ideas < 10 || credits.ideas > 100) {
      errors.push("Ideas must be between 10 and 100");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get current subscription with pricing details
  async getCurrentSubscription(userId) {
    try {
      const subscription = await UserSubscription.findOne({ userId });
      return subscription;
    } catch (error) {
      console.error("Get current subscription error:", error);
      throw new Error("Failed to get current subscription");
    }
  }
}

export default new PricingService();

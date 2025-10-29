import mongoose from "mongoose";
import { config } from "../config/index.js";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
import Payment from "../models/Payment.js";
import pricingService from "../services/pricingService.js";

// Script to fix a single user's subscription/payment for a custom package
// Usage: node backend/scripts/fix_custom_subscription_for_user.js

const TARGET_EMAIL = "bhaswanthreddy05@gmail.com";

const run = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, { dbName: config.DB_NAME });
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email: TARGET_EMAIL.toLowerCase() });
    if (!user) {
      console.error("User not found for email:", TARGET_EMAIL);
      process.exit(1);
    }

    const credits = { posts: 10, comments: 10, ideas: 10 };
    const currency = "USD";
    const billingInterval = "monthly";

    const price = pricingService.getDisplayPrice(credits, currency);
    const planName = pricingService.getPlanName(credits);

    // Upsert user subscription
    let subscription = await UserSubscription.findOne({ userId: user._id });

    const now = new Date();
    const subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (!subscription) {
      subscription = new UserSubscription({
        userId: user._id,
        plan: "custom",
        status: "active",
        trialStartDate: now,
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subscriptionStartDate: now,
        subscriptionEndDate: subscriptionEnd,
        limits: {
          postsPerMonth: credits.posts,
          commentsPerMonth: credits.comments,
          ideasPerMonth: credits.ideas,
          templatesAccess: true,
          linkedinAnalysis: true,
          profileAnalyses: -1,
          prioritySupport: false,
        },
        billing: {
          amount: price,
          currency,
          interval: billingInterval,
          nextBillingDate: subscriptionEnd,
        },
        tokens: {
          total: credits.posts * 5 + credits.comments * 3 + credits.ideas * 4,
          used: 0,
          remaining:
            credits.posts * 5 + credits.comments * 3 + credits.ideas * 4,
        },
      });
    } else {
      subscription.plan = "custom";
      subscription.status = "active";
      subscription.subscriptionStartDate = now;
      subscription.subscriptionEndDate = subscriptionEnd;
      subscription.limits.postsPerMonth = credits.posts;
      subscription.limits.commentsPerMonth = credits.comments;
      subscription.limits.ideasPerMonth = credits.ideas;
      subscription.billing.amount = price;
      subscription.billing.currency = currency;
      subscription.billing.interval = billingInterval;
      subscription.billing.nextBillingDate = subscriptionEnd;

      const newTokenTotal =
        credits.posts * 5 + credits.comments * 3 + credits.ideas * 4;
      subscription.tokens.total = newTokenTotal;
      subscription.tokens.used = 0;
      subscription.tokens.remaining = newTokenTotal;
    }

    await subscription.save();
    console.log("UserSubscription updated for", user.email);

    // Create a payment record (manual fix)
    const nowTs = Date.now();
    const orderId = `manual-fix-${nowTs}`;

    await Payment.create({
      userId: user._id,
      orderId,
      razorpayOrderId: orderId,
      razorpayPaymentId: `manual-${nowTs}`,
      plan: "custom",
      billingPeriod: billingInterval,
      amount: price,
      currency: currency,
      status: "captured",
      paymentMethod: "manual",
      captured: true,
      capturedAt: new Date(),
      metadata: {
        credits,
        note: "Manual migration/fix: marked paid for custom credits",
      },
    });

    console.log("Payment record created for", user.email);

    // Update top-level user.plan field too
    user.plan = "custom";
    user.subscriptionStatus = "active";
    user.subscriptionId = subscription._id?.toString() || user.subscriptionId;
    user.subscriptionEndsAt =
      subscription.subscriptionEndDate || user.subscriptionEndsAt;

    await user.save();
    console.log("User document updated plan and subscription status");

    console.log(
      "Done. Please restart backend if running and verify frontend shows trial + custom for the user."
    );
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

run();

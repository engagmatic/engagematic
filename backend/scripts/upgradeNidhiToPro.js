import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
import { config } from "../config/index.js";

// Load environment variables
dotenv.config();

const upgradeNidhiToPro = async () => {
  try {
    // Connect to MongoDB
    try {
      await mongoose.connect(config.MONGODB_URI, {
        dbName: config.DB_NAME,
      });
      console.log("✅ MongoDB connected successfully");
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      process.exit(1);
    }

    // Find latest user whose name is "Nidhi" (case-insensitive)
    const targetUser = await User.findOne({
      name: { $regex: /^nidhi$/i },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!targetUser) {
      console.error('❌ No user found with name "Nidhi"');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log("✅ Target user found:", {
      name: targetUser.name,
      email: targetUser.email,
      currentPlan: targetUser.plan,
      subscriptionStatus: targetUser.subscriptionStatus,
      createdAt: targetUser.createdAt,
    });

    const userId = targetUser._id;
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Update User document to PRO (premium) with active status
    await User.findByIdAndUpdate(userId, {
      plan: "pro",
      subscriptionStatus: "active",
      subscriptionEndsAt: oneYearFromNow,
      trialEndsAt: null,
    });
    console.log('✅ User document updated: plan set to "pro" (premium), status "active"');

    // Fetch or create subscription
    let subscription = await UserSubscription.findOne({ userId });

    if (!subscription) {
      subscription = new UserSubscription({
        userId,
        plan: "pro",
        status: "active",
        subscriptionStartDate: new Date(),
        subscriptionEndDate: oneYearFromNow,
        trialStartDate: null,
        trialEndDate: null,
        tokens: {
          total: 1000,
          used: 0,
          remaining: 1000,
        },
        limits: {
          postsPerMonth: 60,
          commentsPerMonth: 80,
          ideasPerMonth: -1,
          templatesAccess: true,
          linkedinAnalysis: true,
          profileAnalyses: 10,
          prioritySupport: true,
        },
        // Mark as FREE premium upgrade
        billing: {
          amount: 0,
          currency: "USD",
          interval: "yearly",
          nextBillingDate: oneYearFromNow,
        },
      });
      console.log(
        "✅ Created new UserSubscription with PRO plan (FREE premium upgrade, amount = 0)"
      );
    } else {
      subscription.plan = "pro";
      subscription.status = "active";
      subscription.subscriptionStartDate = new Date();
      subscription.subscriptionEndDate = oneYearFromNow;
      subscription.trialStartDate = null;
      subscription.trialEndDate = null;

      subscription.limits.postsPerMonth = 60;
      subscription.limits.commentsPerMonth = 80;
      subscription.limits.ideasPerMonth = -1;
      subscription.limits.templatesAccess = true;
      subscription.limits.linkedinAnalysis = true;
      subscription.limits.profileAnalyses = 10;
      subscription.limits.prioritySupport = true;

      // Free upgrade: zero out billing amount
      subscription.billing.amount = 0;
      subscription.billing.currency = "USD";
      subscription.billing.interval = "yearly";
      subscription.billing.nextBillingDate = oneYearFromNow;

      subscription.tokens.total = 1000;
      subscription.tokens.remaining = 1000 - (subscription.tokens.used || 0);

      console.log(
        "✅ Updated existing UserSubscription to PRO plan (FREE premium upgrade, amount = 0)"
      );
    }

    await subscription.save();
    console.log("✅ UserSubscription saved");

    const updatedUser = await User.findById(userId).lean();
    const updatedSubscription = await UserSubscription.findOne({ userId }).lean();

    console.log('\n✅ Success! User "Nidhi" upgraded to PRO (premium) plan for FREE');
    console.log("=".repeat(50));
    console.log("User Details:");
    console.log(`  Name: ${updatedUser.name}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Plan: ${updatedUser.plan}`);
    console.log(`  Subscription Status: ${updatedUser.subscriptionStatus}`);
    console.log("\nSubscription Details:");
    console.log(`  Plan: ${updatedSubscription.plan}`);
    console.log(`  Status: ${updatedSubscription.status}`);
    console.log(`  Posts/Month: ${updatedSubscription.limits.postsPerMonth}`);
    console.log(
      `  Comments/Month: ${updatedSubscription.limits.commentsPerMonth}`
    );
    console.log(`  Ideas/Month: ${updatedSubscription.limits.ideasPerMonth}`);
    console.log(
      `  Billing Amount: ${updatedSubscription.billing.amount} ${updatedSubscription.billing.currency}`
    );
    console.log(
      `  Subscription Start Date: ${updatedSubscription.subscriptionStartDate}`
    );
    console.log(
      `  Subscription End Date: ${updatedSubscription.subscriptionEndDate}`
    );
    console.log("=".repeat(50));

    await mongoose.disconnect();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error('❌ Error upgrading user "Nidhi" to PRO:', error);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
};

// Run the script
upgradeNidhiToPro();


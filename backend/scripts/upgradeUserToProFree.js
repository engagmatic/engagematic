import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
import { config } from "../config/index.js";

// Load environment variables
dotenv.config();

const upgradeUserToProFree = async (email) => {
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

    // Find the user by email (case-insensitive)
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      console.error("❌ User not found:", email);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log("✅ User found:", user.name, `(${user.email})`);
    console.log("Current plan:", user.plan);
    console.log("Current subscription status:", user.subscriptionStatus);

    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Update user document to PRO (premium) with active status
    user.plan = "pro";
    user.subscriptionStatus = "active";
    user.subscriptionEndsAt = oneYearFromNow;
    user.trialEndsAt = null;
    await user.save();
    console.log("✅ User document updated to PRO (premium), status active");

    // Create or update UserSubscription as a FREE Pro plan
    const now = new Date();

    const subscription = await UserSubscription.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          plan: "pro",
          status: "active",
          // subscription window
          subscriptionStartDate: now,
          subscriptionEndDate: oneYearFromNow,
          trialStartDate: null,
          trialEndDate: null,
          // generous Pro-style limits
          limits: {
            postsPerMonth: 60,
            commentsPerMonth: 80,
            ideasPerMonth: -1,
            templatesAccess: true,
            linkedinAnalysis: true,
            profileAnalyses: 10,
            prioritySupport: true,
          },
          // FREE premium: billing amount is 0
          billing: {
            amount: 0,
            currency: "USD",
            interval: "yearly",
            nextBillingDate: oneYearFromNow,
          },
          // tokens for Pro plan
          tokens: {
            total: 1000,
            used: 0,
            remaining: 1000,
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    ).lean();

    console.log("✅ UserSubscription upserted as FREE PRO plan");

    console.log("\n✅ Success! User upgraded to PRO (premium) plan for FREE");
    console.log("=".repeat(50));
    console.log("User Details:");
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Plan: ${user.plan}`);
    console.log(`  Subscription Status: ${user.subscriptionStatus}`);
    console.log("\nSubscription Details:");
    console.log(`  Plan: ${subscription.plan}`);
    console.log(`  Status: ${subscription.status}`);
    console.log(`  Posts/Month: ${subscription.limits.postsPerMonth}`);
    console.log(`  Comments/Month: ${subscription.limits.commentsPerMonth}`);
    console.log(`  Ideas/Month: ${subscription.limits.ideasPerMonth}`);
    console.log(
      `  Billing Amount: ${subscription.billing.amount} ${subscription.billing.currency}`
    );
    console.log(
      `  Subscription Start Date: ${subscription.subscriptionStartDate}`
    );
    console.log(
      `  Subscription End Date: ${subscription.subscriptionEndDate}`
    );
    console.log("=".repeat(50));

    await mongoose.disconnect();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error upgrading user to FREE PRO:", error);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log(
    "Usage: node backend/scripts/upgradeUserToProFree.js <email>"
  );
  process.exit(1);
}

// Run the upgrade
upgradeUserToProFree(email);


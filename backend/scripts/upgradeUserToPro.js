import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
import { config } from "../config/index.js";

// Load environment variables
dotenv.config();

const upgradeUserToPro = async (email) => {
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
    console.log("✅ Connected to MongoDB");

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error("❌ User not found:", email);
      process.exit(1);
    }

    console.log("✅ User found:", user.name, `(${user.email})`);
    console.log("Current plan:", user.plan);
    console.log("Current subscription status:", user.subscriptionStatus);

    // Update user model
    user.plan = "pro";
    user.subscriptionStatus = "active";
    user.subscriptionEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    await user.save();
    console.log("✅ User model updated to PRO");

    // Update or create UserSubscription
    let subscription = await UserSubscription.findOne({ userId: user._id });

    if (!subscription) {
      // Create new subscription if doesn't exist
      subscription = new UserSubscription({
        userId: user._id,
        plan: "pro",
        status: "active",
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        tokens: {
          total: 1000, // Pro plan tokens
          used: 0,
          remaining: 1000,
        },
        billing: {
          amount: 24,
          currency: "USD",
          interval: "monthly",
        },
      });
      console.log("✅ Created new UserSubscription");
    } else {
      // Update existing subscription
      subscription.plan = "pro";
      subscription.status = "active";
      subscription.subscriptionStartDate = new Date();
      subscription.subscriptionEndDate = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ); // 1 year
      subscription.tokens.total = 1000;
      subscription.tokens.remaining = 1000 - subscription.tokens.used;
      subscription.billing.amount = 24;
      subscription.billing.interval = "monthly";
      console.log("✅ Updated existing UserSubscription");
    }

    await subscription.save();
    console.log("✅ UserSubscription saved");

    console.log("\n✅ Success! User upgraded to PRO plan");
    console.log("User:", user.name, `(${user.email})`);
    console.log("Plan:", subscription.plan);
    console.log("Status:", subscription.status);
    console.log("Limits:", {
      postsPerMonth: subscription.limits.postsPerMonth,
      commentsPerMonth: subscription.limits.commentsPerMonth,
      profileAnalyses: subscription.limits.profileAnalyses,
      prioritySupport: subscription.limits.prioritySupport,
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error upgrading user:", error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: node backend/scripts/upgradeUserToPro.js <email>");
  process.exit(1);
}

// Run the upgrade
upgradeUserToPro(email);

#!/usr/bin/env node

/**
 * Script to update existing trial users with new trial limits
 * New limits: 7 posts, 14 comments, 14 ideas
 */

import mongoose from "mongoose";
import UserSubscription from "../models/UserSubscription.js";
import User from "../models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const updateTrialLimits = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("✅ Connected to MongoDB");

    // Find all trial users
    const trialUsers = await User.find({
      subscriptionStatus: "trial",
      isActive: true,
    });

    console.log(`📊 Found ${trialUsers.length} trial users to update`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of trialUsers) {
      try {
        // Find or create subscription for this user
        let subscription = await UserSubscription.findOne({ userId: user._id });

        if (!subscription) {
          // Create new subscription with trial limits
          subscription = new UserSubscription({
            userId: user._id,
            plan: "trial",
            status: "trial",
            limits: {
              postsPerMonth: 7, // 1 post per day for 7 days
              commentsPerMonth: 14, // 2 comments per day for 7 days
              ideasPerMonth: 14, // 2 ideas per day for 7 days
              templatesAccess: true,
              linkedinAnalysis: true,
              profileAnalyses: -1, // UNLIMITED profile analyses
              prioritySupport: false,
            },
            billing: {
              amount: 0,
              currency: "USD",
              interval: "monthly",
              nextBillingDate: null,
            },
            tokens: {
              total: 7 * 5 + 14 * 3 + 14 * 4, // Token calculation
              used: 0,
              remaining: 7 * 5 + 14 * 3 + 14 * 4,
            },
            trialEndDate: user.trialEndsAt,
          });
        } else {
          // Update existing subscription with new trial limits
          subscription.limits.postsPerMonth = 7;
          subscription.limits.commentsPerMonth = 14;
          subscription.limits.ideasPerMonth = 14;

          // Recalculate tokens
          const newTokenTotal = 7 * 5 + 14 * 3 + 14 * 4;
          subscription.tokens.total = newTokenTotal;
          subscription.tokens.remaining =
            newTokenTotal - subscription.tokens.used;
        }

        await subscription.save();
        updatedCount++;

        console.log(`✅ Updated trial limits for user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Error updating user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Update Summary:`);
    console.log(`✅ Successfully updated: ${updatedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📊 Total processed: ${trialUsers.length} users`);

    // Close database connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
};

// Run the script
updateTrialLimits();

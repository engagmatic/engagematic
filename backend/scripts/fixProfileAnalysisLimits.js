import mongoose from "mongoose";
import UserSubscription from "../models/UserSubscription.js";
import User from "../models/User.js";
import { config } from "../config/index.js";

async function fixProfileAnalysisLimits() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🔍 Checking current subscription status...");

    // Get all subscriptions
    const subscriptions = await UserSubscription.find({});
    console.log(`📊 Found ${subscriptions.length} subscriptions`);

    for (const sub of subscriptions) {
      console.log(`\n👤 User: ${sub.userId}`);
      console.log(`   Plan: ${sub.plan}`);
      console.log(`   Profile analyses limit: ${sub.limits.profileAnalyses}`);
      console.log(`   Profile analyses usage: ${sub.usage.profileAnalyses}`);
      console.log(
        `   LinkedIn analysis enabled: ${sub.limits.linkedinAnalysis}`
      );
    }

    console.log("\n🔄 Applying comprehensive fix...");

    // Fix all subscriptions
    const result = await UserSubscription.updateMany(
      {}, // Update all documents
      {
        $set: {
          "limits.profileAnalyses": -1, // Set to unlimited
          "limits.linkedinAnalysis": true, // Ensure feature is enabled
          "usage.profileAnalyses": 0, // Reset usage to 0
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} subscriptions`);

    // Verify the fix
    const fixedSubscriptions = await UserSubscription.find({});
    console.log(`\n📊 Verification after fix:`);

    for (const sub of fixedSubscriptions) {
      console.log(`\n👤 User: ${sub.userId}`);
      console.log(`   Plan: ${sub.plan}`);
      console.log(
        `   Profile analyses limit: ${sub.limits.profileAnalyses} ${
          sub.limits.profileAnalyses === -1 ? "(UNLIMITED)" : ""
        }`
      );
      console.log(`   Profile analyses usage: ${sub.usage.profileAnalyses}`);
      console.log(
        `   LinkedIn analysis enabled: ${sub.limits.linkedinAnalysis}`
      );

      // Test the canPerformAction method
      const canAnalyze = sub.canPerformAction("analyze_profile");
      console.log(
        `   Can analyze profile: ${canAnalyze.allowed ? "✅ YES" : "❌ NO"}`
      );
      if (!canAnalyze.allowed) {
        console.log(`   Reason: ${canAnalyze.reason}`);
      }
    }

    console.log("\n🎉 Profile analysis limits fix completed!");
  } catch (error) {
    console.error("❌ Error fixing profile analysis limits:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

fixProfileAnalysisLimits();

import mongoose from "mongoose";
import UserSubscription from "../models/UserSubscription.js";
import { config } from "../config/index.js";

async function resetProfileAnalysisUsage() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🔄 Resetting profile analysis usage to 0...");

    // Reset profile analysis usage for all users
    const result = await UserSubscription.updateMany(
      {}, // Update all documents
      {
        $set: {
          "usage.profileAnalyses": 0, // Reset usage to 0
        },
      }
    );

    console.log(
      `✅ Reset profile analysis usage for ${result.modifiedCount} users`
    );

    // Verify the reset
    const zeroUsageCount = await UserSubscription.countDocuments({
      "usage.profileAnalyses": 0,
    });

    const totalCount = await UserSubscription.countDocuments();

    console.log(`\n📊 Verification:`);
    console.log(`   Total subscriptions: ${totalCount}`);
    console.log(`   Zero usage count: ${zeroUsageCount}`);

    if (zeroUsageCount === totalCount) {
      console.log("✅ All users successfully reset to zero usage!");
    } else {
      console.log("⚠️ Some users may not have been reset");
    }

    // Show current limits
    const sampleSubscription = await UserSubscription.findOne();
    if (sampleSubscription) {
      console.log(`\n📋 Sample subscription limits:`);
      console.log(
        `   Profile analyses limit: ${sampleSubscription.limits.profileAnalyses}`
      );
      console.log(
        `   Profile analyses usage: ${sampleSubscription.usage.profileAnalyses}`
      );
      console.log(`   Plan: ${sampleSubscription.plan}`);
    }
  } catch (error) {
    console.error("❌ Error resetting profile analysis usage:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

resetProfileAnalysisUsage();

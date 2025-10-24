import mongoose from "mongoose";
import UserSubscription from "../models/UserSubscription.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

/**
 * Reset profile analyses count for all users OR upgrade to unlimited
 */
async function resetProfileAnalyses() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.DB_NAME,
    });
    console.log("✅ Connected to MongoDB");

    // Option 1: Reset profile analyses count to 0 (keeps trial plan)
    console.log("\n📊 Resetting profile analyses count...");
    const resetResult = await UserSubscription.updateMany(
      {},
      { $set: { "usage.profileAnalyses": 0 } }
    );
    console.log(
      `✅ Reset ${resetResult.modifiedCount} user(s) profile analyses`
    );

    // Option 2: Upgrade all trial users to unlimited profile analyses
    console.log("\n🚀 Upgrading trial users to unlimited profile analyses...");
    const upgradeResult = await UserSubscription.updateMany(
      { plan: "trial" },
      { $set: { "limits.profileAnalyses": -1 } } // -1 = unlimited
    );
    console.log(
      `✅ Upgraded ${upgradeResult.modifiedCount} trial user(s) to unlimited`
    );

    // Show current subscriptions
    console.log("\n📋 Current subscriptions:");
    const subscriptions = await UserSubscription.find({});
    subscriptions.forEach((sub) => {
      console.log(`User ${sub.userId}:`);
      console.log(`  Plan: ${sub.plan}`);
      console.log(`  Status: ${sub.status}`);
      console.log(
        `  Profile Analyses: ${sub.usage.profileAnalyses} / ${
          sub.limits.profileAnalyses === -1
            ? "Unlimited"
            : sub.limits.profileAnalyses
        }`
      );
      console.log(
        `  Posts: ${sub.usage.posts} / ${
          sub.limits.posts === -1 ? "Unlimited" : sub.limits.posts
        }`
      );
      console.log(
        `  Comments: ${sub.usage.comments} / ${
          sub.limits.comments === -1 ? "Unlimited" : sub.limits.comments
        }`
      );
    });

    console.log(
      "\n✅ All done! You can now use profile analysis without limits."
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetProfileAnalyses();

import mongoose from "mongoose";
import UserSubscription from "../models/UserSubscription.js";
import { config } from "../config/index.js";

async function updateTrialLimits() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.DB_NAME,
    });
    console.log("✅ Connected to MongoDB");

    console.log("🔍 Finding all trial users...");
    const trialUsers = await UserSubscription.find({ plan: "trial" });
    console.log(`📊 Found ${trialUsers.length} trial users`);

    let updated = 0;
    for (const subscription of trialUsers) {
      if (subscription.limits.profileAnalyses !== 3) {
        subscription.limits.profileAnalyses = 3;
        await subscription.save();
        updated++;
        console.log(
          `✅ Updated user ${subscription.userId}: profileAnalyses 1 → 3`
        );
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`   Total trial users: ${trialUsers.length}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Already up-to-date: ${trialUsers.length - updated}`);

    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

updateTrialLimits();

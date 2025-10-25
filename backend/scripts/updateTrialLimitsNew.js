import mongoose from "mongoose";
import UserSubscription from "../models/UserSubscription.js";
import config from "../config/index.js";

async function updateTrialLimits() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n📊 Fetching all trial users...");
    const trialUsers = await UserSubscription.find({ plan: "trial" });
    console.log(`Found ${trialUsers.length} trial users`);

    let updatedCount = 0;
    let skippedCount = 0;

    console.log("\n🔄 Updating trial limits...\n");

    for (const subscription of trialUsers) {
      const needsUpdate =
        subscription.limits.postsPerMonth !== 10 ||
        subscription.limits.commentsPerMonth !== 25 ||
        subscription.limits.ideasPerMonth !== 25;

      if (needsUpdate) {
        const oldLimits = {
          posts: subscription.limits.postsPerMonth,
          comments: subscription.limits.commentsPerMonth,
          ideas: subscription.limits.ideasPerMonth || 0,
        };

        // Update limits
        subscription.limits.postsPerMonth = 10;
        subscription.limits.commentsPerMonth = 25;
        subscription.limits.ideasPerMonth = 25;

        await subscription.save();

        console.log(`✅ Updated user ${subscription.userId}:`);
        console.log(
          `   Posts: ${oldLimits.posts} → 10, Comments: ${oldLimits.comments} → 25, Ideas: ${oldLimits.ideas} → 25`
        );

        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY:");
    console.log("=".repeat(60));
    console.log(`Total trial users: ${trialUsers.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Already correct: ${skippedCount}`);
    console.log("=".repeat(60));

    console.log("\n✅ Trial limits update completed successfully!");
  } catch (error) {
    console.error("❌ Error updating trial limits:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the update
updateTrialLimits();

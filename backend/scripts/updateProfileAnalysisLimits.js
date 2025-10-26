import mongoose from "mongoose";
import UserSubscription from "../models/UserSubscription.js";
import { config } from "../config/index.js";

async function updateProfileAnalysisLimits() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🔄 Updating profile analysis limits to unlimited...");

    // Update all existing subscriptions to have unlimited profile analyses
    const result = await UserSubscription.updateMany(
      {}, // Update all documents
      {
        $set: {
          "limits.profileAnalyses": -1, // Set to unlimited
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} user subscriptions`);
    console.log("🎉 All users now have UNLIMITED profile analyses!");

    // Verify the update
    const unlimitedCount = await UserSubscription.countDocuments({
      "limits.profileAnalyses": -1,
    });

    const totalCount = await UserSubscription.countDocuments();

    console.log(`\n📊 Verification:`);
    console.log(`   Total subscriptions: ${totalCount}`);
    console.log(`   Unlimited analyses: ${unlimitedCount}`);

    if (unlimitedCount === totalCount) {
      console.log("✅ All users successfully updated to unlimited!");
    } else {
      console.log("⚠️ Some users may not have been updated");
    }
  } catch (error) {
    console.error("❌ Error updating profile analysis limits:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

updateProfileAnalysisLimits();

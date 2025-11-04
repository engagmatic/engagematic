import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";
import { config } from "../config/index.js";

// Load environment variables
dotenv.config();

const getLatestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.DB_NAME,
    });
    console.log("✅ Connected to MongoDB");

    // Find the latest user (most recent createdAt)
    const latestUser = await User.findOne()
      .select("name email createdAt plan subscriptionStatus profile")
      .sort({ createdAt: -1 });

    if (!latestUser) {
      console.log("❌ No users found in database");
      process.exit(1);
    }

    console.log("\n📋 Latest User Who Signed Up:\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Name: ${latestUser.name || "N/A"}`);
    console.log(`Email: ${latestUser.email}`);
    console.log(`Plan: ${latestUser.plan || "trial"}`);
    console.log(`Subscription Status: ${latestUser.subscriptionStatus || "trial"}`);
    console.log(`Signed Up: ${latestUser.createdAt.toLocaleString()}`);
    console.log(`User ID: ${latestUser._id}`);
    
    if (latestUser.profile) {
      console.log("\nProfile Information:");
      if (latestUser.profile.jobTitle) console.log(`  Job Title: ${latestUser.profile.jobTitle}`);
      if (latestUser.profile.company) console.log(`  Company: ${latestUser.profile.company}`);
      if (latestUser.profile.industry) console.log(`  Industry: ${latestUser.profile.industry}`);
    }
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error fetching latest user:", error);
    process.exit(1);
  }
};

// Run the query
getLatestUser();


import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { config } from "../config/index.js";

// Load environment variables
dotenv.config();

const findUser = async (email) => {
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

    // Find all users with similar email
    const users = await User.find({
      email: { $regex: email, $options: "i" },
    });

    if (users.length === 0) {
      console.log("❌ No users found with email containing:", email);
      process.exit(1);
    }

    console.log(`\n✅ Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Plan: ${user.plan}`);
      console.log(`  Status: ${user.subscriptionStatus}`);
      console.log(`  ID: ${user._id}`);
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error finding user:", error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: node backend/scripts/findUser.js <email>");
  process.exit(1);
}

// Run the find
findUser(email);

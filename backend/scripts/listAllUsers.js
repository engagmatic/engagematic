import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { config } from "../config/index.js";

// Load environment variables
dotenv.config();

const listAllUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = `${config.MONGODB_URI}/${config.DB_NAME}`;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find all users
    const users = await User.find()
      .select("name email plan subscriptionStatus")
      .sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log("❌ No users found in database");
      process.exit(1);
    }

    console.log(`\n✅ Found ${users.length} user(s) in the database:\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Status: ${user.subscriptionStatus}`);
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error listing users:", error);
    process.exit(1);
  }
};

// Run the list
listAllUsers();

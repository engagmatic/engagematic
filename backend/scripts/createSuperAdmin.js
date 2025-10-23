/**
 * Script to create a super admin user
 * Run: node backend/scripts/createSuperAdmin.js
 */

import mongoose from "mongoose";
import readline from "readline";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/linkedinpulse";
    console.log("\n🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    console.log("═══════════════════════════════════════");
    console.log("   CREATE SUPER ADMIN ACCOUNT");
    console.log("═══════════════════════════════════════\n");

    // Get admin details
    const username = await question(
      "Enter admin username (lowercase, min 3 chars): "
    );

    if (!username || username.length < 3) {
      console.log("\n❌ Username must be at least 3 characters long");
      rl.close();
      process.exit(1);
    }

    // Check if username already exists
    const existingAdmin = await Admin.findOne({
      username: username.toLowerCase(),
    });
    if (existingAdmin) {
      console.log(
        "\n❌ Username already exists. Please choose a different username."
      );
      rl.close();
      process.exit(1);
    }

    const password = await question("Enter admin password (min 8 chars): ");

    if (!password || password.length < 8) {
      console.log("\n❌ Password must be at least 8 characters long");
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question("Confirm password: ");

    if (password !== confirmPassword) {
      console.log("\n❌ Passwords do not match");
      rl.close();
      process.exit(1);
    }

    const email = await question(
      "Enter admin email (optional, press Enter to skip): "
    );

    // Create admin
    console.log("\n🔄 Creating super admin account...");

    const admin = new Admin({
      username: username.toLowerCase(),
      password: password,
      role: "super_admin",
      email: email || undefined,
      isActive: true,
    });

    await admin.save();

    console.log("\n✅ Super admin account created successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("📋 ADMIN DETAILS:");
    console.log("═══════════════════════════════════════");
    console.log(`Username: ${admin.username}`);
    console.log(`Role: ${admin.role}`);
    if (admin.email) console.log(`Email: ${admin.email}`);
    console.log(`Created: ${admin.createdAt}`);
    console.log("═══════════════════════════════════════\n");

    console.log("🔐 IMPORTANT: Store these credentials securely!");
    console.log("💡 You can now login at: /admin\n");

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating super admin:", error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createSuperAdmin();

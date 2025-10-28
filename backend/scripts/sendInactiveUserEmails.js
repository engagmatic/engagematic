#!/usr/bin/env node

/**
 * Send Re-engagement Emails to Inactive Users
 * This script sends emails to users who haven't been active in 7+ days
 */

import mongoose from "mongoose";
import User from "../models/User.js";
import emailService from "../services/emailService.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:5000";

async function sendInactiveUserEmails() {
  try {
    console.log("🚀 Starting inactive user email campaign...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Initialize email service
    await emailService.initialize();
    console.log("✅ Email service initialized");

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Find inactive users
    const inactiveUsers = await User.find({
      lastActiveAt: { $lt: sevenDaysAgo },
      emailPreferences: { $ne: "none" },
      // Don't send to users who already received re-engagement emails recently
      $or: [
        { lastReengagementEmail: { $exists: false } },
        { lastReengagementEmail: { $lt: fourteenDaysAgo } },
      ],
    }).limit(200);

    console.log(`📊 Found ${inactiveUsers.length} inactive users to email`);

    if (inactiveUsers.length === 0) {
      console.log("✅ No inactive users found to email");
      return;
    }

    let sentCount = 0;
    const errors = [];

    // Send re-engagement emails
    for (const user of inactiveUsers) {
      try {
        const daysInactive = Math.floor(
          (now - user.lastActiveAt) / (1000 * 60 * 60 * 24)
        );

        await emailService.sendEmail({
          userId: user._id,
          to: user.email,
          subject:
            "We miss you! Let's get back to creating amazing LinkedIn content 🚀",
          templateName: "reengagement",
          templateData: {
            name: user.name,
            daysInactive: daysInactive,
          },
          emailType: "reengagement_7days",
        });

        // Update user's last re-engagement email timestamp
        await User.findByIdAndUpdate(user._id, {
          lastReengagementEmail: now,
        });

        sentCount++;
        console.log(
          `✅ Email sent to ${user.email} (${daysInactive} days inactive)`
        );

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `❌ Failed to send email to ${user.email}:`,
          error.message
        );
        errors.push({ email: user.email, error: error.message });
      }
    }

    console.log("\n📈 Campaign Results:");
    console.log(`✅ Emails sent successfully: ${sentCount}`);
    console.log(`❌ Failed emails: ${errors.length}`);
    console.log(`📊 Total users processed: ${inactiveUsers.length}`);

    if (errors.length > 0) {
      console.log("\n❌ Errors:");
      errors.forEach((error) => {
        console.log(`  - ${error.email}: ${error.error}`);
      });
    }
  } catch (error) {
    console.error("💥 Script failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the script
sendInactiveUserEmails();

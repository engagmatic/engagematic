import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "../models/User.js";
import emailService from "../services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/linkedinpulse";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const sendEarlyProfessionalsEmail = async () => {
  try {
    await connectDB();
    await emailService.initialize();

    if (!emailService.initialized) {
      console.error("❌ Email service not initialized. Check RESEND_API_KEY in .env");
      process.exit(1);
    }

    // Find all active users (respect email preferences)
    const users = await User.find({
      emailPreferences: { $ne: "none" },
    }).select("_id email name");

    console.log(`📧 Found ${users.length} users to email`);

    if (users.length === 0) {
      console.log("ℹ️  No users found to email");
      process.exit(0);
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors = [];

    console.log(`\n🚀 Starting to send early professionals email...\n`);

    // Send emails with a small delay to avoid rate limiting
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        const result = await emailService.sendEmail({
          userId: user._id,
          to: user.email,
          subject: "🚀 Perfect for Early Professionals - LinkedInPulse",
          templateName: "early_professionals",
          templateData: {
            name: user.name || "there",
          },
          emailType: "custom",
        });

        if (result.success) {
          sentCount++;
          // Log progress every 10 emails
          if ((i + 1) % 10 === 0) {
            console.log(`✅ Progress: ${i + 1}/${users.length} emails sent...`);
          }
        } else {
          failedCount++;
          errors.push({ email: user.email, reason: result.reason || "Unknown error" });
        }

        // Small delay to avoid overwhelming the email service
        if (i < users.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ Failed to send email to ${user.email}:`, error.message);
        errors.push({ email: user.email, error: error.message });
      }
    }

    console.log(`\n✅ Completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Sent successfully: ${sentCount}`);
    console.log(`   - Failed: ${failedCount}`);

    if (errors.length > 0) {
      console.log(`\n❌ Errors (first 10):`);
      errors.slice(0, 10).forEach((err) => {
        console.log(`   - ${err.email}: ${err.error || err.reason}`);
      });
    }

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error sending emails:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
sendEarlyProfessionalsEmail();


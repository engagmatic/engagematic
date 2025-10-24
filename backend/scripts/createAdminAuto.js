import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
import { config } from "../config/index.js";

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.DB_NAME,
    });
    console.log("✅ Connected to MongoDB");

    console.log("\n🔐 Creating Admin User...\n");

    // Predefined admin credentials
    const adminCredentials = {
      name: "Yaswa Admin",
      email: "admin@linkedinpulse.ai",
      password: "Admin@2025",
    };

    // Check if user already exists
    const existingUser = await User.findOne({
      email: adminCredentials.email.toLowerCase(),
    });

    if (existingUser) {
      if (existingUser.isAdmin) {
        console.log("⚠️  Admin user already exists!");
        console.log("\n📧 Email:", adminCredentials.email);
        console.log("🔑 Password: Admin@2025");
        console.log("\n✅ You can login with these credentials");
        process.exit(0);
      } else {
        // Upgrade existing user to admin
        existingUser.isAdmin = true;
        await existingUser.save();
        console.log("✅ User upgraded to admin successfully!");
        console.log("\n📧 Email:", adminCredentials.email);
        console.log("🔑 Password: (use existing password)");
        process.exit(0);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminCredentials.password, salt);

    // Create admin user
    const adminUser = new User({
      name: adminCredentials.name,
      email: adminCredentials.email.toLowerCase(),
      password: hashedPassword,
      isAdmin: true,
      isActive: true,
      subscriptionStatus: "active",
      plan: "pro", // User model only supports starter/pro
    });

    await adminUser.save();

    // Create pro subscription for admin
    const subscription = await UserSubscription.create({
      userId: adminUser._id,
      plan: "pro",
      status: "active",
      limits: {
        postsPerMonth: -1, // Unlimited
        commentsPerMonth: -1,
        templatesAccess: true,
        linkedinAnalysis: true,
        profileAnalyses: -1,
        prioritySupport: true,
      },
      billing: {
        amount: 0, // Free for admin
        currency: "USD",
        interval: "monthly",
      },
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("\n" + "=".repeat(50));
    console.log("📧 Email: " + adminCredentials.email);
    console.log("🔑 Password: " + adminCredentials.password);
    console.log("=".repeat(50));
    console.log("\n🔗 Access URLs:");
    console.log("   Login: http://localhost:8080/auth/login");
    console.log("   Admin Dashboard: http://localhost:8080/admin");
    console.log("\n⚠️  IMPORTANT: Save these credentials securely!\n");
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error.message);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

createAdminUser();

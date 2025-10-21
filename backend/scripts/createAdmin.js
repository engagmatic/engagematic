import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { config } from "../config/index.js";
import readline from "readline";

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🔐 Create Admin User\n");

    // Get admin details
    const name = await question("Admin Name: ");
    const email = await question("Admin Email: ");
    const password = await question("Admin Password (min 6 chars): ");

    // Validate input
    if (!name || !email || !password) {
      console.log("❌ All fields are required");
      process.exit(1);
    }

    if (password.length < 6) {
      console.log("❌ Password must be at least 6 characters");
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.isAdmin) {
        console.log("\n⚠️  This email already has admin privileges");
        process.exit(0);
      } else {
        // Update existing user to admin
        existingUser.isAdmin = true;
        await existingUser.save();
        console.log("\n✅ User upgraded to admin successfully!");
        console.log("\n📧 Email:", email);
        console.log("🔑 Use existing password to login");
        process.exit(0);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: true,
      isActive: true,
      subscriptionStatus: "active",
      plan: "enterprise", // Give admin enterprise plan
    });

    await adminUser.save();

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📧 Email:", email);
    console.log("🔑 Password: (saved securely)");
    console.log("\n🔗 Access admin dashboard at: http://localhost:8080/admin");
    console.log(
      "\n⚠️  Remember to login first at /auth/login with these credentials\n"
    );
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    mongoose.connection.close();
    process.exit(0);
  }
}

createAdminUser();

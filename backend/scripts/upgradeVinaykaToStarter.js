import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
import Payment from "../models/Payment.js";
import { config } from "../config/index.js";

// Load environment variables
dotenv.config();

const upgradeVinaykaToStarter = async () => {
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

    // Find user by name (case-insensitive search)
    const user = await User.findOne({
      $or: [
        { name: { $regex: /vinayka/i } },
        { email: { $regex: /vinayka/i } },
      ],
    }).lean();

    if (!user) {
      console.error("❌ User 'vinayka' not found in the database");
      process.exit(1);
    }

    console.log("✅ User found:", {
      name: user.name,
      email: user.email,
      currentPlan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      userId: user._id,
    });

    const userId = user._id;
    const starterPlanAmount = 199; // ₹199/month (INR) - based on UserSubscription model

    // Update User model - ensure active status, not trial
    await User.findByIdAndUpdate(userId, {
      plan: "starter",
      subscriptionStatus: "active", // Active, NOT trial
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
      trialEndsAt: null, // Clear trial end date
    });
    console.log("✅ User model updated to STARTER (active, not trial)");

    // Get or create UserSubscription
    let subscription = await UserSubscription.findOne({ userId });

    if (!subscription) {
      // Create new subscription if doesn't exist
      subscription = new UserSubscription({
        userId: userId,
        plan: "starter",
        status: "active", // Active status, not trial
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        trialStartDate: null, // No trial
        trialEndDate: null, // No trial
        tokens: {
          total: 225, // 15 posts * 5 + 30 comments * 3 + 30 ideas * 4 = 75 + 90 + 60 = 225
          used: 0,
          remaining: 225,
        },
        limits: {
          postsPerMonth: 15,
          commentsPerMonth: 30,
          ideasPerMonth: 30,
          templatesAccess: true,
          linkedinAnalysis: true,
          profileAnalyses: -1,
          prioritySupport: false,
        },
        billing: {
          amount: starterPlanAmount, // ₹199/month for INR
          currency: "INR",
          interval: "monthly",
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      console.log("✅ Created new UserSubscription with STARTER plan (INR ₹199/month)");
    } else {
      // Update existing subscription
      subscription.plan = "starter";
      subscription.status = "active"; // Active status, not trial
      subscription.subscriptionStartDate = new Date();
      subscription.subscriptionEndDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ); // 1 month
      subscription.trialStartDate = null; // Clear trial dates
      subscription.trialEndDate = null; // Clear trial dates
      subscription.tokens.total = 225;
      subscription.tokens.remaining = 225 - (subscription.tokens.used || 0);
      subscription.limits.postsPerMonth = 15;
      subscription.limits.commentsPerMonth = 30;
      subscription.limits.ideasPerMonth = 30;
      subscription.limits.templatesAccess = true;
      subscription.limits.linkedinAnalysis = true;
      subscription.limits.profileAnalyses = -1;
      subscription.limits.prioritySupport = false;
      subscription.billing.amount = starterPlanAmount; // ₹199/month for INR
      subscription.billing.currency = "INR";
      subscription.billing.interval = "monthly";
      subscription.billing.nextBillingDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );
      console.log("✅ Updated existing UserSubscription to STARTER plan (INR ₹199/month, active)");
    }

    await subscription.save();
    console.log("✅ UserSubscription saved");

    // Create Payment record to track revenue
    const orderId = `ORDER_${Date.now()}_${userId.toString().slice(-6)}`;
    const razorpayOrderId = `RZP_ORDER_${Date.now()}_${userId.toString().slice(-6)}`;
    const razorpayPaymentId = `RZP_PAY_${Date.now()}_${userId.toString().slice(-6)}`;

    const payment = new Payment({
      userId: userId,
      orderId: orderId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      plan: "starter",
      billingPeriod: "monthly",
      amount: starterPlanAmount,
      currency: "INR",
      status: "captured",
      paymentMethod: "manual_upgrade",
      captured: true,
      capturedAt: new Date(),
      metadata: {
        credits: {
          posts: 15,
          comments: 30,
          ideas: 30,
        },
        planType: "Starter Plan",
        upgradedBy: "admin",
        upgradeType: "manual",
      },
    });

    await payment.save();
    console.log("✅ Payment record created for revenue tracking");

    // Verify the update
    const updatedUser = await User.findById(userId).lean();
    const updatedSubscription = await UserSubscription.findOne({ userId }).lean();
    const createdPayment = await Payment.findOne({ orderId }).lean();

    console.log("\n✅ Success! User 'vinayka' upgraded to STARTER plan");
    console.log("=".repeat(50));
    console.log("User Details:");
    console.log(`  Name: ${updatedUser.name}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Plan: ${updatedUser.plan}`);
    console.log(`  Subscription Status: ${updatedUser.subscriptionStatus}`);
    console.log("\nSubscription Details:");
    console.log(`  Plan: ${updatedSubscription.plan}`);
    console.log(`  Status: ${updatedSubscription.status}`);
    console.log(`  Posts/Month: ${updatedSubscription.limits.postsPerMonth}`);
    console.log(
      `  Comments/Month: ${updatedSubscription.limits.commentsPerMonth}`
    );
    console.log(`  Ideas/Month: ${updatedSubscription.limits.ideasPerMonth}`);
    console.log(`  Billing Amount: ₹${updatedSubscription.billing.amount}/month (${updatedSubscription.billing.currency})`);
    console.log(`  Status: ${updatedSubscription.status} (NOT trial)`);
    console.log(`  Subscription Start Date: ${updatedSubscription.subscriptionStartDate}`);
    console.log(`  Subscription End Date: ${updatedSubscription.subscriptionEndDate}`);
    console.log("\nPayment Record (Revenue):");
    console.log(`  Order ID: ${createdPayment.orderId}`);
    console.log(`  Amount: ₹${createdPayment.amount} ${createdPayment.currency}`);
    console.log(`  Status: ${createdPayment.status}`);
    console.log(`  Captured At: ${createdPayment.capturedAt}`);
    console.log("=".repeat(50));

    await mongoose.disconnect();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error upgrading user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
upgradeVinaykaToStarter();


import mongoose from "mongoose";
import dotenv from "dotenv";
import { config } from "../config/index.js";
import Coupon from "../models/Coupon.js";

dotenv.config();

async function createCoupon() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.DB_NAME,
    });
    console.log("✅ Connected to MongoDB");

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code: "UKD141A" });

    if (existingCoupon) {
      console.log("⚠️  Coupon UKD141A already exists in database");
      console.log("Details:", existingCoupon);
      await mongoose.disconnect();
      return;
    }

    // Create the coupon
    const coupon = new Coupon({
      code: "UKD141A",
      description: "Special 10% discount for all plans",
      discountType: "percentage",
      discountValue: 10,
      minPurchaseAmount: 0,
      maxDiscountAmount: null, // No maximum discount limit
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      usageLimit: null, // Unlimited usage
      usageCount: 0,
      applicablePlans: [], // Empty array means applies to all plans
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(), // Temporary admin ID
    });

    await coupon.save();
    console.log("✅ Coupon UKD141A created successfully!");
    console.log("Details:", {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      applicablePlans: coupon.applicablePlans,
      validUntil: coupon.endDate,
    });

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error creating coupon:", error);
    process.exit(1);
  }
}

createCoupon();

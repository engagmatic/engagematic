import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // null means no limit
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    applicablePlans: {
      type: [String],
      enum: ["starter", "pro", "custom"],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ endDate: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function (userId = null, amount = 0) {
  // Check if coupon is active
  if (!this.isActive) {
    return { valid: false, error: "Coupon is not active" };
  }

  // Check date validity
  const now = new Date();
  if (now < this.startDate || now > this.endDate) {
    return { valid: false, error: "Coupon has expired or not yet started" };
  }

  // Check usage limit
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    return { valid: false, error: "Coupon usage limit reached" };
  }

  // Check minimum purchase amount
  if (amount < this.minPurchaseAmount) {
    return {
      valid: false,
      error: `Minimum purchase of ${this.minPurchaseAmount} required`,
    };
  }

  // Check if user has already used this coupon
  if (
    userId &&
    this.usedBy.some((user) => user.userId.toString() === userId.toString())
  ) {
    return { valid: false, error: "You have already used this coupon" };
  }

  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (amount) {
  let discount = 0;

  if (this.discountType === "percentage") {
    discount = (amount * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }

  // Apply max discount limit
  if (this.maxDiscountAmount !== null && discount > this.maxDiscountAmount) {
    discount = this.maxDiscountAmount;
  }

  return Math.min(discount, amount); // Don't discount more than the amount
};

// Method to record usage
couponSchema.methods.recordUsage = function (userId) {
  this.usageCount += 1;
  this.usedBy.push({
    userId,
    usedAt: new Date(),
  });
};

export default mongoose.model("Coupon", couponSchema);

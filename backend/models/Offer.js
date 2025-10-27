import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // Maximum discount amount for percentage discounts
    maxDiscountAmount: {
      type: Number,
    },
    // Minimum order amount to apply discount
    minAmount: {
      type: Number,
      default: 0,
    },
    // Applicable plans
    applicablePlans: [
      {
        type: String,
        enum: ["starter", "pro", "custom", "all"],
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    // Per-user usage limit
    perUserLimit: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Track which users used this offer
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: Date,
        paymentId: String,
        usageCount: Number,
      },
    ],
    // Razorpay offer ID if synced
    razorpayOfferId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
offerSchema.index({ code: 1, isActive: 1 });
offerSchema.index({ startDate: 1, endDate: 1 });

// Static method to validate and apply offer
offerSchema.statics.validateOffer = async function (
  code,
  amount,
  userId,
  plan
) {
  const offer = await this.findOne({ code, isActive: true });

  if (!offer) {
    return {
      valid: false,
      message: "Invalid coupon code",
    };
  }

  // Check if offer is expired
  const now = new Date();
  if (now < offer.startDate || now > offer.endDate) {
    return {
      valid: false,
      message: "Coupon code has expired",
    };
  }

  // Check usage limit
  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
    return {
      valid: false,
      message: "Coupon code usage limit exceeded",
    };
  }

  // Check minimum amount
  if (amount < offer.minAmount) {
    return {
      valid: false,
      message: `Minimum order amount is ${offer.minAmount}`,
    };
  }

  // Check plan applicability
  if (
    offer.applicablePlans.length > 0 &&
    !offer.applicablePlans.includes("all") &&
    !offer.applicablePlans.includes(plan)
  ) {
    return {
      valid: false,
      message: "Coupon code not applicable for this plan",
    };
  }

  // Check per-user limit
  if (userId) {
    const userUsage = offer.usedBy.filter(
      (usage) => usage.userId.toString() === userId.toString()
    );
    const userUsageCount = userUsage.reduce(
      (sum, usage) => sum + (usage.usageCount || 1),
      0
    );

    if (userUsageCount >= offer.perUserLimit) {
      return {
        valid: false,
        message: "You have already used this coupon code",
      };
    }
  }

  // Calculate discount
  let discount = 0;
  if (offer.discountType === "percentage") {
    discount = (amount * offer.discountValue) / 100;
    if (offer.maxDiscountAmount) {
      discount = Math.min(discount, offer.maxDiscountAmount);
    }
  } else {
    discount = offer.discountValue;
  }

  discount = Math.min(discount, amount); // Don't discount more than the amount

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100,
    offerId: offer._id,
    offer: offer.toObject(),
  };
};

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;

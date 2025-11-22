import mongoose from "mongoose";

const affiliateCommissionSchema = new mongoose.Schema(
  {
    // The affiliate who earned the commission
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
      index: true,
    },
    // The referral that led to this commission
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
    },
    // The user who converted (referred user)
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Subscription that generates this recurring commission
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSubscription",
      required: true,
      index: true,
    },
    // Payment that triggered this commission (for initial payment tracking)
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    // Commission details
    plan: {
      type: String,
      enum: ["starter", "pro", "elite", "custom"],
      required: true,
    },
    // Monthly subscription amount (before commission)
    monthlySubscriptionAmount: {
      type: Number,
      required: true, // Amount the referred user pays monthly
    },
    currency: {
      type: String,
      default: "INR",
    },
    // Fixed 10% commission rate
    commissionRate: {
      type: Number,
      default: 10, // 10% commission
    },
    // Monthly commission amount (10% of subscription)
    monthlyCommissionAmount: {
      type: Number,
      required: true, // Calculated: monthlySubscriptionAmount * 0.10
    },
    // Recurring commission tracking
    isRecurring: {
      type: Boolean,
      default: true, // All commissions are recurring monthly
    },
    // Commission period (monthly)
    commissionPeriod: {
      type: String, // Format: "YYYY-MM" (e.g., "2024-01")
      required: true,
      index: true,
    },
    // Total commissions earned for this subscription (all-time)
    totalCommissionsEarned: {
      type: Number,
      default: 0,
    },
    // Number of months paid
    monthsPaid: {
      type: Number,
      default: 0,
    },
    // Payout status for this specific commission
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "cancelled", "refunded", "expired"],
      default: "pending",
    },
    // Payout details
    payoutDate: {
      type: Date,
      default: null,
    },
    payoutMethod: {
      type: String,
      enum: ["bank_transfer", "upi", "wallet", "credits"],
      default: null,
    },
    payoutTransactionId: {
      type: String,
      default: null,
    },
    // Whether subscription is still active (affects future commissions)
    subscriptionActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Last commission date
    lastCommissionDate: {
      type: Date,
      default: Date.now,
    },
    // Next commission date (when next payment is expected)
    nextCommissionDate: {
      type: Date,
      default: null,
    },
    // Minimum threshold for payout (in INR)
    minimumPayoutThreshold: {
      type: Number,
      default: 100, // ₹100 minimum
    },
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance
affiliateCommissionSchema.index({ affiliateId: 1, status: 1 });
affiliateCommissionSchema.index({ affiliateId: 1, subscriptionActive: 1 });
affiliateCommissionSchema.index({ referralId: 1 });
affiliateCommissionSchema.index({ referredUserId: 1 });
affiliateCommissionSchema.index({ subscriptionId: 1, commissionPeriod: 1 });
affiliateCommissionSchema.index({ status: 1, createdAt: -1 });
affiliateCommissionSchema.index({ subscriptionActive: 1, nextCommissionDate: 1 });

// Method to calculate commission (10% of monthly subscription)
affiliateCommissionSchema.statics.calculateCommission = function (
  monthlySubscriptionAmount,
  commissionRate = 10
) {
  return Math.round((monthlySubscriptionAmount * commissionRate) / 100);
};

// Method to mark as paid
affiliateCommissionSchema.methods.markAsPaid = async function (
  payoutMethod,
  transactionId
) {
  this.status = "paid";
  this.payoutDate = new Date();
  this.payoutMethod = payoutMethod;
  this.payoutTransactionId = transactionId;
  await this.save();
};

// Method to mark subscription as cancelled (stops future commissions)
affiliateCommissionSchema.methods.markSubscriptionCancelled = async function () {
  this.subscriptionActive = false;
  this.status = "expired";
  await this.save();
};

const AffiliateCommission = mongoose.model(
  "AffiliateCommission",
  affiliateCommissionSchema
);

export default AffiliateCommission;


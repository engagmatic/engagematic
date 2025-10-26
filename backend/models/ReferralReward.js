import mongoose from "mongoose";

const referralRewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
    },
    rewardType: {
      type: String,
      enum: [
        "free_month",
        "extended_trial",
        "bonus_credits",
        "discount",
        "lifetime_discount",
      ],
      required: true,
    },
    rewardValue: {
      type: Number,
      required: true, // days, percentage, or credits
    },
    status: {
      type: String,
      enum: ["pending", "active", "used", "expired"],
      default: "pending",
    },
    appliedDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
referralRewardSchema.index({ userId: 1, status: 1 });
referralRewardSchema.index({ status: 1, expiryDate: 1 });

// Method to apply reward
referralRewardSchema.methods.applyReward = async function () {
  this.status = "active";
  this.appliedDate = new Date();
  await this.save();
};

// Method to mark as used
referralRewardSchema.methods.markAsUsed = async function () {
  this.status = "used";
  await this.save();
};

const ReferralReward = mongoose.model("ReferralReward", referralRewardSchema);

export default ReferralReward;

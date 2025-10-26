import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    // The user who is referring others
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referrerEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    // Unique referral code for the referrer
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    // The user who was referred (if they signed up)
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referredUserEmail: {
      type: String,
      lowercase: true,
      default: null,
    },
    // Status of the referral
    status: {
      type: String,
      enum: ["pending", "completed", "rewarded", "expired"],
      default: "pending",
    },
    // Tracking information
    clickCount: {
      type: Number,
      default: 0,
    },
    // When the referred user signed up
    signupDate: {
      type: Date,
      default: null,
    },
    // When the referrer received their reward
    rewardedDate: {
      type: Date,
      default: null,
    },
    // Reward details
    rewardType: {
      type: String,
      enum: ["free_month", "extended_trial", "bonus_credits", "discount"],
      default: "free_month",
    },
    rewardValue: {
      type: Number,
      default: 30, // days
    },
    // Attribution tracking
    source: {
      type: String,
      enum: [
        "email",
        "social",
        "direct",
        "copy",
        "whatsapp",
        "twitter",
        "linkedin",
      ],
      default: "direct",
    },
    // IP and device info for fraud prevention
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    // Campaign tracking
    campaign: {
      type: String,
      default: null,
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ referredUserId: 1 });
referralSchema.index({ status: 1, createdAt: -1 });

// Static method to generate unique referral code
referralSchema.statics.generateReferralCode = async function (
  userId,
  userName
) {
  // Create a unique code based on user info
  const baseCode = userName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 4);

  // Add random characters
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  let code = `${baseCode}${randomPart}`;

  // Ensure uniqueness
  let exists = await this.findOne({ referralCode: code });
  let attempts = 0;

  while (exists && attempts < 10) {
    const newRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
    code = `${baseCode}${newRandom}`;
    exists = await this.findOne({ referralCode: code });
    attempts++;
  }

  return code;
};

// Method to track a click
referralSchema.methods.trackClick = async function (ipAddress, userAgent) {
  this.clickCount += 1;
  if (ipAddress) this.ipAddress = ipAddress;
  if (userAgent) this.userAgent = userAgent;
  await this.save();
};

// Method to complete referral
referralSchema.methods.completeReferral = async function (referredUser) {
  this.referredUserId = referredUser._id;
  this.referredUserEmail = referredUser.email;
  this.status = "completed";
  this.signupDate = new Date();
  await this.save();
};

// Method to mark as rewarded
referralSchema.methods.markAsRewarded = async function () {
  this.status = "rewarded";
  this.rewardedDate = new Date();
  await this.save();
};

// Virtual for referral link
referralSchema.virtual("referralLink").get(function () {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${frontendUrl}/signup?ref=${this.referralCode}`;
});

// Include virtuals in JSON
referralSchema.set("toJSON", { virtuals: true });
referralSchema.set("toObject", { virtuals: true });

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;

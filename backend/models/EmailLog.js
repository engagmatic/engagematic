import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    emailType: {
      type: String,
      required: true,
      enum: [
        "welcome",
        "onboarding_day1",
        "onboarding_day3",
        "onboarding_day5",
        "onboarding_day7",
        "milestone_10_posts",
        "milestone_50_posts",
        "milestone_100_posts",
        "trial_expiry_7days",
        "trial_expiry_3days",
        "trial_expiry_1day",
        "trial_expired",
        "reengagement_7days",
        "reengagement_14days",
        "reengagement_30days",
        "upgrade_prompt",
        "payment_failed",
        "feature_update",
        "custom",
      ],
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending", "bounced"],
      default: "pending",
    },
    provider: {
      type: String,
      default: "resend",
    },
    providerId: {
      type: String, // External email ID from provider
    },
    error: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sentAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    clickedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
emailLogSchema.index({ userId: 1, emailType: 1 });
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ emailType: 1, createdAt: -1 });

// Prevent duplicate emails within a time window
emailLogSchema.index(
  { userId: 1, emailType: 1, createdAt: 1 },
  { unique: true, partialFilterExpression: { status: "sent" } }
);

const EmailLog = mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;


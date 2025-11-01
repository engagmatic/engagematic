import mongoose from "mongoose";

const emailCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
    },
    customSubject: {
      type: String,
      trim: true,
    },
    customContent: {
      type: String,
    },
    targetAudience: {
      type: String,
      enum: [
        "all_users",
        "new_users",
        "active_users",
        "inactive_users",
        "trial_expiring",
        "trial_expired",
        "high_performers",
        "upgrade_candidates",
        "specific_users",
        "custom_filter",
      ],
      required: true,
    },
    targetUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    customFilters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed", "cancelled"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stats: {
      totalRecipients: {
        type: Number,
        default: 0,
      },
      totalSent: {
        type: Number,
        default: 0,
      },
      totalOpened: {
        type: Number,
        default: 0,
      },
      totalClicked: {
        type: Number,
        default: 0,
      },
      totalReplied: {
        type: Number,
        default: 0,
      },
      totalFailed: {
        type: Number,
        default: 0,
      },
      totalBounced: {
        type: Number,
        default: 0,
      },
      openRate: {
        type: Number,
        default: 0,
      },
      clickRate: {
        type: Number,
        default: 0,
      },
      replyRate: {
        type: Number,
        default: 0,
      },
    },
    emailLogIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmailLog",
      },
    ],
  },
  {
    timestamps: true,
  }
);

emailCampaignSchema.index({ status: 1, scheduledAt: 1 });
emailCampaignSchema.index({ createdBy: 1, createdAt: -1 });

const EmailCampaign = mongoose.model("EmailCampaign", emailCampaignSchema);

export default EmailCampaign;


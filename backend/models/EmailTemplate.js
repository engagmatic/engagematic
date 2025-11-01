import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "onboarding",
        "activation",
        "feedback",
        "upgrade",
        "inactivity",
        "testimonials",
        "milestones",
        "trial",
        "reengagement",
        "custom",
      ],
      required: true,
    },
    journeyStage: {
      type: String,
      enum: [
        "welcome",
        "onboarding_day1",
        "onboarding_day3",
        "onboarding_day5",
        "onboarding_day7",
        "first_post",
        "milestone_10",
        "milestone_50",
        "milestone_100",
        "trial_expiry_7days",
        "trial_expiry_3days",
        "trial_expiry_1day",
        "trial_expired",
        "reengagement_7days",
        "reengagement_14days",
        "reengagement_30days",
        "upgrade_prompt",
        "feedback_request",
        "testimonial_request",
        "custom",
      ],
    },
    subject: {
      type: String,
      required: [true, "Email subject is required"],
      trim: true,
    },
    htmlContent: {
      type: String,
      required: [true, "HTML content is required"],
    },
    textContent: {
      type: String,
    },
    variables: [
      {
        name: String,
        description: String,
        defaultValue: String,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

emailTemplateSchema.index({ category: 1, isActive: 1 });
emailTemplateSchema.index({ journeyStage: 1 });

const EmailTemplate = mongoose.model("EmailTemplate", emailTemplateSchema);

export default EmailTemplate;


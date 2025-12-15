import mongoose from "mongoose";

const profileAnalysisUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for anonymous users
      index: true,
    },
    ipAddress: {
      type: String,
      default: null, // For anonymous users
      index: true,
    },
    profileUrl: {
      type: String,
      required: true,
    },
    analysisData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    month: {
      type: Number, // 1-12
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for monthly usage tracking
profileAnalysisUsageSchema.index({ userId: 1, month: 1, year: 1 });
profileAnalysisUsageSchema.index({ ipAddress: 1, month: 1, year: 1 });

const ProfileAnalysisUsage = mongoose.model("ProfileAnalysisUsage", profileAnalysisUsageSchema);

export default ProfileAnalysisUsage;


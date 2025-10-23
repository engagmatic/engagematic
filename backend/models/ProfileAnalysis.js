import mongoose from "mongoose";

const profileAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    profileUrl: {
      type: String,
      required: true,
    },

    profileData: {
      headline: String,
      about: String,
      location: String,
      industry: String,
      fullName: String,
      experience: [
        {
          title: String,
          company: String,
          description: String,
          duration: String,
        },
      ],
      education: [
        {
          school: String,
          degree: String,
          field: String,
        },
      ],
      skills: [String],
    },

    scores: {
      overall: { type: Number, default: 0, min: 0, max: 100 },
      headline: { type: Number, default: 0, min: 0, max: 10 },
      about: { type: Number, default: 0, min: 0, max: 10 },
      completeness: { type: Number, default: 0, min: 0, max: 10 },
      keywords: { type: Number, default: 0, min: 0, max: 10 },
      engagement: { type: Number, default: 0, min: 0, max: 10 },
    },

    recommendations: {
      headlines: [String],
      aboutSection: String,
      skills: [String],
      keywords: [String],
      improvements: [
        {
          priority: { type: String, enum: ["high", "medium", "low"] },
          category: String,
          suggestion: String,
        },
      ],
    },

    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick user lookups
profileAnalysisSchema.index({ userId: 1, analyzedAt: -1 });

export default mongoose.model("ProfileAnalysis", profileAnalysisSchema);

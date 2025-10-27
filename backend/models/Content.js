import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["post", "comment"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [3000, "Content cannot exceed 3000 characters"],
    },
    topic: {
      type: String,
      required: function () {
        return this.type === "post";
      },
      maxlength: [500, "Topic cannot exceed 500 characters"],
    },
    hookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hook",
      required: false, // Made optional to support custom posts without hooks
      default: null,
    },
    personaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Persona",
      required: false, // Made optional to support sample personas
    },
    originalPostContent: {
      type: String,
      required: function () {
        return this.type === "comment";
      },
      maxlength: [2000, "Original post content cannot exceed 2000 characters"],
    },
    engagementScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    tokensUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
contentSchema.index({ userId: 1, type: 1, createdAt: -1 });
contentSchema.index({ userId: 1, isSaved: 1 });

const Content = mongoose.model("Content", contentSchema);

export default Content;

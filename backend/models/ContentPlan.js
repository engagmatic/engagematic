import mongoose from "mongoose";

// Single post in the content plan board
const plannerPostSchema = new mongoose.Schema(
  {
    slot: { type: Number, required: true },
    hook: { type: String, default: "" },
    angle: { type: String, default: "" },
    cta: { type: String, default: "" },
    commentPrompt: { type: String, default: "" },
    templateId: { type: String, default: "" },
    edited: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    column: { type: String, default: "ideas", enum: ["ideas", "draft", "ready", "published"] },
  },
  { _id: false }
);

const contentPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "",
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    goal: {
      type: String,
      required: true,
      enum: ["calls", "followers", "sell", "custom"],
    },
    context: {
      audience: { type: String, default: "" },
      helpWith: { type: String, default: "" },
      platforms: [{ type: String }],
      promotion: { type: String, default: "" },
    },
    config: {
      postsPerWeek: { type: Number, default: 5 },
      spiceLevel: { type: String, default: "balanced", enum: ["safe", "balanced", "bold"] },
      contentMix: [{ type: String }],
    },
    posts: [plannerPostSchema],
    status: {
      type: String,
      enum: ["draft", "finalized"],
      default: "finalized",
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

contentPlanSchema.index({ userId: 1, createdAt: -1 });
contentPlanSchema.index({ userId: 1, status: 1 });

const ContentPlan = mongoose.model("ContentPlan", contentPlanSchema);
export default ContentPlan;

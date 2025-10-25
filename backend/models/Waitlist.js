import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    company: {
      type: String,
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
      default: null,
    },
    role: {
      type: String,
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
      default: null,
    },
    useCase: {
      type: String,
      trim: true,
      maxlength: [1000, "Use case cannot exceed 1000 characters"],
      default: null,
    },
    preferredPlan: {
      type: String,
      trim: true,
      default: null,
    },
    interestedFeatures: {
      type: [String],
      default: [],
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: null,
    },
    plan: {
      type: String,
      enum: ["starter", "pro"],
      required: true,
    },
    billingPeriod: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    currency: {
      type: String,
      enum: ["USD", "INR"],
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "converted", "declined"],
      default: "pending",
    },
    source: {
      type: String,
      default: "pricing_page",
    },
    utmSource: {
      type: String,
      default: null,
    },
    utmMedium: {
      type: String,
      default: null,
    },
    utmCampaign: {
      type: String,
      default: null,
    },
    referralCode: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    priority: {
      type: Number,
      default: 0,
    },
    contactedAt: {
      type: Date,
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
waitlistSchema.index({ email: 1 });
waitlistSchema.index({ plan: 1, status: 1 });
waitlistSchema.index({ createdAt: -1 });

// Virtual for position in waitlist
waitlistSchema.virtual("position").get(async function () {
  const count = await this.model("Waitlist").countDocuments({
    plan: this.plan,
    createdAt: { $lt: this.createdAt },
  });
  return count + 1;
});

const Waitlist = mongoose.model("Waitlist", waitlistSchema);

export default Waitlist;

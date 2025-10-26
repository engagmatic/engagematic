import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: {
      type: String,
      default: null,
    },
    plan: {
      type: String,
      enum: ["starter", "pro"],
      default: "starter",
    },
    subscriptionId: {
      type: String,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled", "trial"],
      default: "trial",
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    subscriptionEndsAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // Professional Profile Information
    profile: {
      jobTitle: {
        type: String,
        default: null,
      },
      company: {
        type: String,
        default: null,
      },
      industry: {
        type: String,
        default: null,
      },
      experience: {
        type: String,
        default: null,
      },
      linkedinUrl: {
        type: String,
        default: null,
      },
    },
    // AI Persona Information
    persona: {
      name: {
        type: String,
        default: null,
      },
      writingStyle: {
        type: String,
        default: null,
      },
      tone: {
        type: String,
        default: null,
      },
      expertise: {
        type: String,
        default: null,
      },
      targetAudience: {
        type: String,
        default: null,
      },
      goals: {
        type: String,
        default: null,
      },
      contentTypes: [
        {
          type: String,
        },
      ],
      postingFrequency: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
// Note: email index is already created by unique: true
userSchema.index({ subscriptionId: 1 });

const User = mongoose.model("User", userSchema);

export default User;

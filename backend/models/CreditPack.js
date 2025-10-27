import mongoose from "mongoose";

const creditPackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    credits: {
      posts: {
        type: Number,
        required: true,
        min: 0,
      },
      comments: {
        type: Number,
        required: true,
        min: 0,
      },
      ideas: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD"],
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "used"],
      default: "pending",
    },
    activatedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      // Credit packs expire after 1 year
      default: function () {
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      },
    },
    usage: {
      postsUsed: {
        type: Number,
        default: 0,
      },
      commentsUsed: {
        type: Number,
        default: 0,
      },
      ideasUsed: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
creditPackSchema.index({ userId: 1, status: 1 });
creditPackSchema.index({ expiresAt: 1 });

const CreditPack = mongoose.model("CreditPack", creditPackSchema);

export default CreditPack;

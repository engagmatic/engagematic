import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const affiliateSchema = new mongoose.Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
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
      select: false, // Don't include password in queries by default
    },
    
    // Unique affiliate code
    affiliateCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      index: true,
    },
    
    // Referral link
    referralLink: {
      type: String,
      default: null,
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "active", "suspended", "rejected"],
      default: "pending",
      index: true,
    },
    
    // Application details
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    
    // Profile information
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
      linkedinUrl: {
        type: String,
        default: null,
      },
      website: {
        type: String,
        default: null,
      },
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
        default: null,
      },
      audienceSize: {
        type: String,
        enum: ["0-1k", "1k-10k", "10k-50k", "50k-100k", "100k+"],
        default: null,
      },
      platforms: {
        type: [String],
        default: [],
      },
    },
    
    // Payout information
    payoutInfo: {
      method: {
        type: String,
        enum: ["bank_transfer", "upi", "wallet", "credits"],
        default: null,
      },
      accountDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    
    // Statistics
    stats: {
      totalClicks: {
        type: Number,
        default: 0,
      },
      totalSignups: {
        type: Number,
        default: 0,
      },
      activeSubscriptions: {
        type: Number,
        default: 0,
      },
      totalEarned: {
        type: Number,
        default: 0,
      },
      monthlyRecurring: {
        type: Number,
        default: 0,
      },
    },
    
    // Last login
    lastLoginAt: {
      type: Date,
      default: null,
    },
    
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
affiliateSchema.index({ email: 1 });
affiliateSchema.index({ affiliateCode: 1 });
affiliateSchema.index({ status: 1 });
affiliateSchema.index({ createdAt: -1 });

// Generate unique affiliate code
affiliateSchema.statics.generateAffiliateCode = async function (name) {
  const baseCode = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 4);

  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  let code = `AFF${baseCode}${randomPart}`;

  let exists = await this.findOne({ affiliateCode: code });
  let attempts = 0;

  while (exists && attempts < 10) {
    const newRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
    code = `AFF${baseCode}${newRandom}`;
    exists = await this.findOne({ affiliateCode: code });
    attempts++;
  }

  return code;
};

// Hash password before saving
affiliateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Method to compare password
affiliateSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate referral link
affiliateSchema.methods.generateReferralLink = function () {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return `${frontendUrl}/signup?ref=${this.affiliateCode}`;
};

// Method to update referral link
affiliateSchema.methods.updateReferralLink = async function () {
  this.referralLink = this.generateReferralLink();
  await this.save();
  return this.referralLink;
};

const Affiliate = mongoose.model("Affiliate", affiliateSchema);

export default Affiliate;


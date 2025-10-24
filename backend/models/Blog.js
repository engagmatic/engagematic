import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Content
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // Media
    bannerImage: {
      type: String,
      trim: true,
    },
    bannerImageAlt: {
      type: String,
      trim: true,
    },

    // Author Information
    author: {
      name: {
        type: String,
        required: true,
        default: "LinkedInPulse Team",
      },
      email: {
        type: String,
        trim: true,
      },
      avatar: {
        type: String,
        trim: true,
      },
    },

    // SEO Fields
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: 60,
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: 160,
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
      canonicalUrl: {
        type: String,
        trim: true,
      },
    },

    // Categorization
    category: {
      type: String,
      enum: [
        "LinkedIn Tips",
        "Content Strategy",
        "AI & Technology",
        "Career Growth",
        "Marketing",
        "Productivity",
        "Updates",
        "Case Studies",
      ],
      default: "LinkedIn Tips",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Publishing
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    scheduledFor: {
      type: Date,
    },

    // Admin metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // in minutes
      default: 5,
    },

    // Featured
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ status: 1, isFeatured: -1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ tags: 1, status: 1 });

// Virtual for URL
blogSchema.virtual("url").get(function () {
  return `/blogs/${this.slug}`;
});

// Virtual for formatted date
blogSchema.virtual("formattedDate").get(function () {
  const date = this.publishedAt || this.createdAt;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Static method to generate unique slug
blogSchema.statics.generateSlug = async function (title) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Check if slug exists
  let slugExists = await this.findOne({ slug });
  let counter = 1;
  let originalSlug = slug;

  while (slugExists) {
    slug = `${originalSlug}-${counter}`;
    slugExists = await this.findOne({ slug });
    counter++;
  }

  return slug;
};

// Static method to calculate read time
blogSchema.statics.calculateReadTime = function (content) {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
};

// Static method to get published blogs
blogSchema.statics.getPublished = async function (limit = 10, page = 1) {
  const skip = (page - 1) * limit;

  return this.find({ status: "published" })
    .populate("createdBy", "username")
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-content") // Exclude full content for list view
    .lean();
};

// Static method to get featured blogs
blogSchema.statics.getFeatured = async function (limit = 3) {
  return this.find({ status: "published", isFeatured: true })
    .populate("createdBy", "username")
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select("-content")
    .lean();
};

// Static method to get by category
blogSchema.statics.getByCategory = async function (category, limit = 10) {
  return this.find({ status: "published", category })
    .populate("createdBy", "username")
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select("-content")
    .lean();
};

// Static method to search blogs
blogSchema.statics.search = async function (query, limit = 10) {
  const searchRegex = new RegExp(query, "i");

  return this.find({
    status: "published",
    $or: [
      { title: searchRegex },
      { excerpt: searchRegex },
      { "seo.keywords": searchRegex },
      { tags: searchRegex },
    ],
  })
    .populate("createdBy", "username")
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select("-content")
    .lean();
};

// Method to publish blog
blogSchema.methods.publish = function () {
  this.status = "published";
  if (!this.publishedAt) {
    this.publishedAt = new Date();
  }
  return this.save();
};

// Method to unpublish blog
blogSchema.methods.unpublish = function () {
  this.status = "draft";
  return this.save();
};

// Method to archive blog
blogSchema.methods.archive = function () {
  this.status = "archived";
  return this.save();
};

// Method to toggle featured status
blogSchema.methods.toggleFeatured = function () {
  this.isFeatured = !this.isFeatured;
  return this.save();
};

// Method to increment views
blogSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Pre-save hook to auto-generate slug and read time
blogSchema.pre("save", async function (next) {
  // Generate slug if title changed or new document
  if (this.isModified("title") && !this.slug) {
    this.slug = await this.constructor.generateSlug(this.title);
  }

  // Calculate read time if content changed
  if (this.isModified("content")) {
    this.readTime = this.constructor.calculateReadTime(this.content);
  }

  // Auto-generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt =
      this.content
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .substring(0, 200)
        .trim() + "...";
  }

  // Auto-generate SEO meta title if not provided
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }

  // Auto-generate SEO meta description if not provided
  if (!this.seo.metaDescription && this.excerpt) {
    this.seo.metaDescription = this.excerpt.substring(0, 160);
  }

  next();
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;

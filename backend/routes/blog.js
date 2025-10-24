import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import Blog from "../models/Blog.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// Get all published blogs (with pagination)
router.get("/public", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    let blogs;
    if (category) {
      blogs = await Blog.getByCategory(category, limit);
    } else {
      blogs = await Blog.getPublished(limit, page);
    }

    const total = await Blog.countDocuments({ status: "published" });

    res.json({
      success: true,
      data: blogs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: blogs.length,
        totalBlogs: total,
      },
    });
  } catch (error) {
    console.error("Error fetching public blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
});

// Get featured blogs
router.get("/public/featured", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const blogs = await Blog.getFeatured(limit);

    res.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching featured blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured blogs",
    });
  }
});

// Get single blog by slug
router.get("/public/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate("createdBy", "username")
      .lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Increment views (fire and forget)
    Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).catch((err) =>
      console.error("Error incrementing views:", err)
    );

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog post",
    });
  }
});

// Search blogs
router.get("/public/search/:query", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const blogs = await Blog.search(req.params.query, limit);

    res.json({
      success: true,
      data: blogs,
      count: blogs.length,
    });
  } catch (error) {
    console.error("Error searching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search blogs",
    });
  }
});

// ==========================================
// ADMIN ROUTES (Admin authentication required)
// ==========================================

// Get all blogs for admin (including drafts)
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = status ? { status } : {};

    const blogs = await Blog.find(query)
      .populate("createdBy", "username email")
      .populate("lastEditedBy", "username")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: blogs.length,
        totalBlogs: total,
      },
    });
  } catch (error) {
    console.error("Error fetching admin blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
});

// Get single blog by ID (admin)
router.get("/admin/:id", adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("lastEditedBy", "username")
      .lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog post",
    });
  }
});

// Create new blog
router.post("/admin/create", adminAuth, async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      bannerImage,
      bannerImageAlt,
      author,
      seo,
      category,
      tags,
      status,
      isFeatured,
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    // Generate slug
    const slug = await Blog.generateSlug(title);

    // Create blog
    const blog = new Blog({
      title,
      slug,
      content,
      excerpt,
      bannerImage,
      bannerImageAlt,
      author: author || { name: "LinkedInPulse Team" },
      seo: seo || {},
      category: category || "LinkedIn Tips",
      tags: tags || [],
      status: status || "draft",
      isFeatured: isFeatured || false,
      createdBy: req.admin._id,
      lastEditedBy: req.admin._id,
    });

    // If publishing, set publishedAt
    if (status === "published") {
      blog.publishedAt = new Date();
    }

    await blog.save();

    console.log(
      `✅ New blog created: "${title}" by admin ${req.admin.username}`
    );

    res.json({
      success: true,
      message: "Blog post created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blog post",
    });
  }
});

// Update blog
router.put("/admin/:id", adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    const {
      title,
      content,
      excerpt,
      bannerImage,
      bannerImageAlt,
      author,
      seo,
      category,
      tags,
      status,
      isFeatured,
    } = req.body;

    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (bannerImage !== undefined) blog.bannerImage = bannerImage;
    if (bannerImageAlt !== undefined) blog.bannerImageAlt = bannerImageAlt;
    if (author) blog.author = { ...blog.author, ...author };
    if (seo) blog.seo = { ...blog.seo, ...seo };
    if (category) blog.category = category;
    if (tags) blog.tags = tags;
    if (isFeatured !== undefined) blog.isFeatured = isFeatured;

    // Handle status change
    if (status && status !== blog.status) {
      blog.status = status;
      if (status === "published" && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    // Update slug if title changed
    if (title && title !== blog.title) {
      blog.slug = await Blog.generateSlug(title);
    }

    blog.lastEditedBy = req.admin._id;

    await blog.save();

    console.log(
      `📝 Blog updated: "${blog.title}" by admin ${req.admin.username}`
    );

    res.json({
      success: true,
      message: "Blog post updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog post",
    });
  }
});

// Publish blog
router.patch("/admin/:id/publish", adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    await blog.publish();

    console.log(
      `🚀 Blog published: "${blog.title}" by admin ${req.admin.username}`
    );

    res.json({
      success: true,
      message: "Blog post published successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error publishing blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish blog post",
    });
  }
});

// Unpublish blog
router.patch("/admin/:id/unpublish", adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    await blog.unpublish();

    console.log(
      `📥 Blog unpublished: "${blog.title}" by admin ${req.admin.username}`
    );

    res.json({
      success: true,
      message: "Blog post unpublished successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error unpublishing blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unpublish blog post",
    });
  }
});

// Toggle featured
router.patch("/admin/:id/toggle-featured", adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    await blog.toggleFeatured();

    console.log(
      `⭐ Blog featured status toggled: "${blog.title}" (${blog.isFeatured}) by admin ${req.admin.username}`
    );

    res.json({
      success: true,
      message: `Blog post ${
        blog.isFeatured ? "featured" : "unfeatured"
      } successfully`,
      data: blog,
    });
  } catch (error) {
    console.error("Error toggling featured:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle featured status",
    });
  }
});

// Delete blog
router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    console.log(
      `🗑️ Blog deleted: "${blog.title}" by admin ${req.admin.username}`
    );

    res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog post",
    });
  }
});

// Get blog statistics
router.get("/admin/stats/overview", adminAuth, async (req, res) => {
  try {
    const total = await Blog.countDocuments();
    const published = await Blog.countDocuments({ status: "published" });
    const draft = await Blog.countDocuments({ status: "draft" });
    const archived = await Blog.countDocuments({ status: "archived" });
    const featured = await Blog.countDocuments({ isFeatured: true });

    // Total views
    const viewsResult = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    res.json({
      success: true,
      data: {
        total,
        published,
        draft,
        archived,
        featured,
        totalViews,
      },
    });
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
});

export default router;

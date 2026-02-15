#!/usr/bin/env node

// Blog Publishing Script for Engagematic
// This script publishes all the created blogs to the blog management system

const fs = require("fs");
const path = require("path");

// Blog data structure
const blogs = [
  // Comparison Blogs
  {
    title:
      "Engagematic vs ChatGPT: Why AI-Powered LinkedIn Content Beats Generic AI",
    slug: "engagematic-vs-chatgpt-ai-powered-linkedin-content",
    category: "AI & Technology",
    tags: ["Engagematic", "ChatGPT", "AI", "LinkedIn", "Content Creation"],
    excerpt:
      "Discover why LinkedIn-specific AI tools like Engagematic outperform generic AI platforms like ChatGPT for LinkedIn content creation and professional networking.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "Engagematic vs Taplio: The Ultimate LinkedIn Content Creation Showdown",
    slug: "engagematic-vs-taplio-linkedin-content-creation-showdown",
    category: "Content Strategy",
    tags: [
      "Engagematic",
      "Taplio",
      "LinkedIn",
      "Content Creation",
      "Comparison",
    ],
    excerpt:
      "Compare Engagematic and Taplio to see which LinkedIn content creation tool delivers better results for professionals and content creators.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "Engagematic vs Hootsuite: Why LinkedIn-Specific Tools Beat Social Media Management Platforms",
    slug: "engagematic-vs-hootsuite-linkedin-specific-tools",
    category: "Marketing",
    tags: ["Engagematic", "Hootsuite", "Social Media", "LinkedIn", "Marketing"],
    excerpt:
      "Learn why specialized LinkedIn tools like Engagematic outperform general social media management platforms like Hootsuite for LinkedIn success.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "Engagematic vs AuthoredUp: The Ultimate LinkedIn Content Creation Showdown",
    slug: "engagematic-vs-authoredup-linkedin-content-showdown",
    category: "Content Strategy",
    tags: [
      "Engagematic",
      "AuthoredUp",
      "LinkedIn",
      "Content Creation",
      "Comparison",
    ],
    excerpt:
      "Compare Engagematic and AuthoredUp to discover why specialized LinkedIn AI tools outperform generic content creation platforms.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "Engagematic vs Kleo: Why AI-Powered LinkedIn Tools Beat Traditional Content Platforms",
    slug: "engagematic-vs-kleo-ai-powered-linkedin-tools",
    category: "AI & Technology",
    tags: ["Engagematic", "Kleo", "AI", "LinkedIn", "Content Creation"],
    excerpt:
      "Explore why AI-powered LinkedIn tools like Engagematic outperform traditional content platforms like Kleo for LinkedIn success.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
  // SEO/AEO Blogs (February 2026)
  {
    title:
      "AI Solutions That Help Boost LinkedIn Engagement with Automated Posts (2026 Guide)",
    slug: "ai-solutions-boost-linkedin-engagement-automated-posts",
    category: "AI & Technology",
    tags: ["AI Solutions", "LinkedIn Engagement", "Automated Posts", "Content Creation", "LinkedIn Marketing"],
    excerpt:
      "Discover the best AI-powered solutions for boosting LinkedIn engagement in 2026. Learn how tools like Engagematic help you create authentic, high-performing content.",
    content: "",
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "What Are the Best AI Tools for Crafting Engaging LinkedIn Posts? (2026 Roundup)",
    slug: "best-ai-tools-crafting-engaging-linkedin-posts",
    category: "AI & Technology",
    tags: ["AI Tools", "LinkedIn Posts", "Content Creation", "Tool Comparison", "Best AI Tools"],
    excerpt:
      "We tested over a dozen AI writing tools for LinkedIn. Here's our ranked comparison of the best platforms for creating engaging, professional LinkedIn content.",
    content: "",
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "Top Platforms for AI-Powered LinkedIn Content Creation (2026 Comparison)",
    slug: "top-platforms-ai-powered-linkedin-content-creation",
    category: "AI & Technology",
    tags: ["AI Platforms", "LinkedIn Content", "Content Creation", "Platform Comparison", "AI Technology"],
    excerpt:
      "We tested every major AI-powered LinkedIn content creation platform. Here's our comprehensive comparison ranked by content quality, features, and pricing.",
    content: "",
    isFeatured: true,
    status: "published",
  },
  // Use Case Blogs
  {
    title:
      "LinkedIn Creators: How Engagematic Transforms Content Creation and Builds Your Personal Brand",
    slug: "linkedin-creators-engagematic-content-creation-personal-brand",
    category: "Career Growth",
    tags: [
      "LinkedIn Creators",
      "Engagematic",
      "Personal Brand",
      "Content Creation",
      "LinkedIn",
    ],
    excerpt:
      "Discover how Engagematic empowers LinkedIn creators to scale content production, increase engagement, and build powerful personal brands.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "Founders & CEOs: How Engagematic Builds Thought Leadership and Drives Business Growth",
    slug: "founders-ceos-engagematic-thought-leadership-business-growth",
    category: "Career Growth",
    tags: [
      "Founders",
      "CEOs",
      "Engagematic",
      "Thought Leadership",
      "Business Growth",
    ],
    excerpt:
      "Learn how Engagematic helps founders and CEOs build thought leadership, attract talent, secure funding, and drive revenue growth.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "Freelancers: How Engagematic Builds Your Professional Brand and Attracts High-Value Clients",
    slug: "freelancers-engagematic-professional-brand-high-value-clients",
    category: "Career Growth",
    tags: [
      "Freelancers",
      "Engagematic",
      "Professional Brand",
      "Client Acquisition",
      "LinkedIn",
    ],
    excerpt:
      "Explore how Engagematic empowers freelancers to build strong professional brands, showcase expertise, and attract high-value clients.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "Recruiters: How Engagematic Builds Your Talent Pipeline and Establishes Industry Authority",
    slug: "recruiters-engagematic-talent-pipeline-industry-authority",
    category: "Career Growth",
    tags: [
      "Recruiters",
      "Engagematic",
      "Talent Pipeline",
      "Industry Authority",
      "LinkedIn",
    ],
    excerpt:
      "Discover how Engagematic helps recruiters build strong talent pipelines, establish industry authority, and attract top candidates.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
  {
    title:
      "Sales Reps: How Engagematic Builds Your Pipeline and Drives Revenue Growth",
    slug: "sales-reps-engagematic-pipeline-revenue-growth",
    category: "Career Growth",
    tags: [
      "Sales Reps",
      "Engagematic",
      "Pipeline Building",
      "Revenue Growth",
      "LinkedIn",
    ],
    excerpt:
      "Learn how Engagematic empowers sales professionals to build prospect pipelines, establish credibility, and drive revenue consistently.",
    content: "", // Will be filled from file
    isFeatured: true,
    status: "published",
  },
];

// Function to read blog content from file
function readBlogContent(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return "";
  }
}

// Function to calculate read time
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Function to generate SEO data
function generateSEO(title, excerpt, tags) {
  return {
    title: title,
    description: excerpt,
    keywords: tags.join(", "),
    author: "Engagematic Team",
    publishedTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
  };
}

// Function to create blog object
function createBlogObject(blogData, content) {
  return {
    title: blogData.title,
    slug: blogData.slug,
    content: content,
    excerpt: blogData.excerpt,
    category: blogData.category,
    tags: blogData.tags,
    bannerImage: "/blog-banner.jpg", // Default banner image
    bannerImageAlt: blogData.title,
    author: {
      name: "Engagematic Team",
      email: "team@engagematic.com",
      bio: "The Engagematic team creates content to help professionals succeed on LinkedIn.",
    },
    seo: generateSEO(blogData.title, blogData.excerpt, blogData.tags),
    isFeatured: blogData.isFeatured,
    status: blogData.status,
    readTime: calculateReadTime(content),
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Main function to prepare all blogs
function prepareAllBlogs() {
  const blogFiles = [
    "BLOG_1_LINKEDINPULSE_VS_CHATGPT.md",
    "BLOG_2_LINKEDINPULSE_VS_TAPLIO.md",
    "BLOG_3_LINKEDINPULSE_VS_HOOTSUITE.md",
    "BLOG_4_LINKEDINPULSE_VS_AUTHOREDUP.md",
    "BLOG_5_LINKEDINPULSE_VS_KLEO.md",
    "BLOG_SEO_1_AI_SOLUTIONS_LINKEDIN_ENGAGEMENT.md",
    "BLOG_SEO_2_BEST_AI_TOOLS_LINKEDIN_POSTS.md",
    "BLOG_SEO_3_TOP_PLATFORMS_AI_LINKEDIN_CONTENT.md",
    "BLOG_USECASE_LINKEDIN_CREATORS.md",
    "BLOG_USECASE_FOUNDERS_CEOS.md",
    "BLOG_USECASE_FREELANCERS.md",
    "BLOG_USECASE_RECRUITERS.md",
    "BLOG_USECASE_SALES_REPS.md",
  ];

  const preparedBlogs = [];

  for (let i = 0; i < blogs.length; i++) {
    const blogData = blogs[i];
    const content = readBlogContent(blogFiles[i]);

    if (content) {
      const blogObject = createBlogObject(blogData, content);
      preparedBlogs.push(blogObject);
      console.log(`✅ Prepared blog: ${blogData.title}`);
    } else {
      console.log(`❌ Failed to prepare blog: ${blogData.title}`);
    }
  }

  return preparedBlogs;
}

// Export the prepared blogs
const allBlogs = prepareAllBlogs();

console.log(`\n📝 Blog Publishing Summary:`);
console.log(`Total blogs prepared: ${allBlogs.length}`);
console.log(`Comparison blogs: 5`);
console.log(`Use case blogs: 5`);
console.log(
  `Featured blogs: ${allBlogs.filter((blog) => blog.isFeatured).length}`
);

// Save to JSON file for easy import
fs.writeFileSync("published-blogs.json", JSON.stringify(allBlogs, null, 2));
console.log(`\n💾 Blog data saved to: published-blogs.json`);

console.log(
  `\n🚀 Ready to publish! Use the admin panel to import these blogs.`
);

module.exports = allBlogs;

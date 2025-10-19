import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Clock, Search, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";

// Blog data structure
const blogPosts = [
  {
    id: 1,
    slug: "ultimate-linkedin-content-strategy-2025",
    title: "The Ultimate LinkedIn Content Strategy for 2025",
    summary: "Discover the proven framework that helped 10,000+ professionals 6x their LinkedIn engagement and build authentic professional relationships.",
    author: "Sarah Chen",
    publishDate: "2025-01-15",
    readTime: "8 min read",
    category: "Strategy",
    tags: ["LinkedIn", "Content Strategy", "Personal Branding", "Social Media"],
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop",
    featured: true
  },
  {
    id: 2,
    slug: "ai-content-creation-dos-donts",
    title: "AI Content Creation: The Do's and Don'ts for LinkedIn",
    summary: "Learn how to use AI tools effectively while maintaining authenticity and avoiding the pitfalls that make content sound robotic.",
    author: "Marcus Rodriguez",
    publishDate: "2025-01-12",
    readTime: "6 min read",
    category: "AI & Technology",
    tags: ["AI", "Content Creation", "LinkedIn", "Authenticity"],
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    featured: false
  }
];

const categories = [
  { name: "All", count: blogPosts.length },
  { name: "Strategy", count: blogPosts.filter(post => post.category === "Strategy").length },
  { name: "AI & Technology", count: blogPosts.filter(post => post.category === "AI & Technology").length }
];

const BlogsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);

  useEffect(() => {
    let filtered = blogPosts;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            LinkedInPulse{" "}
            <span className="gradient-pulse bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert insights, strategies, and tips to help you master LinkedIn and build your professional presence
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="gap-2"
              >
                {category.name}
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  {category.count}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden gradient-card shadow-card hover-lift group">
              <div className="relative">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                  {post.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.summary}
                </p>
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{post.readTime}</span>
                  </div>
                  <Link to={`/blogs/${post.slug}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
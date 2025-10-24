import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Clock, Search, ArrowRight, Tag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  views: number;
  createdAt: string;
  publishedAt?: string;
  bannerImage?: string;
  author: {
    name: string;
  };
  isFeatured: boolean;
}

const fallbackImage = "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop";

const BlogsPage = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([{ name: "All", count: 0 }]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    // Update categories when blogPosts change
    if (blogPosts.length > 0) {
      const uniqueCategories = Array.from(new Set(blogPosts.map(post => post.category)));
      const categoryCounts = [
        { name: "All", count: blogPosts.length },
        ...uniqueCategories.map(cat => ({
          name: cat,
          count: blogPosts.filter(post => post.category === cat).length
        }))
      ];
      setCategories(categoryCounts);
    }
  }, [blogPosts]);

  useEffect(() => {
    let filtered = blogPosts;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
      );
    }

    setFilteredPosts(filtered);
  }, [selectedCategory, searchQuery, blogPosts]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/blog/public`);
      
      if (response.ok) {
        const result = await response.json();
        setBlogPosts(result.data);
        setFilteredPosts(result.data);
      } else {
        toast.error("Failed to load blog posts");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post._id} className="overflow-hidden gradient-card shadow-card hover-lift group">
                <div className="relative">
                  <img
                    src={post.bannerImage || fallbackImage}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </div>
                  {post.isFeatured && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {post.author.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views}
                      </div>
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
        )}

        {/* No Results */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-4">
              {blogPosts.length === 0 
                ? "No blog posts have been published yet. Check back soon!"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {blogPosts.length > 0 && (
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
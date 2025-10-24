import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Send,
  FileText,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy: {
    username: string;
    email: string;
  };
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
  totalViews: number;
}

const BlogManagement = () => {
  const token = localStorage.getItem('adminToken');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (token) {
      fetchBlogs();
      fetchStats();
    }
  }, [token]);

  useEffect(() => {
    filterBlogs();
  }, [searchQuery, statusFilter, blogs]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const url = statusFilter === "all"
        ? "http://localhost:5000/api/blog/admin/all"
        : `http://localhost:5000/api/blog/admin/all?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setBlogs(result.data);
      } else {
        toast.error("Failed to fetch blogs");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/blog/admin/stats/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filterBlogs = () => {
    let filtered = blogs;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((blog) => blog.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.excerpt?.toLowerCase().includes(query) ||
          blog.category.toLowerCase().includes(query)
      );
    }

    setFilteredBlogs(filtered);
  };

  const handlePublish = async (blogId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blog/admin/${blogId}/publish`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Blog published successfully!");
        fetchBlogs();
        fetchStats();
      } else {
        toast.error("Failed to publish blog");
      }
    } catch (error) {
      console.error("Error publishing blog:", error);
      toast.error("Failed to publish blog");
    }
  };

  const handleUnpublish = async (blogId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blog/admin/${blogId}/unpublish`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Blog unpublished successfully!");
        fetchBlogs();
        fetchStats();
      } else {
        toast.error("Failed to unpublish blog");
      }
    } catch (error) {
      console.error("Error unpublishing blog:", error);
      toast.error("Failed to unpublish blog");
    }
  };

  const handleToggleFeatured = async (blogId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blog/admin/${blogId}/toggle-featured`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Featured status updated!");
        fetchBlogs();
        fetchStats();
      } else {
        toast.error("Failed to update featured status");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Failed to update featured status");
    }
  };

  const handleDelete = async (blogId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/blog/admin/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Blog deleted successfully!");
        fetchBlogs();
        fetchStats();
      } else {
        toast.error("Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage blog posts with SEO optimization
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBlog(null);
            setShowCreateModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Blog Post
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Blogs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <Send className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Edit className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold text-purple-600">{stats.featured}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search blogs by title, excerpt, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {["all", "published", "draft", "archived"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Blogs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="bg-muted/50">
                <th className="text-left p-4 font-semibold">Title</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Views</th>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Author</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    Loading blogs...
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    No blogs found. Create your first blog post!
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        {blog.isFeatured && (
                          <Star className="w-4 h-4 text-yellow-600 fill-yellow-600 mt-1 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold">{blog.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {blog.excerpt}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {blog.readTime} min read
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {blog.category}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={getStatusColor(blog.status)}>
                        {blog.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span>{blog.views}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{blog.createdBy.username}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(blog._id)}
                          title={blog.isFeatured ? "Unfeature" : "Feature"}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              blog.isFeatured
                                ? "fill-yellow-600 text-yellow-600"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>

                        {blog.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(blog._id)}
                            title="Publish"
                          >
                            <Send className="w-4 h-4 text-green-600" />
                          </Button>
                        )}

                        {blog.status === "published" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnpublish(blog._id)}
                            title="Unpublish"
                          >
                            <FileText className="w-4 h-4 text-yellow-600" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingBlog(blog);
                            setShowCreateModal(true);
                          }}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(blog._id, blog.title)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <BlogEditor
          blog={editingBlog}
          onClose={() => {
            setShowCreateModal(false);
            setEditingBlog(null);
          }}
          onSave={() => {
            fetchBlogs();
            fetchStats();
          }}
        />
      )}
      </div>
    </AdminLayout>
  );
};

export default BlogManagement;


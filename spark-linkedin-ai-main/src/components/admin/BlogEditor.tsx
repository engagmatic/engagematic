import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Save, Send, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}`;

interface BlogEditorProps {
  blog?: any;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = [
  "LinkedIn Tips",
  "Content Strategy",
  "AI & Technology",
  "Career Growth",
  "Marketing",
  "Productivity",
  "Updates",
  "Case Studies",
];

export function BlogEditor({ blog, onClose, onSave }: BlogEditorProps) {
  const { token } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "LinkedIn Tips",
    tags: "",
    bannerImage: "",
    bannerImageAlt: "",
    authorName: "LinkedInPulse Team",
    authorEmail: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    isFeatured: false,
    status: "draft" as "draft" | "published",
  });

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        category: blog.category || "LinkedIn Tips",
        tags: blog.tags?.join(", ") || "",
        bannerImage: blog.bannerImage || "",
        bannerImageAlt: blog.bannerImageAlt || "",
        authorName: blog.author?.name || "LinkedInPulse Team",
        authorEmail: blog.author?.email || "",
        metaTitle: blog.seo?.metaTitle || "",
        metaDescription: blog.seo?.metaDescription || "",
        keywords: blog.seo?.keywords?.join(", ") || "",
        isFeatured: blog.isFeatured || false,
        status: blog.status || "draft",
      });
    }
  }, [blog]);

  const handleSubmit = async (publishNow: boolean = false) => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        bannerImage: formData.bannerImage,
        bannerImageAlt: formData.bannerImageAlt,
        author: {
          name: formData.authorName,
          email: formData.authorEmail,
        },
        seo: {
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        },
        isFeatured: formData.isFeatured,
        status: publishNow ? "published" : formData.status,
      };

      const url = blog
        ? `${API_BASE}/blog/admin/${blog._id}`
        : `${API_BASE}/blog/admin/create`;

      const method = blog ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          blog
            ? "Blog updated successfully!"
            : publishNow
            ? "Blog published successfully!"
            : "Blog saved as draft!"
        );
        onSave();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save blog");
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <Card className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">
            {blog ? "Edit Blog Post" : "Create New Blog Post"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter blog title..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt (Optional)</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary (auto-generated if left empty)..."
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to auto-generate from content
              </p>
            </div>

            <div>
              <Label htmlFor="content">Content * (Markdown supported)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog content here... 

Markdown formatting:
# Heading 1
## Heading 2
### Heading 3

**bold text**
*italic text*

- List item 1
- List item 2"
                rows={15}
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="LinkedIn, Marketing, Tips"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Banner Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Banner Image
            </h3>

            <div>
              <Label htmlFor="bannerImage">Image URL</Label>
              <Input
                id="bannerImage"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bannerImageAlt">Image Alt Text</Label>
              <Input
                id="bannerImageAlt"
                value={formData.bannerImageAlt}
                onChange={(e) =>
                  setFormData({ ...formData, bannerImageAlt: e.target.value })
                }
                placeholder="Descriptive alt text for accessibility"
                className="mt-1"
              />
            </div>

            {formData.bannerImage && (
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={formData.bannerImage}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/800x400?text=Invalid+Image+URL";
                  }}
                />
              </div>
            )}
          </div>

          {/* Author Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Author Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData({ ...formData, authorName: e.target.value })
                  }
                  placeholder="LinkedInPulse Team"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="authorEmail">Author Email (Optional)</Label>
                <Input
                  id="authorEmail"
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, authorEmail: e.target.value })
                  }
                  placeholder="team@linkedinpulse.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SEO Settings (Optional)</h3>

            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Auto-generated from title if empty"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max 60 characters for best SEO
              </p>
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                placeholder="Auto-generated from excerpt if empty"
                rows={2}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max 160 characters for best SEO
              </p>
            </div>

            <div>
              <Label htmlFor="keywords">SEO Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="LinkedIn, content strategy, AI"
                className="mt-1"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Options</h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Feature this blog post
              </Label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>

            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {blog?.status === "published" ? "Update & Publish" : "Publish Now"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}


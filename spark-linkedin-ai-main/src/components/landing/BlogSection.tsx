import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishDate: string;
  banner: string;
  slug: string;
}

const featuredBlogs: BlogPost[] = [
  {
    id: "linkedinpulse-vs-chatgpt",
    title: "Engagematic vs ChatGPT: Why Engagematic Wins for Professional Content",
    excerpt: "Discover why Engagematic outperforms ChatGPT for LinkedIn content creation with specialized AI, industry expertise, and professional optimization.",
    category: "comparison",
    readTime: "8 min read",
    publishDate: "1/15/2025",
    banner: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center",
    slug: "linkedinpulse-vs-chatgpt"
  },
  {
    id: "linkedinpulse-vs-taplio",
    title: "Engagematic vs Taplio: The Ultimate LinkedIn Content Tool Comparison",
    excerpt: "Compare Engagematic and Taplio side-by-side. See why Engagematic offers better AI, more features, and superior value for LinkedIn creators.",
    category: "comparison",
    readTime: "7 min read",
    publishDate: "1/15/2025",
    banner: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center",
    slug: "linkedinpulse-vs-taplio"
  },
  {
    id: "linkedinpulse-vs-hootsuite",
    title: "Engagematic vs Hootsuite: AI Content Creation vs Social Media Management",
    excerpt: "Learn why Engagematic's AI-powered content creation beats Hootsuite's generic scheduling tools for LinkedIn success.",
    category: "comparison",
    readTime: "6 min read",
    publishDate: "1/15/2025",
    banner: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center",
    slug: "linkedinpulse-vs-hootsuite"
  }
];

export const BlogSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <ArrowUpDown className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Expert{" "}
              <span className="text-gradient-premium-world-class">
                Insights
              </span>
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn why Engagematic outperforms other tools and discover strategies for LinkedIn success
          </p>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredBlogs.map((blog) => (
            <Card key={blog.id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-primary/20 bg-white/80 backdrop-blur-sm">
              {/* Banner Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={blog.banner}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg">
                    <ArrowUpDown className="h-3 w-3" />
                    Comparison
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {blog.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{blog.publishDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                {/* Read More Button */}
                <Button 
                  asChild
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  variant="outline"
                >
                  <Link to={`/blogs/${blog.slug}`}>
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link to="/blogs">
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

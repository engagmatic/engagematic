import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sampleComments = [
  "This resonates so much! I've experienced the exact same journey. The moment you shift from perfection to authenticity, everything changes. Thanks for sharing this insight!",
  "Incredibly valuable perspective. Your point about consistency over perfection is something I needed to hear today. Saving this for future reference!",
  "Love this! The authenticity piece is so underrated. People connect with real stories, not polished corporate speak. Keep sharing these gems!",
  "Powerful reminder! I've been stuck in analysis paralysis myself. Time to embrace the imperfect and just start. Appreciate you sharing your experience.",
];

const CommentGenerator = () => {
  const [postContent, setPostContent] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Comment copied! 💬",
      description: "Ready to build real connections on LinkedIn",
    });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Comment{" "}
            <span className="gradient-pulse bg-clip-text text-transparent">Generator</span>
          </h1>
          <p className="text-muted-foreground">
            Create genuine, human comments that build real relationships
          </p>
        </div>

        <Card className="p-6 mb-6 gradient-card shadow-card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Paste the LinkedIn post you want to comment on
              </label>
              <Textarea
                placeholder="Paste the post content here..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <Button size="lg" className="w-full shadow-pulse hover-pulse">
              <Heart className="mr-2 h-5 w-5" />
              Make It Human
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Generated Comments</h2>
          <p className="text-muted-foreground text-sm">
            Choose from these authentic, thoughtful responses
          </p>

          {sampleComments.map((comment, index) => (
            <Card key={index} className="p-6 gradient-card shadow-card hover-lift group">
              <div className="flex items-start justify-between gap-4">
                <p className="text-muted-foreground flex-1">{comment}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(comment, index)}
                  className="gap-2 flex-shrink-0"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentGenerator;

import { useState, useCallback } from "react";
import { SEO } from "@/components/SEO";
import { SITE_URL, generateBreadcrumbSchema } from "@/constants/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Type,
  Copy,
  Monitor,
  Smartphone,
  ExternalLink,
  Check,
  Sparkles,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  applyStyle,
  type StyleId,
} from "@/utils/unicodeTextStyles";

// ---------------------------------------------------------------------------
// Style config for grid
// ---------------------------------------------------------------------------

const STYLE_ENTRIES: { id: StyleId; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "bold", label: "Bold" },
  { id: "boldSans", label: "Bold Sans" },
  { id: "italic", label: "Italic" },
  { id: "italicSans", label: "Italic Sans" },
  { id: "boldItalic", label: "Bold Italic" },
  { id: "boldItalicSans", label: "Bold Italic Sans" },
  { id: "sans", label: "Sans" },
  { id: "underline", label: "Underline" },
  { id: "strikethrough", label: "Strikethrough" },
  { id: "boldUnderline", label: "Bold Underline" },
  { id: "boldStrikethrough", label: "Bold Strikethrough" },
  { id: "script", label: "Script" },
  { id: "doublestruck", label: "Doublestruck" },
  { id: "fullwidth", label: "Fullwidth" },
  { id: "uppercase", label: "Uppercase" },
  { id: "lowercase", label: "Lowercase" },
  { id: "numberedList", label: "Numbered List" },
  { id: "bulletPoints", label: "Bullet Points" },
  { id: "checklist", label: "Checklist" },
  { id: "ascendingList", label: "Ascending List" },
  { id: "descendingList", label: "Descending List" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LinkedInTextFormatterPage() {
  const [input, setInput] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const previewContent = input.trim()
    ? input
    : "Start writing and your post will appear here..\n\nYou can add images, links, #hashtags and emojis 🤩";

  const handleCopy = useCallback(
    (styleId: string, text: string) => {
      if (!text) {
        toast({ title: "Nothing to copy", variant: "destructive" });
        return;
      }
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(styleId);
        toast({ title: "Copied to clipboard" });
        setTimeout(() => setCopiedId(null), 2000);
      });
    },
    [toast]
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Free Tools", url: `${SITE_URL}/tools` },
    {
      name: "LinkedIn Text Formatter",
      url: `${SITE_URL}/tools/linkedin-text-formatter`,
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <SEO
        title="LinkedIn Text Formatter (Free) – Bold, Italic & More for Posts"
        description="Format LinkedIn post text with bold, italic, underlined, strikethrough and more for free. Unicode-based styles work in LinkedIn. No login required."
        keywords="linkedin text formatter, linkedin bold text, linkedin italic, format linkedin post, linkedin post formatter, free linkedin formatter, linkedin unicode text"
        url={`${SITE_URL}/tools/linkedin-text-formatter`}
        structuredData={[breadcrumbSchema]}
      />

      {/* Hero */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <Badge className="mb-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                <Type className="w-3 h-3 mr-1" />
                100% Free · No login required
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                LinkedIn Text Formatter
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-xl">
                Easily format your LinkedIn post with bold, italic, underlined,
                strikethrough and more. Copy formatted text and paste into
                LinkedIn—no native formatting needed.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-normal">
                  For creators & marketers
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  Works in posts & messages
                </Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-border/50">
              <Type className="w-16 h-16 text-primary/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Main tool: two panels */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 max-w-6xl">
        <Card className="border-2 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left: Editor */}
            <div className="p-6 flex flex-col">
              <Label htmlFor="formatter-input" className="text-sm font-semibold mb-2">
                Your text
              </Label>
              <Textarea
                id="formatter-input"
                placeholder="Write here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[220px] resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Line breaks become separate lines in list styles (numbered, bullets, checklist).
              </p>
            </div>

            {/* Right: LinkedIn-style preview */}
            <div className="p-6 flex flex-col bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Post Preview</span>
                <div className="flex rounded-lg border border-border bg-background p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`p-1.5 rounded ${previewMode === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="Desktop view"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`p-1.5 rounded ${previewMode === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="Mobile view"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div
                className={`rounded-xl border border-border bg-background p-4 transition-all ${previewMode === "mobile" ? "max-w-[340px]" : ""}`}
              >
                {/* Fake LinkedIn post */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm">Your Name</div>
                    <div className="text-xs text-muted-foreground">
                      Your headline · 12h
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-foreground whitespace-pre-wrap break-words">
                  {previewContent}
                </div>
                {input.trim().length > 180 && (
                  <>
                    <span className="text-muted-foreground"> </span>
                    <span className="text-primary cursor-pointer">...more</span>
                  </>
                )}
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-muted-foreground text-xs">
                  <span>57</span>
                  <span>Like</span>
                  <span>Comment</span>
                  <span>Repost</span>
                  <span>Send</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Format styles grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 max-w-6xl">
        <h2 className="text-2xl font-bold mb-2">Formatted output</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Choose a style and copy the result into your LinkedIn post or message.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STYLE_ENTRIES.map(({ id, label }) => {
            const value = applyStyle(input, id);
            const isCopied = copiedId === id;
            return (
              <Card key={id} className="overflow-hidden border hover:border-primary/30 transition-colors">
                <CardHeader className="py-3 pb-1">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="rounded-md border bg-muted/30 px-3 py-2 min-h-[44px] text-sm break-all font-mono">
                    {value || "—"}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleCopy(id, value)}
                    disabled={!value.trim()}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {isCopied ? "Copied" : "Copy text"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How to use + FAQ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">How to use the LinkedIn Text Formatter</h2>
        <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
          <li>
            <strong className="text-foreground">Enter or paste your content</strong> — Type or paste into the input field.
          </li>
          <li>
            <strong className="text-foreground">Pick a style</strong> — Use one of the formats (e.g. Bold, Italic) for the whole text, or copy different styles for different parts.
          </li>
          <li>
            <strong className="text-foreground">Copy and paste on LinkedIn</strong> — Copy the formatted text and paste it into your LinkedIn post or message.
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-12 mb-4">Why format text on LinkedIn?</h2>
        <p className="text-muted-foreground">
          LinkedIn doesn’t support native bold or italic. This tool uses Unicode symbols that look bold, italic, or styled so your posts stand out and are easier to scan. Formatted text may not be searchable and can display differently on some devices.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/tools">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View All Free Tools
            </Button>
          </Link>
          <Link to="/tools/linkedin-engagement-rate-calculator">
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Engagement Rate Calculator
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

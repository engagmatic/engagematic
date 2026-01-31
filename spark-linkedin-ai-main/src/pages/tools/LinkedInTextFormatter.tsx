import { useState, useCallback, useRef, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { PAGE_SEO, SITE_URL, generateBreadcrumbSchema } from "@/constants/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Type,
  Copy,
  Monitor,
  Smartphone,
  Check,
  Sparkles,
  FileText,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Smile,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Eraser,
  List,
  ListOrdered,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  applyStyle,
  toBold,
  toItalic,
  toUnderline,
  toStrikethrough,
  toBulletPoints,
  toNumberedList,
  stripCombiningChars,
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

const EMOJI_LIST = ["👍", "👏", "🔥", "💡", "✨", "🚀", "💼", "📈", "✅", "❤️", "🙌", "💬", "📌", "🎯", "🤝", "⭐", "📢", "💪", "😊", "📝"];

const MAX_HISTORY = 50;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LinkedInTextFormatterPage() {
  const [input, setInput] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const lastPushedRef = useRef<string>("");
  const { toast } = useToast();

  const pushHistory = useCallback((value: string) => {
    const arr = historyRef.current;
    const idx = historyIndexRef.current;
    const trimmed = arr.slice(0, idx + 1);
    trimmed.push(value);
    if (trimmed.length > MAX_HISTORY) trimmed.shift();
    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
  }, []);

  const undo = useCallback(() => {
    const arr = historyRef.current;
    let idx = historyIndexRef.current;
    if (idx <= 0) return;
    idx -= 1;
    historyIndexRef.current = idx;
    const prev = arr[idx];
    setInput(prev);
    toast({ title: "Undo" });
  }, [toast]);

  const redo = useCallback(() => {
    const arr = historyRef.current;
    let idx = historyIndexRef.current;
    if (idx >= arr.length - 1) return;
    idx += 1;
    historyIndexRef.current = idx;
    const next = arr[idx];
    setInput(next);
    toast({ title: "Redo" });
  }, [toast]);

  const canUndo = historyRef.current.length > 0 && historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const getSelection = useCallback((): { start: number; end: number; text: string } => {
    const el = textareaRef.current;
    if (!el) return { start: 0, end: input.length, text: input };
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = start !== end ? input.slice(start, end) : input;
    return { start, end, text };
  }, [input]);

  const replaceSelection = useCallback((newText: string, newCursorStart?: number, newCursorEnd?: number) => {
    const el = textareaRef.current;
    const { start, end } = getSelection();
    const before = input.slice(0, start);
    const after = input.slice(end);
    const next = before + newText + after;
    pushHistory(input);
    setInput(next);
    requestAnimationFrame(() => {
      if (el) {
        const s = newCursorStart ?? before.length + newText.length;
        const e = newCursorEnd ?? s;
        el.focus();
        el.setSelectionRange(s, e);
      }
    });
  }, [input, getSelection, pushHistory]);

  const applyToSelection = useCallback((fn: (t: string) => string) => {
    const { start, end, text } = getSelection();
    if (!text.trim()) {
      toast({ title: "Select some text first", variant: "destructive" });
      return;
    }
    replaceSelection(fn(text));
  }, [getSelection, replaceSelection, toast]);

  const insertAtCursor = useCallback((insert: string) => {
    const el = textareaRef.current;
    const start = el ? el.selectionStart : input.length;
    const before = input.slice(0, start);
    const after = input.slice(el ? el.selectionEnd : input.length);
    const next = before + insert + after;
    pushHistory(input);
    setInput(next);
    requestAnimationFrame(() => {
      if (el) {
        const pos = start + insert.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  }, [input, pushHistory]);

  const handleClearFormat = useCallback(() => {
    const { start, end, text } = getSelection();
    if (start === end && input.length === 0) return;
    const toClear = start !== end ? text : input;
    const cleared = stripCombiningChars(toClear);
    if (toClear === input) {
      pushHistory(input);
      setInput(cleared);
      toast({ title: "Formatting cleared" });
    } else {
      replaceSelection(cleared);
      toast({ title: "Formatting cleared from selection" });
    }
  }, [input, getSelection, pushHistory, replaceSelection, toast]);

  const handleEmojiSelect = (emoji: string) => {
    insertAtCursor(emoji);
  };

  const handleLinkInsert = () => {
    const url = window.prompt("Enter URL:");
    if (url) insertAtCursor(url.startsWith("http") ? url : `https://${url}`);
  };

  useEffect(() => {
    if (historyRef.current.length === 0) {
      historyRef.current = [input];
      historyIndexRef.current = 0;
      lastPushedRef.current = input;
    }
  }, []);

  // Debounced history push when user types (so undo works after typing)
  useEffect(() => {
    if (input === lastPushedRef.current) return;
    const t = setTimeout(() => {
      pushHistory(input);
      lastPushedRef.current = input;
    }, 800);
    return () => clearTimeout(t);
  }, [input, pushHistory]);

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

  const ToolbarButton = ({
    onClick,
    disabled,
    title,
    children,
    active,
  }: {
    onClick: () => void;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-2 rounded-md transition-colors hover:bg-muted ${active ? "bg-muted" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <SEO
        title={PAGE_SEO.linkedinTextFormatter.title}
        description={PAGE_SEO.linkedinTextFormatter.description}
        keywords={PAGE_SEO.linkedinTextFormatter.keywords}
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
                strikethrough and more. Use the toolbar or pick a style below—copy and paste into LinkedIn.
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

      {/* Main tool: toolbar + two panels */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 max-w-6xl">
        <Card className="border-2 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left: Toolbar + Editor */}
            <div className="p-6 flex flex-col">
              <Label className="text-sm font-semibold mb-2">Your text</Label>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-0.5 p-1.5 rounded-t-lg border border-b-0 border-border bg-muted/50">
                <div className="flex items-center gap-0.5 border-r border-border pr-1.5 mr-1.5">
                  <ToolbarButton title="Bold" onClick={() => applyToSelection(toBold)}>
                    <Bold className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Italic" onClick={() => applyToSelection(toItalic)}>
                    <Italic className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Underline" onClick={() => applyToSelection(toUnderline)}>
                    <UnderlineIcon className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Strikethrough" onClick={() => applyToSelection(toStrikethrough)}>
                    <Strikethrough className="h-4 w-4" />
                  </ToolbarButton>
                </div>
                <div className="flex items-center gap-0.5 border-r border-border pr-1.5 mr-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        title="Insert emoji"
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      <div className="grid grid-cols-5 gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="p-2 text-xl rounded hover:bg-muted transition-colors"
                            onClick={() => handleEmojiSelect(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <ToolbarButton title="Insert link" onClick={handleLinkInsert}>
                    <LinkIcon className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Insert image placeholder" onClick={() => insertAtCursor("[Image]")}>
                    <ImageIcon className="h-4 w-4" />
                  </ToolbarButton>
                </div>
                <div className="flex items-center gap-0.5 border-r border-border pr-1.5 mr-1.5">
                  <ToolbarButton title="Undo" onClick={undo}>
                    <Undo2 className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Redo" onClick={redo}>
                    <Redo2 className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Clear formatting" onClick={handleClearFormat}>
                    <Eraser className="h-4 w-4" />
                  </ToolbarButton>
                </div>
                <div className="flex items-center gap-0.5">
                  <ToolbarButton title="Bullet list" onClick={() => applyToSelection(toBulletPoints)}>
                    <List className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton title="Numbered list" onClick={() => applyToSelection(toNumberedList)}>
                    <ListOrdered className="h-4 w-4" />
                  </ToolbarButton>
                </div>
              </div>
              <Textarea
                ref={textareaRef}
                id="formatter-input"
                placeholder="Write here..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                onBlur={() => {
                  if (input !== lastPushedRef.current) {
                    pushHistory(input);
                    lastPushedRef.current = input;
                  }
                }}
                className="min-h-[220px] resize-none font-mono text-sm rounded-t-none border-t-0"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Select text and use the toolbar to apply bold, italic, lists, or paste a style from below.
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

      {/* How to use */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">How to use the LinkedIn Text Formatter</h2>
        <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
          <li>
            <strong className="text-foreground">Type or paste</strong> — Use the editor. Select text and use the toolbar (Bold, Italic, lists, emoji, link) or pick a full-style below.
          </li>
          <li>
            <strong className="text-foreground">Copy and paste on LinkedIn</strong> — Copy the formatted text and paste it into your LinkedIn post or message.
          </li>
        </ol>

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

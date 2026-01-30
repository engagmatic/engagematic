import { useState, useCallback, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { SITE_URL, generateBreadcrumbSchema } from "@/constants/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  BarChart3,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  ExternalLink,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

type ChannelType = "organic" | "sponsored" | "company";

type CalculatorState = {
  engagements: string;
  impressions: string;
  engagementRate: string;
  lastEdited: ("engagements" | "impressions" | "engagementRate")[];
  channel: ChannelType;
};

type PostScoreState = {
  content: string;
  score: number | null;
  label: "low" | "medium" | "high" | null;
  suggestions: string[];
};

const BENCHMARKS: Record<
  ChannelType,
  { low: number; high: number; label: string }
> = {
  organic: { low: 2.0, high: 3.0, label: "Organic Posts" },
  sponsored: { low: 0.8, high: 1.5, label: "Sponsored Content" },
  company: { low: 1.0, high: 2.0, label: "Company Pages" },
};

const CHANNEL_OPTIONS: { value: ChannelType; label: string }[] = [
  { value: "organic", label: "Organic Posts" },
  { value: "sponsored", label: "Sponsored Content" },
  { value: "company", label: "Company Pages" },
];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function calculateRate(engagements: number, impressions: number): number {
  if (!impressions) return 0;
  return (engagements / impressions) * 100;
}

function calculateEngagements(rate: number, impressions: number): number {
  return (rate * impressions) / 100;
}

function calculateImpressions(engagements: number, rate: number): number {
  if (!rate) return 0;
  return engagements / (rate / 100);
}

function formatNumberShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function parseSafe(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// ---------------------------------------------------------------------------
// Post score (deterministic)
// ---------------------------------------------------------------------------

const BUZZWORDS = ["synergy", "unlock", "leverage", "maximize", "game-changing"];
const CTA_PHRASES = [
  "comment",
  "save this",
  "dm me",
  "send me a dm",
  "share this",
  "bookmark",
];
const STRONG_HOOK_STARTS = ["how", "why", "what", "did", "are", "most", "stop"];

function scorePost(content: string): {
  score: number;
  label: "low" | "medium" | "high";
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 0;
  const text = content.trim();
  const lines = text.split(/\n/).filter((l) => l.trim());
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const firstLine = (lines[0] || "").toLowerCase();

  // Length (max 20)
  if (wordCount >= 80 && wordCount <= 250) score += 20;
  else if ((wordCount >= 40 && wordCount < 80) || (wordCount > 250 && wordCount <= 400))
    score += 15;
  else score += 10;

  // Hook (max 25)
  const hasStrongHook =
    STRONG_HOOK_STARTS.some((s) => firstLine.startsWith(s)) ||
    /^\d+[.)]/.test(firstLine) ||
    /^[A-Za-z]{4,}\s/.test(firstLine);
  if (hasStrongHook) score += 25;
  else {
    score += 10;
    suggestions.push(
      "Write a stronger first line that makes people curious or feel seen."
    );
  }

  // Structure (max 15)
  if (lines.length >= 3) score += 15;
  else {
    score += 5;
    suggestions.push(
      "Break your post into shorter paragraphs for easier reading."
    );
  }

  // CTA (max 20)
  const hasCTA = CTA_PHRASES.some((p) => text.toLowerCase().includes(p));
  if (hasCTA) score += 20;
  else {
    score += 5;
    suggestions.push(
      "Add a clear call-to-action (e.g. ask for a comment, save, or DM)."
    );
  }

  // Clarity: buzzwords penalty
  const buzzwordCount = BUZZWORDS.filter((b) =>
    text.toLowerCase().includes(b)
  ).length;
  if (buzzwordCount >= 3) {
    score -= 10;
    suggestions.push(
      "Replace vague buzzwords with simple, specific language."
    );
  }

  // Reward "you" focus
  const youCount = (text.match(/\byou\b/gi) || []).length;
  if (youCount >= 3) score += 10;

  const finalScore = Math.max(0, Math.min(100, score));

  if (wordCount < 60 && !suggestions.some((s) => s.includes("one more example")))
    suggestions.push(
      "Add one more example or detail to make the post more concrete."
    );

  const label: "low" | "medium" | "high" =
    finalScore >= 80 ? "high" : finalScore >= 50 ? "medium" : "low";

  return {
    score: finalScore,
    label,
    suggestions: suggestions.slice(0, 3),
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function LinkedinEngagementToolsPage() {
  const [calcState, setCalcState] = useState<CalculatorState>({
    engagements: "",
    impressions: "",
    engagementRate: "",
    lastEdited: [],
    channel: "organic",
  });

  const [scoreState, setScoreState] = useState<PostScoreState>({
    content: "",
    score: null,
    label: null,
    suggestions: [],
  });

  const [resultKey, setResultKey] = useState(0);

  // Calculator: derive third value when two are set
  const updateCalculator = useCallback(
    (field: keyof Pick<CalculatorState, "engagements" | "impressions" | "engagementRate">, value: string) => {
      setCalcState((prev) => {
        const next = { ...prev };
        if (field === "engagements") next.engagements = value;
        if (field === "impressions") next.impressions = value;
        if (field === "engagementRate") next.engagementRate = value;

        const lastEdited = [...prev.lastEdited.filter((f) => f !== field), field].slice(-2);
        next.lastEdited = lastEdited;

        const e = parseSafe(next.engagements);
        const i = parseSafe(next.impressions);
        const r = parseSafe(next.engagementRate);

        const impressions = Math.min(i, 1_000_000_000);
        const rate = Math.max(0, Math.min(100, r));

        const filled = [next.engagements.trim(), next.impressions.trim(), next.engagementRate.trim()].filter(Boolean).length;
        if (filled === 2) {
          if (next.engagements.trim() && next.impressions.trim()) {
            next.engagementRate = calculateRate(e, impressions).toFixed(2);
          } else if (next.engagements.trim() && next.engagementRate.trim()) {
            next.impressions = Math.round(calculateImpressions(e, rate)).toString();
          } else if (next.impressions.trim() && next.engagementRate.trim()) {
            next.engagements = Math.round(calculateEngagements(rate, impressions)).toString();
          }
        }

        return next;
      });
    },
    []
  );

  useEffect(() => {
    setResultKey((k) => k + 1);
  }, [calcState.engagementRate, calcState.engagements, calcState.impressions]);

  const handleReset = () => {
    setCalcState({
      engagements: "",
      impressions: "",
      engagementRate: "",
      lastEdited: [],
      channel: "organic",
    });
    setResultKey((k) => k + 1);
  };

  const engagementsNum = parseSafe(calcState.engagements);
  const impressionsNum = parseSafe(calcState.impressions);
  const rateNum = parseSafe(calcState.engagementRate);
  const bench = BENCHMARKS[calcState.channel];
  const avgBench = (bench.low + bench.high) / 2;
  const diffPercent =
    rateNum && avgBench ? ((rateNum - avgBench) / avgBench) * 100 : 0;
  let category: "Below Average" | "Average" | "Above Average" = "Average";
  if (rateNum < bench.low) category = "Below Average";
  else if (rateNum > bench.high) category = "Above Average";

  const handleAnalyzePost = () => {
    const result = scorePost(scoreState.content);
    setScoreState((prev) => ({
      ...prev,
      score: result.score,
      label: result.label,
      suggestions: result.suggestions,
    }));
  };

  const handleClearPost = () => {
    setScoreState({
      content: "",
      score: null,
      label: null,
      suggestions: [],
    });
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Free Tools", url: `${SITE_URL}/tools` },
    {
      name: "LinkedIn Engagement Rate Calculator",
      url: `${SITE_URL}/tools/linkedin-engagement-rate-calculator`,
    },
  ]);

  const hasCalcResult =
    calcState.engagements.trim() &&
    calcState.impressions.trim() &&
    calcState.engagementRate.trim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <SEO
        title="LinkedIn Engagement Rate Calculator (Free) – Measure & Improve Your Posts"
        description="Free LinkedIn engagement rate calculator and post engagement score tool for creators and marketers. Enter impressions and engagements to get your rate, benchmarks, and actionable tips."
        keywords="linkedin engagement rate calculator, linkedin engagement rate, linkedin post engagement, free linkedin analytics, linkedin metrics, linkedin engagement calculator"
        url={`${SITE_URL}/tools/linkedin-engagement-rate-calculator`}
        structuredData={[breadcrumbSchema]}
      />

      {/* Hero */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <Badge className="mb-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                <BarChart3 className="w-3 h-3 mr-1" />
                100% Free · No login required
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                LinkedIn Engagement Rate Calculator
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-xl">
                Measure your LinkedIn engagement rate instantly, compare to
                benchmarks, and improve your post performance.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-normal">
                  For creators & founders
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  No login required
                </Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-border/50">
              <BarChart3 className="w-16 h-16 text-primary/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 max-w-5xl">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="h-4 w-4" />
              Engagement Rate Calculator
            </TabsTrigger>
            <TabsTrigger value="score" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Post Engagement Score
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <Card className="border-2 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  LinkedIn Engagement Rate Calculator
                </CardTitle>
                <CardDescription>
                  Enter any two values below and we'll calculate the third
                  instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="engagements">Engagements</Label>
                    <Input
                      id="engagements"
                      type="text"
                      placeholder="e.g. 500"
                      value={calcState.engagements}
                      onChange={(e) =>
                        updateCalculator("engagements", e.target.value)
                      }
                      className="transition-all hover:border-primary/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Clicks, comments, reactions, shares, and follows.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="impressions">Impressions</Label>
                    <Input
                      id="impressions"
                      type="text"
                      placeholder="e.g. 18,000"
                      value={calcState.impressions}
                      onChange={(e) =>
                        updateCalculator("impressions", e.target.value)
                      }
                      className="transition-all hover:border-primary/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Times your content was displayed (50%+ visible for 300ms+).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Engagement Rate (%)</Label>
                    <div className="relative">
                      <Input
                        id="rate"
                        type="text"
                        placeholder="e.g. 2.8"
                        value={calcState.engagementRate}
                        onChange={(e) =>
                          updateCalculator("engagementRate", e.target.value)
                        }
                        className="pr-8 transition-all hover:border-primary/30"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Channel type</Label>
                  <Select
                    value={calcState.channel}
                    onValueChange={(v: ChannelType) =>
                      setCalcState((prev) => ({ ...prev, channel: v }))
                    }
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Link to="/#pricing">
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                      <Info className="h-3 w-3" />
                      What's a good engagement rate?
                    </Button>
                  </Link>
                </div>

                {hasCalcResult && (
                  <Card
                    key={resultKey}
                    className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0 overflow-hidden animate-in fade-in-50 duration-300"
                  >
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium uppercase tracking-wider opacity-90">
                            Engagement Rate
                          </p>
                          <p className="text-4xl sm:text-5xl font-bold mt-1">
                            {parseFloat(calcState.engagementRate).toFixed(2)}%
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            {category === "Above Average" && (
                              <CheckCircle2 className="h-4 w-4 text-green-300" />
                            )}
                            {category === "Average" && (
                              <AlertCircle className="h-4 w-4 text-amber-300" />
                            )}
                            {category === "Below Average" && (
                              <AlertCircle className="h-4 w-4 text-rose-300" />
                            )}
                            <Badge
                              variant="secondary"
                              className={
                                category === "Above Average"
                                  ? "bg-green-500/20 text-green-100 border-green-400/30"
                                  : category === "Average"
                                  ? "bg-amber-500/20 text-amber-100 border-amber-400/30"
                                  : "bg-rose-500/20 text-rose-100 border-rose-400/30"
                              }
                            >
                              {category}
                            </Badge>
                            <span className="text-sm opacity-90">
                              vs {avgBench.toFixed(2)}% benchmark
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs uppercase opacity-80">
                              Engagements
                            </p>
                            <p className="font-semibold">
                              {formatNumberShort(engagementsNum)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs uppercase opacity-80">
                              Impressions
                            </p>
                            <p className="font-semibold">
                              {formatNumberShort(impressionsNum)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs uppercase opacity-80">
                              Channel
                            </p>
                            <p className="font-semibold">{bench.label}</p>
                          </div>
                          <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs uppercase opacity-80">
                              Vs Benchmark
                            </p>
                            <p className="font-semibold">
                              {diffPercent >= 0 ? "+" : ""}
                              {diffPercent.toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="score" className="space-y-6">
            <Card className="border-2 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  LinkedIn Post Engagement Score
                </CardTitle>
                <CardDescription>
                  Paste your LinkedIn post and see how likely it is to generate
                  comments and conversations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="post-content">Paste your LinkedIn post</Label>
                  <Textarea
                    id="post-content"
                    placeholder="Paste your draft or published LinkedIn post here…"
                    value={scoreState.content}
                    onChange={(e) =>
                      setScoreState((prev) => ({ ...prev, content: e.target.value }))
                    }
                    className="min-h-[160px] transition-all hover:border-primary/30"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAnalyzePost}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Zap className="h-4 w-4" />
                    Analyze Post
                  </Button>
                  <Button variant="ghost" onClick={handleClearPost} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </div>

                {scoreState.score !== null && (
                  <Card className="animate-in fade-in-50 duration-300 border-2 bg-muted/30">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-3xl font-bold">
                          Score: {scoreState.score} / 100
                        </span>
                        <Badge
                          className={
                            scoreState.label === "high"
                              ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
                              : scoreState.label === "medium"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                          }
                        >
                          {scoreState.label === "high"
                            ? "High Engagement Potential"
                            : scoreState.label === "medium"
                            ? "Moderate Engagement Potential"
                            : "Needs Work"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        {scoreState.label === "high"
                          ? "This post has a strong chance of generating engagement. Make it even better by tweaking the points below."
                          : scoreState.label === "medium"
                          ? "Solid foundation. Apply the suggestions below to boost engagement."
                          : "Use the suggestions below to improve engagement potential."}
                      </p>
                      {scoreState.suggestions.length > 0 && (
                        <ul className="space-y-2">
                          {scoreState.suggestions.map((s, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Have a whole month of posts? Plan 30 hooks with our free
                      Content Planner and attach smart comments with Engagematic.
                    </p>
                    <Link to="/content-planner">
                      <Button size="sm" className="gap-2 whitespace-nowrap">
                        Open Content Planner
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-16 space-y-10 text-muted-foreground">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              How to calculate your LinkedIn engagement rate
            </h2>
            <p className="max-w-3xl">
              Engagement rate = (Total engagements ÷ Impressions) × 100.
              Engagements include likes, comments, shares, clicks, and follows.
              Impressions are how many times your content was shown. Use the
              calculator above with any two values to get the third.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              LinkedIn engagement benchmarks
            </h2>
            <p className="max-w-3xl mb-4">
              Benchmarks vary by content type. Organic posts typically see 2–3%,
              sponsored content 0.8–1.5%, and company pages 1–2%. Compare your
              rate to the benchmark for your channel above.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Organic posts: 2.0% – 3.0% (average)</li>
              <li>Sponsored content: 0.8% – 1.5%</li>
              <li>Company pages: 1.0% – 2.0%</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Free LinkedIn post engagement score checker
            </h2>
            <p className="max-w-3xl">
              Our post score uses length, hook strength, structure, and CTA
              presence to estimate engagement potential. Use it to refine drafts
              before publishing. For full AI-powered posts and a content calendar,
              try our{" "}
              <Link to="/content-planner" className="text-primary hover:underline">
                Content Planner
              </Link>{" "}
              and{" "}
              <Link to="/" className="text-primary hover:underline">
                Engagematic
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
          <Link to="/tools">
            <Button variant="outline" className="gap-2">
              View All Free Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

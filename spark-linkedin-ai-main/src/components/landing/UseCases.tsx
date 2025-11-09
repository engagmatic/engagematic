import { useState } from "react";
import { ArrowUpRight, Briefcase, Target, Megaphone, Users } from "lucide-react";

type VisualPill = {
  label: string;
  tone: "primary" | "accent" | "slate";
};

type Persona = {
  label: string;
  icon: typeof Briefcase;
  headline: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  meta: { label: string; value: string }[];
  visuals: {
    pills: VisualPill[];
    profile: {
      name: string;
      status: "Active" | "Draft" | "Scheduled";
      location: string;
      company: string;
    };
    metrics: { label: string; value: string; deltaLabel: string; progress: number }[];
  };
};

const pillStyles: Record<VisualPill["tone"], string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  slate: "bg-slate-900/5 text-slate-600 border-slate-200",
};

const personas: Persona[] = [
  {
    label: "Founders",
    icon: Briefcase,
    headline: "Own the room before you walk in it.",
    description:
      "Spark packages founder POVs, customer wins, and product drops into posts that compound trust. Show up daily without writing from scratch.",
    primaryCta: "Book a founder walkthrough",
    secondaryCta: "See founder playbook",
    meta: [
      { label: "Warm intros unlocked", value: "5x" },
      { label: "Avg. engagement lift", value: "142%" },
    ],
    visuals: {
      pills: [
        { label: "Vision update", tone: "primary" },
        { label: "Launch recap", tone: "accent" },
        { label: "Customer proof", tone: "slate" },
      ],
      profile: {
        name: "Jordan Patel",
        status: "Active",
        location: "SoMa, San Francisco",
        company: "Arcade Labs",
      },
      metrics: [
        { label: "Investor replies", value: "+36", deltaLabel: "this quarter", progress: 78 },
        { label: "Team referrals", value: "12", deltaLabel: "per month", progress: 62 },
      ],
    },
  },
  {
    label: "Sales Teams",
    icon: Megaphone,
    headline: "Turn every rep into a signal, not noise.",
    description:
      "Arm your AEs with social-first narratives, tailored follow-ups, and share-ready carousels that warm up every pipeline conversation.",
    primaryCta: "Activate revenue storytellers",
    secondaryCta: "Download talk tracks",
    meta: [
      { label: "Reply rate lift", value: "3.4x" },
      { label: "Avg. SQL gain", value: "+27%" },
    ],
    visuals: {
      pills: [
        { label: "Deal teardown", tone: "primary" },
        { label: "Buyer insight", tone: "slate" },
        { label: "Pipeline win", tone: "accent" },
      ],
      profile: {
        name: "Morgan Flynn",
        status: "Active",
        location: "Brooklyn, NYC",
        company: "Velocity CRM",
      },
      metrics: [
        { label: "Sequence replies", value: "68%", deltaLabel: "from LinkedIn", progress: 84 },
        { label: "Meetings booked", value: "21 / mo", deltaLabel: "per rep", progress: 71 },
      ],
    },
  },
  {
    label: "Marketing",
    icon: Target,
    headline: "Ship category stories while campaigns run.",
    description:
      "Repurpose webinar moments, thought leadership, and partner spotlights into scroll-stopping posts that keep attention between launches.",
    primaryCta: "Orchestrate your content engine",
    secondaryCta: "View editorial map",
    meta: [
      { label: "Share of voice", value: "+61%" },
      { label: "Content velocity", value: "4x" },
    ],
    visuals: {
      pills: [
        { label: "Narrative beat", tone: "accent" },
        { label: "Campaign clip", tone: "primary" },
        { label: "Partner boost", tone: "slate" },
      ],
      profile: {
        name: "Alana Chen",
        status: "Active",
        location: "Austin, Texas",
        company: "SignalNorth",
      },
      metrics: [
        { label: "Brand mentions", value: "+214", deltaLabel: "last 30 days", progress: 88 },
        { label: "Launch reach", value: "4.8M", deltaLabel: "impressions", progress: 76 },
      ],
    },
  },
  {
    label: "Career Switchers",
    icon: Users,
    headline: "Look in-demand before you sign the offer.",
    description:
      "Spark translates your projects, learnings, and ambitions into credibility-rich posts that hiring managers can’t ignore.",
    primaryCta: "Stand out in recruiter feeds",
    secondaryCta: "See job search kit",
    meta: [
      { label: "Inbound interviews", value: "4x" },
      { label: "Profile visits", value: "+327%" },
    ],
    visuals: {
      pills: [
        { label: "Portfolio drop", tone: "primary" },
        { label: "Learning recap", tone: "slate" },
        { label: "Problem solved", tone: "accent" },
      ],
      profile: {
        name: "Maya Ortiz",
        status: "Active",
        location: "Seattle, WA",
        company: "Product Ops → AI PM",
      },
      metrics: [
        { label: "Job leads", value: "9 / mo", deltaLabel: "from LinkedIn", progress: 69 },
        { label: "Connection rate", value: "58%", deltaLabel: "target roles", progress: 63 },
      ],
    },
  },
];

export const UseCases = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePersona = personas[activeIndex];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950/96 via-slate-950/92 to-slate-900/90 py-20 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[15%] top-[-20%] h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[180px]" />
        <div className="absolute right-[5%] bottom-[-25%] h-[26rem] w-[26rem] rounded-full bg-purple-600/25 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,91,255,0.15)_0,_transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/75">
              Who It’s For
            </div>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Hand-built LinkedIn playbooks for the people steering the growth engines.
            </h2>
            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              Switch between teams to see how Spark adapts tone, format, and cadence. Each workspace is tuned to the outcomes that matter most, powered by AI that understands audience dynamics.
            </p>
            <div className="flex flex-wrap gap-3">
              {personas.map((persona, index) => {
                const Icon = persona.icon;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={persona.label}
                    onClick={() => setActiveIndex(index)}
                    className={`group relative inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 focus:outline-none ${
                      isActive
                        ? "border-white/40 bg-white/15 shadow-[0_18px_45px_rgba(15,23,42,0.35)]"
                        : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-transform duration-300 ${isActive ? "scale-105" : ""}`}>
                      <Icon className="h-4 w-4" strokeWidth={2.4} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{persona.label}</span>
                      <span className="text-xs text-white/60">{persona.meta[0].label}</span>
                    </span>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition-transform duration-300 group-hover:translate-x-[2px]">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-[0_35px_90px_rgba(15,23,42,0.32)] backdrop-blur-xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/8 px-4 py-2 text-xs font-semibold text-white/80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
                    <activePersona.icon className="h-5 w-5" strokeWidth={2.4} />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] uppercase tracking-[0.24em] text-white/60">
                      Persona Workspace
                    </span>
                    <span>{activePersona.label}</span>
                  </div>
                </div>
                <div className="flex gap-2 text-right text-xs text-white/60">
                  {activePersona.meta.map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white/6 px-3 py-2">
                      <div className="text-[11px] uppercase tracking-widest text-white/40">{stat.label}</div>
                      <div className="text-sm font-semibold text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold leading-tight">{activePersona.headline}</h3>
                <p className="mt-3 text-sm text-white/70 sm:text-base">{activePersona.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90">
                  {activePersona.primaryCta}
                </button>
                <button className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white">
                  {activePersona.secondaryCta}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/12 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.25)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                    Content Sprint
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activePersona.visuals.pills.map((pill) => (
                      <span
                        key={pill.label}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${pillStyles[pill.tone]}`}
                      >
                        {pill.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/12 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.25)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                        Spotlight
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">{activePersona.visuals.profile.name}</div>
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {activePersona.visuals.profile.status}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-white/60">
                    <div className="flex items-center justify-between">
                      <span>Location</span>
                      <span>{activePersona.visuals.profile.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Focus</span>
                      <span>{activePersona.visuals.profile.company}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.35)]">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                      Momentum Metrics
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-white/40">
                      Live sync
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {activePersona.visuals.metrics.map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>{metric.label}</span>
                          <span>{metric.deltaLabel}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-semibold text-white">{metric.value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-400 to-purple-400"
                            style={{ width: `${metric.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



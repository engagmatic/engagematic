import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { PERSONA_PRESETS } from "@/constants/personaPresets";

const audiences = Object.entries(PERSONA_PRESETS).map(([slug, config]) => ({
  slug,
  label: config.label,
  icon: config.icon,
  stat: config.stat,
  lines: config.lines,
  cta: `/auth/register?persona=${slug}`,
}));

export const UseCases = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/12 via-background to-background py-16 text-foreground sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-30%] h-56 w-56 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-35%] h-64 w-64 rounded-full bg-purple-500/25 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,91,255,0.12)_0,_transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="w-full space-y-3 md:w-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
              Who It’s For
            </span>
            <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl">
              Precision playbooks for every LinkedIn growth role.
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base md:max-w-xl md:text-left">
            Spark adapts your narrative, tone, and cadence so each team shows up polished without extra headcount. Pick your lane—your workflow is already dialed in.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map(({ icon: Icon, label, stat, lines, cta }) => (
            <article
              key={label}
              className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-primary/15 bg-white/85 p-6 shadow-[0_16px_45px_rgba(59,91,255,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_24px_60px_rgba(59,91,255,0.18)] dark:bg-slate-950/85"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-purple-500/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white">
                    <Icon className="h-5 w-5" strokeWidth={2.4} />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
                      {label}
                    </div>
                    <div className="text-sm font-semibold text-primary">{stat}</div>
                  </div>
                </div>
                {lines.map((line, index) => (
                  <p key={index} className="text-sm leading-relaxed text-muted-foreground">
                    {line}
                  </p>
                ))}
                <Link
                  to={cta}
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition-colors duration-300 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
                >
                  Explore how
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};



import { Brain, MessageSquare, Sparkles } from "lucide-react";

const tools = [
  {
    icon: Brain,
    title: "AI Persona Engine",
    description: "Create your unique voice that learns from your writing style. Generate content that sounds authentically YOU.",
    color: "from-blue-500 via-indigo-500 to-purple-500",
    shadowColor: "shadow-blue-500/25"
  },
  {
    icon: MessageSquare,
    title: "Smart Comment AI",
    description: "Generate thoughtful comments that start real conversations. Build relationships, not just followers.",
    color: "from-purple-500 via-pink-500 to-rose-500",
    shadowColor: "shadow-purple-500/25"
  },
  {
    icon: Sparkles,
    title: "Viral Hooks & Ideas",
    description: "Generate AI-powered hooks and content ideas that grab attention and boost engagement. Never run out of inspiration.",
    color: "from-orange-500 via-amber-500 to-yellow-500",
    shadowColor: "shadow-orange-500/25"
  }
];

export const ToolsShowcase = () => {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-primary/15 bg-white/85 p-6 shadow-[0_20px_55px_rgba(59,91,255,0.15)] backdrop-blur-sm transition-all duration-300 sm:p-7 lg:p-8 dark:bg-slate-950/85">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-3rem] left-[-3rem] h-44 w-44 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,91,255,0.08)_0,_transparent_60%)]" />
      </div>

      <div className="relative space-y-5">
        <div className="space-y-2 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
            Inside the platform
          </span>
          <h3 className="text-xl font-bold text-foreground sm:text-2xl">
            This is just the{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              beginning
            </span>
          </h3>
          <p className="text-sm text-muted-foreground sm:text-base sm:max-w-md">
            Unlock the full stack of tools the moment you sign in—designed to keep your content pipeline moving with your voice on every draft.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col gap-4 rounded-2xl border border-primary/15 bg-white/90 p-5 shadow-[0_16px_40px_rgba(59,91,255,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_24px_55px_rgba(59,91,255,0.2)] sm:flex-row sm:items-center dark:bg-slate-950/90"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color} text-white shadow-xl ${tool.shadowColor} transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16`}>
                  <div className="absolute inset-0 rounded-2xl bg-white/15 blur-sm transition-all duration-300 group-hover:bg-white/25" />
                  <Icon className="relative z-10 h-7 w-7 sm:h-8 sm:w-8 drop-shadow-sm" strokeWidth={2.4} />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] transition-transform duration-700 ease-in-out group-hover:translate-x-[100%]" />
                </div>

                <div className="relative flex-1 space-y-1.5">
                  <h4 className="text-base font-semibold text-foreground transition-colors duration-300 group-hover:text-primary sm:text-lg">
                    {tool.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
                    {tool.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


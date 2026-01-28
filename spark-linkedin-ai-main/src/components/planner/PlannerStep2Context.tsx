import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlannerContext } from "@/services/plannerService";
import { Linkedin, Twitter, Instagram, Globe } from "lucide-react";

interface PlannerStep2ContextProps {
  context: PlannerContext;
  onContextChange: (field: keyof PlannerContext, value: any) => void;
  isLoading?: boolean;
}

const PLATFORMS = [
  { id: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  { id: 'X', icon: Twitter, color: 'text-black dark:text-white' },
  { id: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { id: 'Other', icon: Globe, color: 'text-gray-600' }
];

export const PlannerStep2Context = ({
  context,
  onContextChange,
  isLoading = false
}: PlannerStep2ContextProps) => {
  const handlePlatformToggle = (platform: string) => {
    const currentPlatforms = context.platforms || [];
    if (currentPlatforms.includes(platform)) {
      onContextChange('platforms', currentPlatforms.filter(p => p !== platform));
    } else {
      onContextChange('platforms', [...currentPlatforms, platform]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold">Tell us about your content</h2>
        <p className="text-sm text-muted-foreground">We'll use this to personalize your content plan</p>
      </div>

      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Audience */}
        <div className="space-y-2">
          <Label htmlFor="audience" className="text-sm font-medium">
            Who are you posting for?
          </Label>
          <Input
            id="audience"
            type="text"
            placeholder="e.g., B2B SaaS founders, job-seekers in tech, marketing professionals..."
            value={context.audience || ''}
            onChange={(e) => onContextChange('audience', e.target.value)}
            className="h-11"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Keep it short and simple. We'll use this to personalize hooks.
          </p>
        </div>

        {/* Help With */}
        <div className="space-y-2">
          <Label htmlFor="helpWith" className="text-sm font-medium">
            What do you help them with?
          </Label>
          <Input
            id="helpWith"
            type="text"
            placeholder="e.g., grow their LinkedIn, fix SEO, close more deals, build authority..."
            value={context.helpWith || ''}
            onChange={(e) => onContextChange('helpWith', e.target.value)}
            className="h-11"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            What problem do you solve or value do you provide?
          </p>
        </div>

        {/* Platforms */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Where will you post?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSelected = context.platforms?.includes(platform.id) || false;
              
              return (
                <div
                  key={platform.id}
                  className={`
                    flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  onClick={() => !isLoading && handlePlatformToggle(platform.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => !isLoading && handlePlatformToggle(platform.id)}
                    disabled={isLoading}
                  />
                  <Icon className={`h-4 w-4 ${platform.color}`} />
                  <span className="text-sm font-medium">{platform.id}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Select all platforms where you'll post this content.
          </p>
        </div>

        {/* Promotion (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="promotion" className="text-sm font-medium">
            What are you promoting? <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="promotion"
            type="text"
            placeholder="e.g., Done-for-you LinkedIn service, my SaaS product, a course, consulting..."
            value={context.promotion || ''}
            onChange={(e) => onContextChange('promotion', e.target.value)}
            className="h-11"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            If you're promoting something specific, mention it here. We'll weave it naturally into CTAs.
          </p>
        </div>
      </div>
    </div>
  );
};

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlannerConfig } from "@/services/plannerService";
import { SpiceLevel, ContentMix } from "@/constants/plannerTemplates";
import { Flame, Scale, Shield } from "lucide-react";

interface PlannerStep3ConfigProps {
  config: PlannerConfig;
  onConfigChange: (field: keyof PlannerConfig, value: any) => void;
  isLoading?: boolean;
}

const SPICE_LEVELS: { value: SpiceLevel; label: string; icon: any; description: string }[] = [
  {
    value: 'safe',
    label: 'Safe',
    icon: Shield,
    description: 'Professional and neutral'
  },
  {
    value: 'balanced',
    label: 'Balanced',
    icon: Scale,
    description: 'Direct but respectful (recommended)'
  },
  {
    value: 'bold',
    label: 'Bold',
    icon: Flame,
    description: 'Contrarian and attention-grabbing'
  }
];

const CONTENT_MIX_OPTIONS: { value: ContentMix; label: string; description: string }[] = [
  { value: 'educational', label: 'Educational', description: 'Teach and share knowledge' },
  { value: 'story', label: 'Story', description: 'Personal stories and experiences' },
  { value: 'opinion', label: 'Opinion / POV', description: 'Thought leadership and takes' },
  { value: 'case_study', label: 'Case Study', description: 'Success stories and results' },
  { value: 'tactical', label: 'Tactical How-To', description: 'Actionable frameworks' }
];

export const PlannerStep3Config = ({
  config,
  onConfigChange,
  isLoading = false
}: PlannerStep3ConfigProps) => {
  const handleContentMixToggle = (mix: ContentMix) => {
    const currentMix = config.contentMix || [];
    if (currentMix.includes(mix)) {
      onConfigChange('contentMix', currentMix.filter(m => m !== mix));
    } else {
      onConfigChange('contentMix', [...currentMix, mix]);
    }
  };

  const totalPosts = Math.min(config.postsPerWeek * 4, 30);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold">Configure your content plan</h2>
        <p className="text-sm text-muted-foreground">Customize frequency, tone, and content types</p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Posts Per Week */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              How many posts per week?
            </Label>
            <Badge variant="secondary" className="text-sm">
              {config.postsPerWeek} posts/week
            </Badge>
          </div>
          <Slider
            value={[config.postsPerWeek]}
            onValueChange={(value) => onConfigChange('postsPerWeek', value[0])}
            min={2}
            max={7}
            step={1}
            className="w-full"
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2 posts</span>
            <span className="font-medium text-primary">{totalPosts} posts this month</span>
            <span>7 posts</span>
          </div>
          <p className="text-xs text-muted-foreground">
            You'll get {totalPosts} posts total for the month (capped at 30).
          </p>
        </div>

        {/* Spice Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium block">
            How spicy should your content be?
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {SPICE_LEVELS.map((level) => {
              const Icon = level.icon;
              const isSelected = config.spiceLevel === level.value;
              
              return (
                <Button
                  key={level.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`
                    h-auto py-4 flex flex-col items-center gap-2
                    ${isSelected ? 'border-2 border-primary' : ''}
                  `}
                  onClick={() => !isLoading && onConfigChange('spiceLevel', level.value)}
                  disabled={isLoading}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-semibold">{level.label}</div>
                    <div className="text-xs opacity-70">{level.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content Mix */}
        <div className="space-y-3">
          <Label className="text-sm font-medium block">
            Content mix <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            Select content types you want to prioritize. Leave empty for a balanced mix.
          </p>
          <div className="flex flex-wrap gap-2">
            {CONTENT_MIX_OPTIONS.map((option) => {
              const isSelected = config.contentMix?.includes(option.value) || false;
              
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className={`
                    ${isSelected ? 'border-primary' : ''}
                  `}
                  onClick={() => !isLoading && handleContentMixToggle(option.value)}
                  disabled={isLoading}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
          {config.contentMix && config.contentMix.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {config.contentMix.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

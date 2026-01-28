import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Users, ShoppingCart, Sparkles, Check } from "lucide-react";
import { GoalType } from "@/constants/plannerTemplates";

interface PlannerStep1GoalProps {
  selectedGoal: GoalType | 'custom' | '';
  customGoal: string;
  onGoalSelect: (goal: GoalType | 'custom') => void;
  onCustomGoalChange: (value: string) => void;
  isLoading?: boolean;
}

const GOAL_OPTIONS = [
  {
    id: 'calls' as GoalType,
    title: 'Book more calls',
    subtitle: 'Content that pushes people to DM or book a slot.',
    icon: Phone,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    id: 'followers' as GoalType,
    title: 'Grow followers',
    subtitle: 'Content that gets shares, saves, and follows.',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  {
    id: 'sell' as GoalType,
    title: 'Sell a product/service',
    subtitle: 'Content that educates, builds trust, and nudges to buy.',
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800'
  }
];

export const PlannerStep1Goal = ({
  selectedGoal,
  customGoal,
  onGoalSelect,
  onCustomGoalChange,
  isLoading = false
}: PlannerStep1GoalProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold">What's your goal this month?</h2>
        <p className="text-sm text-muted-foreground">Choose what you want to achieve with your content</p>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GOAL_OPTIONS.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoal === goal.id;
          
          return (
            <Card
              key={goal.id}
              className={`
                p-6 cursor-pointer transition-all duration-200 hover:shadow-lg
                ${isSelected 
                  ? `border-2 border-primary ${goal.bgColor} shadow-md scale-105` 
                  : 'border hover:border-primary/50'
                }
              `}
              onClick={() => !isLoading && onGoalSelect(goal.id)}
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center mx-auto shadow-md`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground">{goal.subtitle}</p>
                </div>
                {isSelected && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Custom Goal Option */}
      <div className="space-y-3">
        <Button
          variant={selectedGoal === 'custom' ? 'default' : 'outline'}
          className="w-full"
          onClick={() => !isLoading && onGoalSelect('custom')}
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Custom Goal
        </Button>

        {selectedGoal === 'custom' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <Input
              type="text"
              placeholder="e.g., grow newsletter, hire candidates, build community..."
              value={customGoal}
              onChange={(e) => onCustomGoalChange(e.target.value)}
              className="h-11"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Describe your specific goal. We'll tailor content to achieve it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

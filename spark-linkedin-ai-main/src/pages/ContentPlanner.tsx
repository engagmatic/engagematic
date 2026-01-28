import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Lock, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PlannerStep1Goal } from "@/components/planner/PlannerStep1Goal";
import { PlannerStep2Context } from "@/components/planner/PlannerStep2Context";
import { PlannerStep3Config } from "@/components/planner/PlannerStep3Config";
import { PlannerStep4Board } from "@/components/planner/PlannerStep4Board";
import { 
  PlannerContext, 
  PlannerConfig, 
  PlannerBoard, 
  PlannerPost,
  generateBoard 
} from "@/services/plannerService";
import { GoalType } from "@/constants/plannerTemplates";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ContentPlanner = () => {
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has paid plan
  const hasPaidPlan = subscription && 
    subscription.plan !== 'trial' && 
    subscription.status === 'active';
  
  // Show loading state while checking auth and subscription (with timeout)
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading state while checking subscription (but not forever)
  if ((authLoading || subscriptionLoading) && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }
  
  // Show upgrade prompt if not authenticated or not paid user
  if (!isAuthenticated || !hasPaidPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Content Planner</h2>
            <p className="text-muted-foreground">
              This feature is available for all paid plans (Starter, Pro, and Elite).
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/pricing')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              View Plans & Upgrade
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Step 1: Goal
  const [goal, setGoal] = useState<GoalType | 'custom' | ''>('');
  const [customGoal, setCustomGoal] = useState('');
  
  // Step 2: Context
  const [context, setContext] = useState<PlannerContext>({
    audience: '',
    helpWith: '',
    platforms: [],
    promotion: ''
  });
  
  // Step 3: Config
  const [config, setConfig] = useState<PlannerConfig>({
    postsPerWeek: 5,
    spiceLevel: 'balanced',
    contentMix: []
  });
  
  // Step 4: Board
  const [board, setBoard] = useState<PlannerBoard | null>(null);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  // TEMPORARY DEBUG: Uncomment to test if component renders at all
  // return (
  //   <div style={{ 
  //     padding: '2rem', 
  //     background: 'red', 
  //     color: 'white', 
  //     fontSize: '24px', 
  //     zIndex: 9999,
  //     position: 'fixed',
  //     top: 0,
  //     left: 0,
  //     right: 0,
  //     bottom: 0
  //   }}>
  //     TEST: ContentPlanner Component is Rendering!
  //   </div>
  // );

  const handleGoalSelect = (selectedGoal: GoalType | 'custom') => {
    setGoal(selectedGoal);
    if (selectedGoal !== 'custom') {
      setCustomGoal('');
    }
  };

  const handleContextChange = (field: keyof PlannerContext, value: any) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (field: keyof PlannerConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handlePostEdit = (slot: number, field: keyof PlannerPost, value: string) => {
    if (!board) return;
    const updatedPosts = board.posts.map(post => 
      post.slot === slot ? { ...post, [field]: value, edited: true } : post
    );
    setBoard({ ...board, posts: updatedPosts });
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return goal !== '' && (goal !== 'custom' || customGoal.trim() !== '');
      case 2:
        return context.audience.trim() !== '' && 
               context.helpWith.trim() !== '' && 
               context.platforms.length > 0;
      case 3:
        return true; // Config is always valid
      case 4:
        return board !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 3) {
      // Generate board
      handleGenerateBoard();
    } else if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerateBoard = async () => {
    if (!canProceed()) return;
    
    setIsGenerating(true);
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const finalGoal = goal === 'custom' ? 'calls' : goal as GoalType;
      const generatedBoard = generateBoard(finalGoal, context, config);
      setBoard(generatedBoard);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating board:', error);
      alert('Error generating board. Please check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerateBoard();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background p-4 sm:p-6 lg:p-8" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <div className="max-w-6xl mx-auto" style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Hook → Outcome Content Planner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Turn your monthly goal into a clear content plan with hooks, CTAs, and comment prompts that drive DMs and leads—not vanity likes.
          </p>
        </div>

        {/* Progress Bar */}
        {currentStep < 4 && (
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </Card>
        )}

        {/* Step Content */}
        <Card className="p-6 sm:p-8 lg:p-10 min-h-[500px]">
          {currentStep === 1 && (
            <PlannerStep1Goal
              selectedGoal={goal}
              customGoal={customGoal}
              onGoalSelect={handleGoalSelect}
              onCustomGoalChange={setCustomGoal}
              isLoading={isGenerating}
            />
          )}

          {currentStep === 2 && (
            <PlannerStep2Context
              context={context}
              onContextChange={handleContextChange}
              isLoading={isGenerating}
            />
          )}

          {currentStep === 3 && (
            <PlannerStep3Config
              config={config}
              onConfigChange={handleConfigChange}
              isLoading={isGenerating}
            />
          )}

          {currentStep === 4 && board && (
            <PlannerStep4Board
              board={board}
              onPostEdit={handlePostEdit}
              onRegenerate={handleRegenerate}
            />
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating your content plan...</p>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        {currentStep < 4 && !isGenerating && (
          <div className="flex justify-between items-center mt-6 gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
            >
              {currentStep === 3 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Board
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPlanner;

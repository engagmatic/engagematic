import { useState } from "react";
import { PlannerBoardCard } from "@/components/planner/PlannerBoardCard";
import { PlannerCalendarView } from "@/components/planner/PlannerCalendarView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlannerBoard, PlannerPost } from "@/services/plannerService";
import { Download, Send, Copy, FileText, Calendar, Users, Target, Loader2 } from "lucide-react";
import { exportToCSV, exportToText } from "@/services/plannerService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface PlannerStep4BoardProps {
  board: PlannerBoard;
  onPostEdit: (slot: number, field: keyof PlannerPost, value: string) => void;
  onRegenerate?: () => void;
  onFinalize?: (board: PlannerBoard) => Promise<void>;
}

export const PlannerStep4Board = ({
  board,
  onPostEdit,
  onRegenerate,
  onFinalize
}: PlannerStep4BoardProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set());
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleCopy = (field: keyof PlannerPost, value: string, slot: number) => {
    navigator.clipboard.writeText(value);
    setCopiedFields(new Set([...copiedFields, `${slot}-${field}`]));
    setTimeout(() => {
      setCopiedFields(new Set());
    }, 2000);
    toast.success('Copied to clipboard');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(board.posts);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-plan-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const handleExportText = () => {
    const text = exportToText(board.posts);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-plan-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to text');
  };

  const handleSendToEngagematic = async () => {
    if (onFinalize) {
      setIsFinalizing(true);
      try {
        await onFinalize(board);
        setShowCalendarView(true);
        toast.success('Plan saved to dashboard. You can view it anytime from Content Planner.');
      } catch (e: any) {
        toast.error(e?.message || 'Failed to save plan');
      } finally {
        setIsFinalizing(false);
      }
    } else {
      setShowCalendarView(true);
      toast.success('Schedule your content in the calendar view');
    }
  };

  const handleScheduleChange = (slot: number, date: Date, time: string) => {
    // This is no longer used but kept for compatibility
    // The new drag & drop system uses column changes instead
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Show calendar view if requested
  if (showCalendarView) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowCalendarView(false)}
            className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm"
          >
            ← Back
          </Button>
          <h2 className="text-lg sm:text-xl font-bold">Planning Board</h2>
          <div className="w-16"></div>
        </div>
        <PlannerCalendarView
          board={board}
          onPostEdit={onPostEdit}
          onScheduleChange={handleScheduleChange}
          defaultViewMode="kanban"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold">
          Your {currentMonth} Content Board
        </h2>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Badge variant="outline" className="gap-1">
            <Target className="h-3 w-3" />
            {board.goal === 'calls' ? 'Book more calls' : 
             board.goal === 'followers' ? 'Grow followers' : 
             board.goal === 'sell' ? 'Sell product/service' : 
             'Custom goal'}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {board.context.audience || 'Your audience'}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {board.posts.length} posts
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button
          variant="outline"
          onClick={handleExportText}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Export Text
        </Button>
        <Button
          onClick={handleSendToEngagematic}
          disabled={isFinalizing}
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {isFinalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isFinalizing ? 'Saving...' : 'Send to Engagematic'}
        </Button>
        {onRegenerate && (
          <Button
            variant="outline"
            onClick={onRegenerate}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Regenerate
          </Button>
        )}
      </div>

      {/* Upgrade Prompt */}
      {!isAuthenticated && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Turn this into scheduled posts + smart comments</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sign up to generate full drafts and automate your content
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/auth/register')}
              className="gap-2"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {board.posts.map((post) => (
          <PlannerBoardCard
            key={post.slot}
            post={post}
            onEdit={(field, value) => onPostEdit(post.slot, field, value)}
            onCopy={(field, value) => handleCopy(field, value, post.slot)}
          />
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
        <p>
          💡 Click any line to edit. It's your voice, we just give you a starting point.
        </p>
        <p className="mt-1">
          Drag posts to reorder. Copy hooks, CTAs, and prompts to use anywhere.
        </p>
      </div>
    </div>
  );
};

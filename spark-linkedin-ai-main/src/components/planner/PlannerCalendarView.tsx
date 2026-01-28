import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PlannerBoard, PlannerPost } from "@/services/plannerService";
import { Copy, Edit2, Save, X, Sparkles, FileText, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlannerCalendarViewProps {
  board: PlannerBoard;
  onPostEdit: (slot: number, field: keyof PlannerPost, value: string) => void;
  onScheduleChange?: (slot: number, date: Date, time: string) => void;
  defaultViewMode?: 'calendar' | 'kanban';
}

type ColumnType = 'ideas' | 'draft' | 'ready' | 'published';

const COLUMNS: { id: ColumnType; label: string; shortLabel: string; color: string }[] = [
  { id: 'ideas', label: 'Ideas & Topics', shortLabel: 'Ideas', color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' },
  { id: 'draft', label: 'Draft', shortLabel: 'Draft', color: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' },
  { id: 'ready', label: 'Ready to Post', shortLabel: 'Ready', color: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' },
  { id: 'published', label: 'Published', shortLabel: 'Done', color: 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800' }
];

export const PlannerCalendarView = ({
  board,
  onPostEdit,
  defaultViewMode = 'kanban'
}: PlannerCalendarViewProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [postsByColumn, setPostsByColumn] = useState<Map<number, ColumnType>>(() => {
    // Initialize all posts to 'ideas' column
    const initial = new Map<number, ColumnType>();
    board.posts.forEach(post => {
      initial.set(post.slot, post.column || 'ideas');
    });
    return initial;
  });
  const [selectedPost, setSelectedPost] = useState<{ slot: number; field: keyof PlannerPost } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [generatingPost, setGeneratingPost] = useState<number | null>(null);
  const [draggedPost, setDraggedPost] = useState<number | null>(null);

  // Get posts for each column
  const getPostsForColumn = (columnId: ColumnType) => {
    return board.posts.filter(post => postsByColumn.get(post.slot) === columnId);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, slot: number) => {
    setDraggedPost(slot);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetColumn: ColumnType) => {
    e.preventDefault();
    if (draggedPost !== null) {
      setPostsByColumn(prev => {
        const newMap = new Map(prev);
        newMap.set(draggedPost, targetColumn);
        return newMap;
      });
      // Update post column in the board
      onPostEdit(draggedPost, 'column', targetColumn);
      toast.success(`Moved to ${COLUMNS.find(c => c.id === targetColumn)?.label}`);
    }
    setDraggedPost(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedPost(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleEdit = (slot: number, field: keyof PlannerPost, currentValue: string) => {
    setSelectedPost({ slot, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (selectedPost && editValue.trim()) {
      onPostEdit(selectedPost.slot, selectedPost.field, editValue);
      setSelectedPost(null);
      setEditValue('');
      toast.success('Updated successfully');
    }
  };

  const handleEditNotes = (slot: number, currentNotes: string) => {
    setEditingNotes(slot);
    setNotesValue(currentNotes || '');
  };

  const handleSaveNotes = (slot: number) => {
    onPostEdit(slot, 'notes', notesValue);
    setEditingNotes(null);
    setNotesValue('');
    toast.success('Notes saved');
  };

  // Generate content using Engagematic API
  const handleGenerateContent = async (post: PlannerPost) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to generate content');
      navigate('/auth/login');
      return;
    }

    setGeneratingPost(post.slot);
    
    try {
      // Prepare topic from hook and angle
      const topic = `${post.hook}\n\n${post.angle}`;
      
      // Use hook as title (ensure it's between 5-100 chars)
      const title = post.hook.length > 100 
        ? post.hook.substring(0, 97) + '...' 
        : post.hook.length < 5 
        ? post.hook + ' - ' + post.angle.substring(0, 50)
        : post.hook;
      
      // Determine category based on hook content (default to 'insight')
      let category = 'insight';
      const hookLower = post.hook.toLowerCase();
      if (hookLower.includes('story') || hookLower.includes('learned') || hookLower.includes('experience')) {
        category = 'story';
      } else if (hookLower.includes('?') || hookLower.includes('why') || hookLower.includes('how')) {
        category = 'question';
      } else if (hookLower.includes('think') || hookLower.includes('believe') || hookLower.includes('should')) {
        category = 'statement';
      } else if (hookLower.includes('challenge') || hookLower.includes('wrong') || hookLower.includes('stop')) {
        category = 'challenge';
      }
      
      // Use generatePostCustom - requires: topic, title, category, and persona
      const postData: any = {
        topic: topic,
        title: title,
        category: category,
      };
      
      // Add persona data if available
      if (user?.persona?._id) {
        postData.personaId = user.persona._id;
      } else if (user?.persona) {
        postData.persona = user.persona;
      }

      const response = await apiClient.generatePostCustom(postData);
      
      if (response.success) {
        toast.success('Content generated successfully!');
        // Optionally navigate to post generator or show the generated content
        navigate('/post-generator', { 
          state: { 
            generatedContent: response.data.content,
            topic: post.hook 
          } 
        });
      } else {
        throw new Error(response.message || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast.error(error.message || 'Failed to generate content. Please try again.');
    } finally {
      setGeneratingPost(null);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Content Planning Board</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag & drop to organize • Click notes icon to add notes • Click spark icon to generate
          </p>
        </div>
      </div>

      {/* Upgrade Prompt for Non-Authenticated Users - Compact */}
      {!isAuthenticated && (
        <Card className="p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-primary/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs sm:text-sm">Sign in to generate content</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                Click spark icon to create posts
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/auth/register')}
              className="gap-1 text-xs h-7 sm:h-8 px-2 sm:px-3 flex-shrink-0"
            >
              Sign In
            </Button>
          </div>
        </Card>
      )}

      {/* Kanban Board - Compact & Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {COLUMNS.map((column) => {
          const columnPosts = getPostsForColumn(column.id);
          
          return (
            <div
              key={column.id}
              className={`space-y-2 min-h-[300px] sm:min-h-[400px] p-2 sm:p-3 rounded-lg border-2 ${column.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-xs sm:text-sm">
                  <span className="hidden sm:inline">{column.label}</span>
                  <span className="sm:hidden">{column.shortLabel}</span>
                </h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{columnPosts.length}</Badge>
              </div>
              
              <div className="space-y-2">
                {columnPosts.map((post) => {
                  const isDragging = draggedPost === post.slot;
                  const isGenerating = generatingPost === post.slot;
                  const isEditingNotes = editingNotes === post.slot;
                  
                  return (
                    <TooltipProvider key={`tooltip-${post.slot}`}>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Card
                            draggable
                            onDragStart={(e) => handleDragStart(e, post.slot)}
                            onDragEnd={handleDragEnd}
                            className={`
                              p-2 sm:p-3 hover:shadow-md transition-all cursor-move
                              ${isDragging ? 'opacity-50' : ''}
                            `}
                          >
                            <div className="space-y-2">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <Badge variant="outline" className="text-xs">
                                    #{post.slot}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(post.hook, 'Hook');
                                    }}
                                    title="Copy hook"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(post.slot, 'hook', post.hook);
                                    }}
                                    title="Edit hook"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Hook - Main Content */}
                              <div>
                                <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight">
                                  {post.hook}
                                </p>
                              </div>

                        {/* Notes Section - Compact */}
                        <div className="space-y-1">
                          {!isEditingNotes ? (
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex-1 min-h-[40px] sm:min-h-[50px]">
                                {post.notes ? (
                                  <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-pre-wrap line-clamp-2">
                                    {post.notes}
                                  </p>
                                ) : (
                                  <button
                                    onClick={() => handleEditNotes(post.slot, post.notes || '')}
                                    className="text-[10px] sm:text-xs text-muted-foreground italic hover:text-foreground transition-colors w-full text-left"
                                  >
                                    + Add notes
                                  </button>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditNotes(post.slot, post.notes || '');
                                }}
                                title="Notes"
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <Textarea
                                value={notesValue}
                                onChange={(e) => setNotesValue(e.target.value)}
                                placeholder="Add notes..."
                                className="text-xs min-h-[60px] sm:min-h-[70px]"
                                autoFocus
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2"
                                  onClick={() => {
                                    setEditingNotes(null);
                                    setNotesValue('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] px-2"
                                  onClick={() => handleSaveNotes(post.slot)}
                                >
                                  <Save className="h-2.5 w-2.5 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Generate Content Button - Compact */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateContent(post);
                          }}
                          disabled={isGenerating || !isAuthenticated}
                          className="w-full gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-7 sm:h-8"
                          size="sm"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                              <span className="text-[10px] sm:text-xs">Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span className="text-[10px] sm:text-xs">Generate</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="max-w-xs sm:max-w-md p-3 bg-popover border shadow-lg z-[100]"
                        onPointerDownOutside={(e) => e.preventDefault()}
                      >
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">Hook:</p>
                          <p className="text-sm whitespace-pre-wrap break-words">{post.hook}</p>
                          {post.angle && (
                            <>
                              <p className="font-semibold text-sm mt-2">Angle:</p>
                              <p className="text-sm whitespace-pre-wrap break-words">{post.angle}</p>
                            </>
                          )}
                          {post.cta && (
                            <>
                              <p className="font-semibold text-sm mt-2">CTA:</p>
                              <p className="text-sm break-words">{post.cta}</p>
                            </>
                          )}
                          {post.commentPrompt && (
                            <>
                              <p className="font-semibold text-sm mt-2">Comment Prompt:</p>
                              <p className="text-sm break-words">{post.commentPrompt}</p>
                            </>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  );
                })}
                
                {columnPosts.length === 0 && (
                  <div className="text-center text-[10px] sm:text-xs text-muted-foreground py-6 sm:py-8 border-2 border-dashed rounded-lg">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal - Compact */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <Card className="w-full max-w-lg sm:max-w-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm sm:text-base">Edit {selectedPost.field}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7"
                onClick={() => setSelectedPost(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-h-[150px] sm:min-h-[200px] text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedPost(null)} className="h-8 text-xs sm:text-sm">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} className="h-8 text-xs sm:text-sm">
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

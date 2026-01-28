import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit2, GripVertical, Check } from "lucide-react";
import { PlannerPost } from "@/services/plannerService";
import { useState } from "react";
import { toast } from "sonner";

interface PlannerBoardCardProps {
  post: PlannerPost;
  onEdit: (field: keyof PlannerPost, value: string) => void;
  onCopy: (field: keyof PlannerPost, value: string) => void;
  isDragging?: boolean;
}

export const PlannerBoardCard = ({
  post,
  onEdit,
  onCopy,
  isDragging = false
}: PlannerBoardCardProps) => {
  const [editingField, setEditingField] = useState<keyof PlannerPost | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field: keyof PlannerPost, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (editingField && editValue.trim()) {
      onEdit(editingField, editValue);
      setEditingField(null);
      setEditValue('');
      toast.success('Updated successfully');
    }
  };

  const handleCopy = (field: keyof PlannerPost, value: string) => {
    navigator.clipboard.writeText(value);
    onCopy(field, value);
    toast.success('Copied to clipboard');
  };

  const renderField = (
    label: string,
    field: keyof PlannerPost,
    value: string,
    icon?: any
  ) => {
    const isEditing = editingField === field;
    const Icon = icon || Copy;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </Label>
          <div className="flex gap-1">
            {!isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleEdit(field, value)}
                  title="Edit"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopy(field, value)}
                  title="Copy"
                >
                  <Icon className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleSave}
                title="Save"
              >
                <Check className="h-3 w-3 text-green-600" />
              </Button>
            )}
          </div>
        </div>
        {isEditing ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[60px] text-sm"
            autoFocus
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                handleSave();
              }
            }}
          />
        ) : (
          <p className="text-sm leading-relaxed">{value}</p>
        )}
      </div>
    );
  };

  return (
    <Card className={`
      p-4 hover:shadow-md transition-all duration-200
      ${isDragging ? 'opacity-50' : ''}
      ${post.edited ? 'border-primary/50 bg-primary/5' : ''}
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-1 cursor-move">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Post #{post.slot}
            </Badge>
            {post.edited && (
              <Badge variant="secondary" className="text-xs">
                Edited
              </Badge>
            )}
          </div>

          {renderField('Hook', 'hook', post.hook)}
          {renderField('Angle', 'angle', post.angle)}
          {renderField('Call-to-Action', 'cta', post.cta)}
          {renderField('Comment Prompt', 'commentPrompt', post.commentPrompt)}
        </div>
      </div>
    </Card>
  );
};

import { Check, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Task, type TaskStatus, type TaskPriority, type SubjectId } from "@shared/schema";
import { getSubjectIcon, getSubjectName, getSubjectColors, formatMinutes } from "@/lib/subjects";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const priorityStyles: Record<TaskPriority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export function TaskCard({ task, onStatusChange, onEdit, onDelete, compact = false }: TaskCardProps) {
  const SubjectIcon = getSubjectIcon(task.subjectId as SubjectId);
  const subjectColors = getSubjectColors(task.subjectId as SubjectId);
  const isCompleted = task.status === "completed";

  const handleToggleComplete = () => {
    if (onStatusChange) {
      onStatusChange(task.id, isCompleted ? "pending" : "completed");
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border p-3 transition-all",
          isCompleted && "opacity-60"
        )}
        data-testid={`card-task-${task.id}`}
      >
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggleComplete}
          data-testid={`checkbox-task-${task.id}`}
        />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium truncate", isCompleted && "line-through text-muted-foreground")}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={cn("text-xs", subjectColors.bg, subjectColors.text)}>
              {getSubjectName(task.subjectId as SubjectId)}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatMinutes(task.estimatedMinutes)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "p-4 transition-all",
        isCompleted && "opacity-70"
      )}
      data-testid={`card-task-${task.id}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggleComplete}
          className="mt-1"
          data-testid={`checkbox-task-${task.id}`}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-medium text-sm leading-tight",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" data-testid={`button-task-menu-${task.id}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(task)} data-testid={`button-edit-task-${task.id}`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(task.id)}
                  className="text-destructive"
                  data-testid={`button-delete-task-${task.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="outline" className={cn("text-xs gap-1", subjectColors.bg, subjectColors.text)}>
              <SubjectIcon className="h-3 w-3" />
              {getSubjectName(task.subjectId as SubjectId)}
            </Badge>
            <Badge variant="outline" className={cn("text-xs", priorityStyles[task.priority as TaskPriority])}>
              {task.priority}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" />
              {formatMinutes(task.estimatedMinutes)}
            </span>
          </div>
          
          {task.notes && (
            <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded-md">
              {task.notes}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

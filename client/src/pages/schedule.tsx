import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "@/components/task-card";
import { TaskDialog } from "@/components/task-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  type Task,
  type InsertTask,
  type TaskStatus,
  type SubjectId,
} from "@shared/schema";
import {
  getTodayString,
  formatMinutes,
  getSubjectColors,
} from "@/lib/subjects";

function getWeekDates(weekOffset: number = 0): Date[] {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + weekOffset * 7);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function formatDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

function formatDayNumber(date: Date): string {
  return date.getDate().toString();
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function Schedule() {
  const { toast } = useToast();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const today = getTodayString();
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setTaskDialogOpen(false);
      toast({ title: "Task created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...data }: InsertTask & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditingTask(null);
      toast({ title: "Task updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  const handleStatusChange = (id: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      updateTaskMutation.mutate({
        id,
        title: task.title,
        description: task.description ?? undefined,
        subjectId: task.subjectId,
        date: task.date,
        estimatedMinutes: task.estimatedMinutes,
        status,
        priority: task.priority as "low" | "medium" | "high",
        notes: task.notes ?? undefined,
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleDelete = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const handleSubmitTask = (data: InsertTask) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, ...data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  // Group tasks by date for the week view
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    weekDates.forEach((date) => {
      const dateStr = formatDateString(date);
      grouped[dateStr] = tasks.filter((t) => t.date === dateStr);
    });
    return grouped;
  }, [tasks, weekDates]);

  // Selected date tasks
  const selectedTasks = tasks.filter((t) => t.date === selectedDate);
  const selectedDateObj = new Date(selectedDate);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" data-testid="schedule-loading">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-schedule">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-schedule-title">Study Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Plan and organize your daily study tasks
          </p>
        </div>
        <Button onClick={() => setTaskDialogOpen(true)} data-testid="button-add-schedule-task">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {formatMonthYear(weekDates[0])}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setWeekOffset((w) => w - 1)}
                data-testid="button-prev-week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWeekOffset(0);
                  setSelectedDate(today);
                }}
                data-testid="button-today"
              >
                Today
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setWeekOffset((w) => w + 1)}
                data-testid="button-next-week"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date) => {
              const dateStr = formatDateString(date);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const dayTasks = tasksByDate[dateStr] || [];
              const completedCount = dayTasks.filter((t) => t.status === "completed").length;
              const totalMinutes = dayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover-elevate",
                    isToday && !isSelected && "border-primary/50"
                  )}
                  data-testid={`button-date-${dateStr}`}
                >
                  <span className="text-xs text-muted-foreground">{formatDayName(date)}</span>
                  <span
                    className={cn(
                      "text-lg font-semibold mt-1",
                      isToday && "text-primary"
                    )}
                  >
                    {formatDayNumber(date)}
                  </span>
                  <div className="mt-2 w-full">
                    {dayTasks.length > 0 ? (
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className="text-xs w-full justify-center"
                        >
                          {completedCount}/{dayTasks.length} tasks
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatMinutes(totalMinutes)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground block text-center">
                        No tasks
                      </span>
                    )}
                  </div>
                  {/* Task indicators */}
                  <div className="flex gap-1 mt-2 flex-wrap justify-center">
                    {dayTasks.slice(0, 3).map((task) => {
                      const colors = getSubjectColors(task.subjectId as SubjectId);
                      return (
                        <div
                          key={task.id}
                          className={cn("w-2 h-2 rounded-full", colors.bg, colors.border)}
                        />
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {selectedDateObj.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedTasks.length === 0
                ? "No tasks scheduled"
                : `${selectedTasks.filter((t) => t.status === "completed").length} of ${selectedTasks.length} tasks completed`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setTaskDialogOpen(true)}
            data-testid="button-add-day-task"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {selectedTasks.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-3">No tasks for this day</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setTaskDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add a task
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {/* Sort by priority then by status */}
                {[...selectedTasks]
                  .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
                    const statusDiff =
                      statusOrder[a.status as keyof typeof statusOrder] -
                      statusOrder[b.status as keyof typeof statusOrder];
                    if (statusDiff !== 0) return statusDiff;
                    return (
                      priorityOrder[a.priority as keyof typeof priorityOrder] -
                      priorityOrder[b.priority as keyof typeof priorityOrder]
                    );
                  })
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen || !!editingTask}
        onOpenChange={(open) => {
          if (!open) {
            setTaskDialogOpen(false);
            setEditingTask(null);
          }
        }}
        task={editingTask}
        onSubmit={handleSubmitTask}
        isPending={createTaskMutation.isPending || updateTaskMutation.isPending}
        defaultDate={selectedDate}
      />
    </div>
  );
}

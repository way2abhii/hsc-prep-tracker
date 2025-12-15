import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, CheckCircle2, Clock, Target, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard } from "@/components/task-card";
import { TaskDialog } from "@/components/task-dialog";
import { StatsCard } from "@/components/stats-card";
import { ProgressRing } from "@/components/progress-ring";
import { ExamCountdown } from "@/components/exam-countdown";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  type Task,
  type InsertTask,
  type TaskStatus,
  HSC_SUBJECTS,
  type SubjectId,
} from "@shared/schema";
import {
  getTodayString,
  formatDate,
  formatMinutes,
  getSubjectName,
  getSubjectColors,
  getCurrentWeekDates,
} from "@/lib/subjects";

export default function Dashboard() {
  const { toast } = useToast();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const today = getTodayString();
  const weekDates = getCurrentWeekDates();

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

  // Calculate stats
  const todayTasks = tasks.filter((t) => t.date === today);
  const completedToday = todayTasks.filter((t) => t.status === "completed").length;
  const totalToday = todayTasks.length;
  const todayProgress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const weekTasks = tasks.filter((t) => weekDates.includes(t.date));
  const completedWeek = weekTasks.filter((t) => t.status === "completed").length;
  const totalWeek = weekTasks.length;

  const totalMinutesToday = todayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completedMinutesToday = todayTasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);

  // Subject-wise progress
  const subjectStats = HSC_SUBJECTS.map((subject) => {
    const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
    const completed = subjectTasks.filter((t) => t.status === "completed").length;
    return {
      ...subject,
      total: subjectTasks.length,
      completed,
      progress: subjectTasks.length > 0 ? (completed / subjectTasks.length) * 100 : 0,
    };
  }).filter((s) => s.total > 0);

  // Upcoming tasks (next 7 days, not completed)
  const upcomingTasks = tasks
    .filter((t) => t.date >= today && t.status !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date) || b.priority.localeCompare(a.priority))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" data-testid="dashboard-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Study Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {formatDate(today)} - Track your HSC preparation progress
          </p>
        </div>
        <Button onClick={() => setTaskDialogOpen(true)} data-testid="button-add-task">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Tasks"
          value={`${completedToday}/${totalToday}`}
          subtitle={totalToday > 0 ? `${Math.round(todayProgress)}% complete` : "No tasks today"}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Study Time Today"
          value={formatMinutes(completedMinutesToday)}
          subtitle={`of ${formatMinutes(totalMinutesToday)} planned`}
          icon={Clock}
        />
        <StatsCard
          title="Weekly Progress"
          value={`${completedWeek}/${totalWeek}`}
          subtitle="tasks completed"
          icon={Target}
        />
        <StatsCard
          title="Active Subjects"
          value={subjectStats.length}
          subtitle={`of ${HSC_SUBJECTS.length} subjects`}
          icon={BookOpen}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Today's Focus</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {todayTasks.length === 0
                  ? "No tasks scheduled for today"
                  : `${completedToday} of ${totalToday} tasks completed`}
              </p>
            </div>
            {totalToday > 0 && (
              <ProgressRing progress={todayProgress} size={60} strokeWidth={5} />
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-3">No tasks for today</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setTaskDialogOpen(true)}
                  data-testid="button-add-today-task"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first task
                </Button>
              </div>
            ) : (
              todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Exam Countdown */}
          <ExamCountdown />

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming tasks
                </p>
              ) : (
                upcomingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} compact onStatusChange={handleStatusChange} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Subject Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Subject Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Add tasks to track subject progress
                </p>
              ) : (
                subjectStats.map((subject) => {
                  const colors = getSubjectColors(subject.id as SubjectId);
                  return (
                    <div key={subject.id} data-testid={`progress-subject-${subject.id}`}>
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className={`text-xs ${colors.bg} ${colors.text}`}>
                          {subject.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {subject.completed}/{subject.total}
                        </span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
        defaultDate={today}
      />
    </div>
  );
}

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/stats-card";
import { ProgressRing } from "@/components/progress-ring";
import { type Task, HSC_SUBJECTS, type SubjectId } from "@shared/schema";
import {
  formatMinutes,
  getSubjectColors,
  getSubjectIcon,
  getCurrentWeekDates,
} from "@/lib/subjects";
import { cn } from "@/lib/utils";

function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ProgressPage() {
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const last7Days = useMemo(() => getLastNDays(7), []);
  const last30Days = useMemo(() => getLastNDays(30), []);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const completedMinutes = tasks
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.estimatedMinutes, 0);

    return {
      totalTasks,
      completedTasks,
      totalMinutes,
      completedMinutes,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }, [tasks]);

  // Weekly activity grid (GitHub-style)
  const weeklyActivity = useMemo(() => {
    return last7Days.map((date) => {
      const dayTasks = tasks.filter((t) => t.date === date);
      const completed = dayTasks.filter((t) => t.status === "completed").length;
      const total = dayTasks.length;
      return {
        date,
        completed,
        total,
        intensity: total > 0 ? completed / total : 0,
      };
    });
  }, [tasks, last7Days]);

  // Subject-wise breakdown
  const subjectBreakdown = useMemo(() => {
    return HSC_SUBJECTS.map((subject) => {
      const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
      const completed = subjectTasks.filter((t) => t.status === "completed").length;
      const total = subjectTasks.length;
      const totalMinutes = subjectTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
      const completedMinutes = subjectTasks
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.estimatedMinutes, 0);

      return {
        ...subject,
        total,
        completed,
        totalMinutes,
        completedMinutes,
        progress: total > 0 ? (completed / total) * 100 : 0,
      };
    })
      .filter((s) => s.total > 0)
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [tasks]);

  // Daily completion trend
  const dailyTrend = useMemo(() => {
    return last7Days.map((date) => {
      const dayTasks = tasks.filter((t) => t.date === date);
      const completed = dayTasks.filter((t) => t.status === "completed").length;
      const minutes = dayTasks
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.estimatedMinutes, 0);
      return {
        date,
        completed,
        minutes,
      };
    });
  }, [tasks, last7Days]);

  // Calculate max for bar chart scaling
  const maxMinutes = Math.max(...dailyTrend.map((d) => d.minutes), 60);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" data-testid="progress-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-progress">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-progress-title">Progress Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visualize your study progress and achievements
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={overallStats.totalTasks}
          subtitle={`${overallStats.completedTasks} completed`}
          icon={Target}
        />
        <StatsCard
          title="Completion Rate"
          value={`${Math.round(overallStats.completionRate)}%`}
          subtitle="overall progress"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Study Time"
          value={formatMinutes(overallStats.completedMinutes)}
          subtitle={`of ${formatMinutes(overallStats.totalMinutes)} planned`}
          icon={Clock}
        />
        <StatsCard
          title="Active Subjects"
          value={subjectBreakdown.length}
          subtitle={`of ${HSC_SUBJECTS.length} total`}
          icon={BookOpen}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Progress Ring */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <ProgressRing
              progress={overallStats.completionRate}
              size={160}
              strokeWidth={12}
              label="Complete"
            />
            <div className="grid grid-cols-2 gap-6 mt-6 w-full">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{overallStats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{overallStats.totalTasks - overallStats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Study Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48 mt-4">
              {dailyTrend.map((day) => {
                const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-primary/80 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      data-testid={`bar-day-${day.date}`}
                    />
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">
                        {formatShortDate(day.date)}
                      </p>
                      <p className="text-xs font-medium">
                        {formatMinutes(day.minutes)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Activity Grid */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm font-medium mb-3">Completion Rate</p>
              <div className="flex gap-2">
                {weeklyActivity.map((day) => (
                  <div
                    key={day.date}
                    className={cn(
                      "flex-1 h-8 rounded-md transition-colors",
                      day.intensity === 0
                        ? "bg-muted"
                        : day.intensity < 0.5
                        ? "bg-primary/30"
                        : day.intensity < 1
                        ? "bg-primary/60"
                        : "bg-primary"
                    )}
                    title={`${day.completed}/${day.total} tasks - ${formatShortDate(day.date)}`}
                    data-testid={`activity-day-${day.date}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>Less</span>
                <span>More</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Subject-wise Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjectBreakdown.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-3">
                No subject data available yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Add study tasks to see your progress by subject
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {subjectBreakdown.map((subject) => {
                const Icon = getSubjectIcon(subject.id as SubjectId);
                const colors = getSubjectColors(subject.id as SubjectId);
                return (
                  <div key={subject.id} data-testid={`subject-progress-${subject.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-md", colors.bg)}>
                          <Icon className={cn("h-4 w-4", colors.text)} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {subject.completed}/{subject.total} tasks
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={cn(colors.bg, colors.text)}>
                          {Math.round(subject.progress)}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatMinutes(subject.completedMinutes)} / {formatMinutes(subject.totalMinutes)}
                        </p>
                      </div>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{overallStats.completedTasks}</p>
          <p className="text-sm text-muted-foreground">Tasks Done</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold">{formatMinutes(overallStats.completedMinutes)}</p>
          <p className="text-sm text-muted-foreground">Study Time</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold">{subjectBreakdown.length}</p>
          <p className="text-sm text-muted-foreground">Subjects Active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {Math.round(overallStats.completionRate)}%
          </p>
          <p className="text-sm text-muted-foreground">Success Rate</p>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CalendarDays, Settings, Target, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ExamSettings, InsertExamSettings } from "@shared/schema";

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateCountdown(targetDate: string): CountdownValues {
  const target = new Date(targetDate + "T00:00:00");
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold tabular-nums" data-testid={`countdown-${label.toLowerCase()}`}>
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function ExamCountdown() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [countdown, setCountdown] = useState<CountdownValues>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { data: settings, isLoading } = useQuery<ExamSettings | null>({
    queryKey: ["/api/exam-settings"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertExamSettings) => {
      const res = await apiRequest("POST", "/api/exam-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exam-settings"] });
      setDialogOpen(false);
      toast({ title: "Exam settings saved" });
    },
    onError: () => {
      toast({ title: "Failed to save exam settings", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (settings) {
      setExamName(settings.examName);
      setExamDate(settings.examDate);
      setTargetScore(settings.targetScore?.toString() ?? "");
    }
  }, [settings]);

  useEffect(() => {
    if (!settings?.examDate) return;

    const updateCountdown = () => {
      setCountdown(calculateCountdown(settings.examDate));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [settings?.examDate]);

  const handleSave = () => {
    if (!examName.trim() || !examDate) {
      toast({ title: "Please fill in exam name and date", variant: "destructive" });
      return;
    }
    saveMutation.mutate({
      examName: examName.trim(),
      examDate,
      targetScore: targetScore ? parseInt(targetScore, 10) : undefined,
    });
  };

  const isExamPassed = settings?.examDate && new Date(settings.examDate) < new Date();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Exam Countdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-2/3" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="exam-countdown-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Exam Countdown
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-exam-settings">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Exam Settings</DialogTitle>
              <DialogDescription>
                Set your exam date to track your preparation countdown
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="examName">Exam Name</Label>
                <Input
                  id="examName"
                  placeholder="e.g., HSC Board Exam 2025"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  data-testid="input-exam-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examDate">Exam Date</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  data-testid="input-exam-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetScore">Target Score (%)</Label>
                <Input
                  id="targetScore"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 90"
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  data-testid="input-target-score"
                />
              </div>
              <Button
                onClick={handleSave}
                className="w-full"
                disabled={saveMutation.isPending}
                data-testid="button-save-exam-settings"
              >
                {saveMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!settings ? (
          <div className="text-center py-4">
            <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mt-2">No exam date set</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setDialogOpen(true)}
              data-testid="button-set-exam-date"
            >
              Set Exam Date
            </Button>
          </div>
        ) : isExamPassed ? (
          <div className="text-center py-4">
            <Target className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="font-medium mt-2">{settings.examName}</p>
            <p className="text-sm text-muted-foreground">Exam date has passed</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-medium text-sm" data-testid="text-exam-name">
                {settings.examName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(settings.examDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex justify-center gap-4 py-2">
              <CountdownUnit value={countdown.days} label="Days" />
              <div className="text-2xl font-bold text-muted-foreground self-start pt-0.5">:</div>
              <CountdownUnit value={countdown.hours} label="Hours" />
              <div className="text-2xl font-bold text-muted-foreground self-start pt-0.5">:</div>
              <CountdownUnit value={countdown.minutes} label="Mins" />
              <div className="text-2xl font-bold text-muted-foreground self-start pt-0.5">:</div>
              <CountdownUnit value={countdown.seconds} label="Secs" />
            </div>

            {settings.targetScore && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <Target className="h-4 w-4" />
                <span>Target: {settings.targetScore}%</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

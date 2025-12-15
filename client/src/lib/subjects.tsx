import {
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BookOpen,
  Languages,
  Monitor,
  TrendingUp,
  Receipt,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { HSC_SUBJECTS, type SubjectId } from "@shared/schema";

const iconMap: Record<string, LucideIcon> = {
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BookOpen,
  Languages,
  Monitor,
  TrendingUp,
  Receipt,
  Briefcase,
};

export function getSubjectIcon(subjectId: SubjectId): LucideIcon {
  const subject = HSC_SUBJECTS.find((s) => s.id === subjectId);
  if (subject && iconMap[subject.icon]) {
    return iconMap[subject.icon];
  }
  return BookOpen;
}

export function getSubjectName(subjectId: SubjectId): string {
  const subject = HSC_SUBJECTS.find((s) => s.id === subjectId);
  return subject?.name ?? "Unknown Subject";
}

// Subject color mapping for visual distinction
const subjectColors: Record<SubjectId, { bg: string; text: string; border: string }> = {
  physics: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  chemistry: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  mathematics: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  biology: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  english: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  hindi: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  computer: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
  economics: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  accountancy: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
  business: { bg: "bg-slate-100 dark:bg-slate-900/30", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-800" },
};

export function getSubjectColors(subjectId: SubjectId) {
  return subjectColors[subjectId] ?? subjectColors.english;
}

// Format minutes to readable string
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Get today's date in YYYY-MM-DD format
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// Get dates for current week
export function getCurrentWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

import { pgTable, text, varchar, boolean, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// HSC Subjects for 12th board examination
export const HSC_SUBJECTS = [
  { id: "physics", name: "Physics", icon: "Atom" },
  { id: "chemistry", name: "Chemistry", icon: "FlaskConical" },
  { id: "mathematics", name: "Mathematics", icon: "Calculator" },
  { id: "biology", name: "Biology", icon: "Dna" },
  { id: "english", name: "English", icon: "BookOpen" },
  { id: "hindi", name: "Hindi", icon: "Languages" },
  { id: "computer", name: "Computer Science", icon: "Monitor" },
  { id: "economics", name: "Economics", icon: "TrendingUp" },
  { id: "accountancy", name: "Accountancy", icon: "Receipt" },
  { id: "business", name: "Business Studies", icon: "Briefcase" },
] as const;

export type SubjectId = typeof HSC_SUBJECTS[number]["id"];

// Task priority levels
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

// Task status
export const TASK_STATUSES = ["pending", "in_progress", "completed"] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Tasks table for study tracking
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: text("subject_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  estimatedMinutes: integer("estimated_minutes").notNull().default(30),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  notes: text("notes"),
});

// Subject progress tracking
export const subjectProgress = pgTable("subject_progress", {
  id: varchar("id").primaryKey(),
  subjectId: text("subject_id").notNull(),
  chaptersCompleted: integer("chapters_completed").notNull().default(0),
  totalChapters: integer("total_chapters").notNull().default(10),
  lastStudied: text("last_studied"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
}).extend({
  title: z.string().min(1, "Task title is required"),
  subjectId: z.string().min(1, "Subject is required"),
  date: z.string().min(1, "Date is required"),
  estimatedMinutes: z.number().min(5).max(480),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
});

export const insertSubjectProgressSchema = createInsertSchema(subjectProgress).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertSubjectProgress = z.infer<typeof insertSubjectProgressSchema>;
export type SubjectProgress = typeof subjectProgress.$inferSelect;

// Helper types for frontend
export interface DailySchedule {
  date: string;
  tasks: Task[];
  totalMinutes: number;
  completedMinutes: number;
}

export interface SubjectStats {
  subjectId: SubjectId;
  subjectName: string;
  totalTasks: number;
  completedTasks: number;
  totalMinutes: number;
  completedMinutes: number;
  progress: SubjectProgress | null;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  dailyStats: {
    date: string;
    tasksCompleted: number;
    totalTasks: number;
    minutesStudied: number;
  }[];
  totalTasksCompleted: number;
  totalMinutesStudied: number;
}

import {
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type SubjectProgress,
  type InsertSubjectProgress,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task methods
  getAllTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  getTasksByDate(date: string): Promise<Task[]>;
  getTasksBySubject(subjectId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Subject progress methods
  getAllSubjectProgress(): Promise<SubjectProgress[]>;
  getSubjectProgress(subjectId: string): Promise<SubjectProgress | undefined>;
  upsertSubjectProgress(progress: InsertSubjectProgress): Promise<SubjectProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private subjectProgress: Map<string, SubjectProgress>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.subjectProgress = new Map();
    
    // Initialize with some sample tasks for demo
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0];

    const sampleTasks: InsertTask[] = [
      {
        title: "Complete Chapter 5 - Laws of Motion",
        description: "Study Newton's laws and solve practice problems",
        subjectId: "physics",
        date: today,
        estimatedMinutes: 60,
        status: "completed",
        priority: "high",
        notes: "Focus on numerical problems",
      },
      {
        title: "Organic Chemistry - Alcohols",
        description: "Learn reactions and mechanisms of alcohols",
        subjectId: "chemistry",
        date: today,
        estimatedMinutes: 45,
        status: "pending",
        priority: "high",
        notes: null,
      },
      {
        title: "Integration Practice",
        description: "Solve integration by parts problems",
        subjectId: "mathematics",
        date: today,
        estimatedMinutes: 90,
        status: "pending",
        priority: "medium",
        notes: null,
      },
      {
        title: "Essay Writing Practice",
        description: "Write an essay on current affairs topic",
        subjectId: "english",
        date: today,
        estimatedMinutes: 40,
        status: "completed",
        priority: "low",
        notes: null,
      },
      {
        title: "Cell Division - Mitosis",
        description: "Study phases of mitosis with diagrams",
        subjectId: "biology",
        date: tomorrow,
        estimatedMinutes: 50,
        status: "pending",
        priority: "medium",
        notes: "Draw diagrams for each phase",
      },
      {
        title: "Thermodynamics - Second Law",
        description: "Understand entropy and Carnot engine",
        subjectId: "physics",
        date: tomorrow,
        estimatedMinutes: 75,
        status: "pending",
        priority: "high",
        notes: null,
      },
      {
        title: "Differential Equations",
        description: "Solve first-order differential equations",
        subjectId: "mathematics",
        date: dayAfter,
        estimatedMinutes: 60,
        status: "pending",
        priority: "medium",
        notes: null,
      },
      {
        title: "Chemical Bonding Review",
        description: "Revise hybridization and molecular geometry",
        subjectId: "chemistry",
        date: dayAfter,
        estimatedMinutes: 45,
        status: "pending",
        priority: "low",
        notes: null,
      },
    ];

    sampleTasks.forEach((task) => {
      const id = randomUUID();
      this.tasks.set(id, { ...task, id, description: task.description ?? null, notes: task.notes ?? null });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByDate(date: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter((task) => task.date === date);
  }

  async getTasksBySubject(subjectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.subjectId === subjectId
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      id,
      title: insertTask.title,
      description: insertTask.description ?? null,
      subjectId: insertTask.subjectId,
      date: insertTask.date,
      estimatedMinutes: insertTask.estimatedMinutes,
      status: insertTask.status,
      priority: insertTask.priority,
      notes: insertTask.notes ?? null,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;

    const updated: Task = {
      id,
      title: updates.title ?? existing.title,
      description: updates.description !== undefined ? updates.description : existing.description,
      subjectId: updates.subjectId ?? existing.subjectId,
      date: updates.date ?? existing.date,
      estimatedMinutes: updates.estimatedMinutes ?? existing.estimatedMinutes,
      status: updates.status ?? existing.status,
      priority: updates.priority ?? existing.priority,
      notes: updates.notes !== undefined ? updates.notes : existing.notes,
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Subject progress methods
  async getAllSubjectProgress(): Promise<SubjectProgress[]> {
    return Array.from(this.subjectProgress.values());
  }

  async getSubjectProgress(subjectId: string): Promise<SubjectProgress | undefined> {
    return this.subjectProgress.get(subjectId);
  }

  async upsertSubjectProgress(progress: InsertSubjectProgress): Promise<SubjectProgress> {
    const existing = this.subjectProgress.get(progress.subjectId);
    const id = existing?.id ?? randomUUID();
    const updated: SubjectProgress = {
      id,
      subjectId: progress.subjectId,
      chaptersCompleted: progress.chaptersCompleted,
      totalChapters: progress.totalChapters,
      lastStudied: progress.lastStudied ?? null,
    };
    this.subjectProgress.set(progress.subjectId, updated);
    return updated;
  }
}

export const storage = new MemStorage();

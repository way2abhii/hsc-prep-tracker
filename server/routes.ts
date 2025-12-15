import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertExamSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // GET tasks by date
  app.get("/api/tasks/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const tasks = await storage.getTasksByDate(date);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // GET tasks by subject
  app.get("/api/tasks/subject/:subjectId", async (req, res) => {
    try {
      const { subjectId } = req.params;
      const tasks = await storage.getTasksBySubject(subjectId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // GET single task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  // POST create task
  app.post("/api/tasks", async (req, res) => {
    try {
      const parseResult = insertTaskSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid task data",
          details: parseResult.error.errors 
        });
      }
      const task = await storage.createTask(parseResult.data);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // PATCH update task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getTask(id);
      if (!existing) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Partial validation - allow partial updates
      const partialSchema = insertTaskSchema.partial();
      const parseResult = partialSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid update data",
          details: parseResult.error.errors 
        });
      }

      const updated = await storage.updateTask(id, parseResult.data);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // DELETE task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // GET all subject progress
  app.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getAllSubjectProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // GET subject progress by subject
  app.get("/api/progress/:subjectId", async (req, res) => {
    try {
      const { subjectId } = req.params;
      const progress = await storage.getSubjectProgress(subjectId);
      if (!progress) {
        return res.status(404).json({ error: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // POST/PUT upsert subject progress
  app.post("/api/progress", async (req, res) => {
    try {
      const { subjectId, chaptersCompleted, totalChapters } = req.body;
      if (!subjectId) {
        return res.status(400).json({ error: "Subject ID is required" });
      }
      const progress = await storage.upsertSubjectProgress({
        subjectId,
        chaptersCompleted: chaptersCompleted ?? 0,
        totalChapters: totalChapters ?? 10,
        lastStudied: new Date().toISOString().split("T")[0],
      });
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // GET exam settings
  app.get("/api/exam-settings", async (req, res) => {
    try {
      const settings = await storage.getExamSettings();
      res.json(settings ?? null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exam settings" });
    }
  });

  // POST/PUT upsert exam settings
  app.post("/api/exam-settings", async (req, res) => {
    try {
      const parseResult = insertExamSettingsSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid exam settings data",
          details: parseResult.error.errors,
        });
      }
      const settings = await storage.upsertExamSettings(parseResult.data);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update exam settings" });
    }
  });

  return httpServer;
}

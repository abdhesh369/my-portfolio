// backend/src/routes.ts
import type { Express } from "express";
import type { Server } from "http";
import { z } from "zod";
import { api } from "../../shared/routes";
import { storage } from "./storage";
import { seedDatabase } from "./seed";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // ------------------- GET ROUTES -------------------
  const createGetHandler = <T>(getter: () => Promise<T>) => async (_req: any, res: any) => {
    try {
      const data = await getter();
      res.json(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: "Failed to fetch data" });
    }
  };

  app.get(api.projects.list.path, createGetHandler(() => storage.getProjects()));
  app.get(api.skills.list.path, createGetHandler(() => storage.getSkills()));
  app.get(api.experiences.list.path, createGetHandler(() => storage.getExperiences()));

  // ------------------- POST ROUTES -------------------
  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json({ success: true, message: "Message sent successfully", data: message });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ------------------- SEED DATABASE (SAFE) -------------------
  seedDatabase()
    .then(() => console.log("Database seeding checked/completed."))
    .catch(err => console.error("Database seeding error:", err));

  return httpServer;
}

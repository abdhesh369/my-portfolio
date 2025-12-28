// backend/src/routes.ts
import type { Express } from "express";
import type { Server } from "http";
import { z } from "zod";
import { api } from "../../shared/routes";
import { storage } from "./storage";

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

  // ------------------- SEED DATABASE -------------------
  await seedDatabase();

  return httpServer;
}

// ------------------- SEED DATABASE -------------------
async function seedDatabase() {
  try {
    const projectsData = await storage.getProjects();
    if (projectsData.length > 0) return;

    console.log("Seeding database...");

    // Seed projects
    // Only update the seedDatabase function
    await storage.createProject({
      title: "Calculator Application",
      description: "A comprehensive calculator with scientific functions.",
      techStack: ["React", "CSS"], // ✅ array
      imageUrl: "https://images.unsplash.com/photo-1587145820266-a5951ee1f620?q=80&w=800&auto=format&fit=crop",
      category: "Utility",
      githubUrl: "https://github.com",
      liveUrl: "",
      problemStatement: "Users needed a convenient way to perform scientific calculations.",
      motivation: "Built to demonstrate complex state management in React.",
      systemDesign: "Component-based React architecture with utility math functions.",
      challenges: "Implementing correct parenthesis evaluation.",
      learnings: "Improved React state and event handling.",
    });



    // Seed skills
    await storage.createSkill({ name: "C", category: "Languages", icon: "Code" });
    await storage.createSkill({ name: "C++", category: "Languages", icon: "Code2" });
    await storage.createSkill({ name: "Python", category: "Languages", icon: "Snake" });
    await storage.createSkill({ name: "JavaScript", category: "Web", icon: "FileJson" });

    // Seed experiences
    await storage.createExperience({
      role: "Student",
      organization: "Tribhuvan University",
      period: "2024 – 2028",
      description: "B.E. in Electronics & Communication Engineering",
      type: "Education",
    });

    // Seed a test message
    await storage.createMessage({
      name: "Seed User",
      email: "seed@example.com",
      subject: "Seed",
      message: "Seeding initial message",
    });

    console.log("✅ Database seeded successfully");
  } catch (err) {
    console.error("❌ Database seeding failed:", err);
    throw err;
  }
}

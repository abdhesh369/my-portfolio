// backend/routes.ts
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage"; // backend/storage.ts
import { api } from "@shared/routes"; // shared/routes.ts
import { z } from "zod";
import { db } from "./db"; // backend/db.ts
import { projects, skills, experiences } from "../../shared/schema"; // shared/schema.ts

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET /projects
  app.get(api.projects.list.path, async (_req, res) => {
    const data = await storage.getProjects();

    // Parse techStack JSON string to array
    const parsedData = data.map(project => ({
      ...project,
      techStack: JSON.parse(project.techStack) as string[],
    }));

    res.json(parsedData);
  });

  // GET /skills
  app.get(api.skills.list.path, async (_req, res) => {
    const data = await storage.getSkills();
    res.json(data);
  });

  // GET /experiences
  app.get(api.experiences.list.path, async (_req, res) => {
    const data = await storage.getExperiences();
    res.json(data);
  });

  // POST /messages
  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      await storage.createMessage(input);
      res.status(201).json({
        success: true,
        message: "Message sent successfully",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Unexpected error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed database if empty
  await seedDatabase();

  return httpServer;
}

/* ---------------- SEED DATABASE ---------------- */

async function seedDatabase() {
  try {
    const existingProjects = await storage.getProjects();
    console.log("Existing projects:", existingProjects.length);

    if (existingProjects.length > 0) return;

    console.log("Seeding database...");

    // Insert projects (convert techStack array to JSON string)
    await db.insert(projects).values([
      {
        title: "Calculator Application",
        description: "A comprehensive calculator with scientific functions.",
        techStack: JSON.stringify(["React", "CSS"]),
        imageUrl: "https://images.unsplash.com/photo-1587145820266-a5951ee1f620?q=80&w=800&auto=format&fit=crop",
        category: "Utility",
        githubUrl: "https://github.com",
        problemStatement: "Users needed a convenient way to perform scientific calculations.",
        motivation: "Built to demonstrate complex state management in React.",
        systemDesign: "Component-based React architecture with utility math functions.",
        challenges: "Implementing correct parenthesis evaluation.",
        learnings: "Improved React state and event handling.",
      },
      {
        title: "Student Record & Marksheet System",
        description: "C++ based student record management system.",
        techStack: JSON.stringify(["C++", "File Handling"]),
        imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop",
        category: "Academic",
        githubUrl: "https://github.com",
        problemStatement: "Manual marksheet management was inefficient.",
        motivation: "Academic project to practice file persistence.",
        systemDesign: "Binary file storage with structured records.",
        challenges: "Maintaining data consistency.",
        learnings: "Strong understanding of file I/O in C++.",
      },
      {
        title: "8085 Assembly Programs",
        description: "Optimized assembly programs for 8085.",
        techStack: JSON.stringify(["8085", "Assembly"]),
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
        category: "System",
        githubUrl: "https://github.com",
        problemStatement: "Low-level programming requires hands-on practice.",
        motivation: "Understand CPU instruction cycles.",
        systemDesign: "Reusable arithmetic subroutines.",
        challenges: "Limited registers and instructions.",
        learnings: "Deep understanding of CPU architecture.",
      },
      {
        title: "Python Utilities & Scripts",
        description: "Automation scripts for productivity.",
        techStack: JSON.stringify(["Python"]),
        imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=800&auto=format&fit=crop",
        category: "Utility",
        githubUrl: "https://github.com",
        problemStatement: "Manual repetitive tasks wasted time.",
        motivation: "Improve productivity via automation.",
        systemDesign: "Modular CLI-based scripts.",
        challenges: "Handling edge cases in file formats.",
        learnings: "Advanced Python standard library usage.",
      },
      {
        title: "Django Backend Systems",
        description: "Scalable backend architecture using Django.",
        techStack: JSON.stringify(["Python", "Django", "PostgreSQL"]),
        imageUrl: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop",
        category: "Backend",
        githubUrl: "https://github.com",
        problemStatement: "Need for scalable backend systems.",
        motivation: "Learn real-world backend design.",
        systemDesign: "REST APIs with relational database.",
        challenges: "Query optimization.",
        learnings: "ORM optimization and API security.",
      },
    ]);

    // Insert skills
    await db.insert(skills).values([
      { name: "C", category: "Languages", icon: "Code" },
      { name: "C++", category: "Languages", icon: "Code2" },
      { name: "Python", category: "Languages", icon: "Snake" },
      { name: "Java", category: "Languages", icon: "Coffee" },
      { name: "HTML/CSS", category: "Web", icon: "Layout" },
      { name: "JavaScript", category: "Web", icon: "FileJson" },
      { name: "8085 Microprocessor", category: "System", icon: "Cpu" },
      { name: "Data Structures", category: "Core", icon: "Database" },
    ]);

    // Insert experiences
    await db.insert(experiences).values([
      {
        role: "Student",
        organization: "Tribhuvan University",
        period: "2024 – 2028",
        description: "B.E. in Electronics & Communication Engineering",
        type: "Education",
      },
    ]);

    console.log("✅ Database seeded successfully");
  } catch (err) {
    console.error("❌ Database seeding failed:", err);
    throw err;
  }
}
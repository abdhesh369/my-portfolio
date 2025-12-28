// backend/src/seed.ts
import { storage } from "./storage";

export async function seedDatabase() {
  try {
    // Check if projects already exist
    const projectsData = await storage.getProjects();
    if (projectsData.length > 0) return;

    console.log("Seeding database...");

    // ------------------- PROJECTS -------------------
    const projectsList = [
      {
        title: "Calculator Application",
        description: "A comprehensive calculator with scientific functions.",
        techStack: ["React", "CSS"],
        imageUrl: "https://images.unsplash.com/photo-1587145820266-a5951ee1f620?q=80&w=800&auto=format&fit=crop",
        category: "Utility",
        githubUrl: "https://github.com",
        liveUrl: "", // Required field
        problemStatement: "Users needed a convenient way to perform scientific calculations.",
        motivation: "Built to demonstrate complex state management in React.",
        systemDesign: "Component-based React architecture with utility math functions.",
        challenges: "Implementing correct parenthesis evaluation.",
        learnings: "Improved React state and event handling.",
      },
      {
        title: "Student Record & Marksheet System",
        description: "C++ based student record management system.",
        techStack: ["C++", "File Handling"],
        imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop",
        category: "Academic",
        githubUrl: "https://github.com",
        liveUrl: "",
        problemStatement: "Manual marksheet management was inefficient.",
        motivation: "Academic project to practice file persistence.",
        systemDesign: "Binary file storage with structured records.",
        challenges: "Maintaining data consistency.",
        learnings: "Strong understanding of file I/O in C++.",
      },
    ];

    for (const proj of projectsList) {
      await storage.createProject(proj);
    }

    // ------------------- SKILLS -------------------
    const skillsList = [
      { name: "C", category: "Languages", icon: "Code" },
      { name: "C++", category: "Languages", icon: "Code2" },
      { name: "Python", category: "Languages", icon: "Snake" },
      { name: "JavaScript", category: "Web", icon: "FileJson" },
    ];

    for (const skill of skillsList) {
      await storage.createSkill(skill);
    }

    // ------------------- EXPERIENCES -------------------
    const experiencesList = [
      {
        role: "Student",
        organization: "Tribhuvan University",
        period: "2024 – 2028",
        description: "B.E. in Electronics & Communication Engineering",
        type: "Education",
      },
    ];

    for (const exp of experiencesList) {
      await storage.createExperience(exp);
    }

    // ------------------- MESSAGES -------------------
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

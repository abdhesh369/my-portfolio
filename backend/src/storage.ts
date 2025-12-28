import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  projectsTable,
  skillsTable,
  experiencesTable,
  messagesTable,
  type Project,
  type Skill,
  type Experience,
  type Message,
  type InsertMessage,
  type InsertProject,
  type InsertSkill,
  type InsertExperience,
} from "../../shared/schema";

// Logging utility (consistent with other files)
function log(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✓";
  console.log(`${prefix} [${timestamp}] [STORAGE] ${message}`);
}

// Helper function to safely parse JSON
function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    log(`Failed to parse JSON: ${json}`, "error");
    return fallback;
  }
}

// Helper function to transform project from DB format to API format
function transformProject(dbProject: any): Project {
  return {
    id: dbProject.id,
    title: dbProject.title ?? "",
    description: dbProject.description ?? "",
    imageUrl: dbProject.imageUrl ?? "",
    category: dbProject.category ?? "",
    techStack: safeJsonParse<string[]>(dbProject.techStack, []),
    githubUrl: dbProject.githubUrl ?? null,
    liveUrl: dbProject.liveUrl ?? null,
    problemStatement: dbProject.problemStatement ?? null,
    motivation: dbProject.motivation ?? null,
    systemDesign: dbProject.systemDesign ?? null,
    challenges: dbProject.challenges ?? null,
    learnings: dbProject.learnings ?? null,
  };
}

export class DatabaseStorage {
  // ==================== PROJECTS ====================
  
  async getProjects(): Promise<Project[]> {
    try {
      const result = await db.select().from(projectsTable).all();
      return result.map(transformProject);
    } catch (error) {
      log(`Failed to get projects: ${error}`, "error");
      throw new Error("Failed to fetch projects from database");
    }
  }

  async getProjectById(id: number): Promise<Project | null> {
    try {
      const result = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, id))
        .get();
      
      return result ? transformProject(result) : null;
    } catch (error) {
      log(`Failed to get project ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch project with id ${id}`);
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      // Validate required fields
      if (!project.title || !project.description) {
        throw new Error("Title and description are required");
      }

      const inserted = await db
        .insert(projectsTable)
        .values({
          ...project,
          techStack: JSON.stringify(project.techStack ?? []),
        })
        .returning()
        .get();

      log(`Created project: ${inserted.title}`);
      return transformProject(inserted);
    } catch (error) {
      log(`Failed to create project: ${error}`, "error");
      throw error;
    }
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    try {
      const updates: any = { ...project };
      
      // Handle techStack JSON conversion
      if (project.techStack) {
        updates.techStack = JSON.stringify(project.techStack);
      }

      const updated = await db
        .update(projectsTable)
        .set(updates)
        .where(eq(projectsTable.id, id))
        .returning()
        .get();

      if (!updated) {
        throw new Error(`Project with id ${id} not found`);
      }

      log(`Updated project: ${updated.title}`);
      return transformProject(updated);
    } catch (error) {
      log(`Failed to update project ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteProject(id: number): Promise<void> {
    try {
      const deleted = await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, id))
        .returning()
        .get();

      if (!deleted) {
        throw new Error(`Project with id ${id} not found`);
      }

      log(`Deleted project: ${deleted.title}`);
    } catch (error) {
      log(`Failed to delete project ${id}: ${error}`, "error");
      throw error;
    }
  }

  // ==================== SKILLS ====================

  async getSkills(): Promise<Skill[]> {
    try {
      const result = await db.select().from(skillsTable).all();
      return result.map((s) => ({
        id: s.id,
        name: s.name ?? "",
        category: s.category ?? "",
        icon: s.icon ?? "",
      }));
    } catch (error) {
      log(`Failed to get skills: ${error}`, "error");
      throw new Error("Failed to fetch skills from database");
    }
  }

  async getSkillById(id: number): Promise<Skill | null> {
    try {
      const result = await db
        .select()
        .from(skillsTable)
        .where(eq(skillsTable.id, id))
        .get();
      
      return result
        ? {
            id: result.id,
            name: result.name ?? "",
            category: result.category ?? "",
            icon: result.icon ?? "",
          }
        : null;
    } catch (error) {
      log(`Failed to get skill ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch skill with id ${id}`);
    }
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    try {
      if (!skill.name || !skill.category) {
        throw new Error("Name and category are required");
      }

      const inserted = await db
        .insert(skillsTable)
        .values(skill)
        .returning()
        .get();

      log(`Created skill: ${inserted.name}`);
      return {
        id: inserted.id,
        name: inserted.name ?? "",
        category: inserted.category ?? "",
        icon: inserted.icon ?? "",
      };
    } catch (error) {
      log(`Failed to create skill: ${error}`, "error");
      throw error;
    }
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill> {
    try {
      const updated = await db
        .update(skillsTable)
        .set(skill)
        .where(eq(skillsTable.id, id))
        .returning()
        .get();

      if (!updated) {
        throw new Error(`Skill with id ${id} not found`);
      }

      log(`Updated skill: ${updated.name}`);
      return {
        id: updated.id,
        name: updated.name ?? "",
        category: updated.category ?? "",
        icon: updated.icon ?? "",
      };
    } catch (error) {
      log(`Failed to update skill ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteSkill(id: number): Promise<void> {
    try {
      const deleted = await db
        .delete(skillsTable)
        .where(eq(skillsTable.id, id))
        .returning()
        .get();

      if (!deleted) {
        throw new Error(`Skill with id ${id} not found`);
      }

      log(`Deleted skill: ${deleted.name}`);
    } catch (error) {
      log(`Failed to delete skill ${id}: ${error}`, "error");
      throw error;
    }
  }

  // ==================== EXPERIENCES ====================

  async getExperiences(): Promise<Experience[]> {
    try {
      const result = await db.select().from(experiencesTable).all();
      return result.map((e) => ({
        id: e.id,
        role: e.role ?? "",
        organization: e.organization ?? "",
        period: e.period ?? "",
        description: e.description ?? "",
        type: e.type ?? "",
      }));
    } catch (error) {
      log(`Failed to get experiences: ${error}`, "error");
      throw new Error("Failed to fetch experiences from database");
    }
  }

  async getExperienceById(id: number): Promise<Experience | null> {
    try {
      const result = await db
        .select()
        .from(experiencesTable)
        .where(eq(experiencesTable.id, id))
        .get();
      
      return result
        ? {
            id: result.id,
            role: result.role ?? "",
            organization: result.organization ?? "",
            period: result.period ?? "",
            description: result.description ?? "",
            type: result.type ?? "",
          }
        : null;
    } catch (error) {
      log(`Failed to get experience ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch experience with id ${id}`);
    }
  }

  async createExperience(exp: InsertExperience): Promise<Experience> {
    try {
      if (!exp.role || !exp.organization || !exp.period) {
        throw new Error("Role, organization, and period are required");
      }

      const inserted = await db
        .insert(experiencesTable)
        .values(exp)
        .returning()
        .get();

      log(`Created experience: ${inserted.role} at ${inserted.organization}`);
      return {
        id: inserted.id,
        role: inserted.role ?? "",
        organization: inserted.organization ?? "",
        period: inserted.period ?? "",
        description: inserted.description ?? "",
        type: inserted.type ?? "",
      };
    } catch (error) {
      log(`Failed to create experience: ${error}`, "error");
      throw error;
    }
  }

  async updateExperience(id: number, exp: Partial<InsertExperience>): Promise<Experience> {
    try {
      const updated = await db
        .update(experiencesTable)
        .set(exp)
        .where(eq(experiencesTable.id, id))
        .returning()
        .get();

      if (!updated) {
        throw new Error(`Experience with id ${id} not found`);
      }

      log(`Updated experience: ${updated.role}`);
      return {
        id: updated.id,
        role: updated.role ?? "",
        organization: updated.organization ?? "",
        period: updated.period ?? "",
        description: updated.description ?? "",
        type: updated.type ?? "",
      };
    } catch (error) {
      log(`Failed to update experience ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteExperience(id: number): Promise<void> {
    try {
      const deleted = await db
        .delete(experiencesTable)
        .where(eq(experiencesTable.id, id))
        .returning()
        .get();

      if (!deleted) {
        throw new Error(`Experience with id ${id} not found`);
      }

      log(`Deleted experience: ${deleted.role}`);
    } catch (error) {
      log(`Failed to delete experience ${id}: ${error}`, "error");
      throw error;
    }
  }

  // ==================== MESSAGES ====================

  async getMessages(): Promise<Message[]> {
    try {
      const result = await db.select().from(messagesTable).all();
      return result.map((m) => ({
        id: m.id,
        name: m.name ?? "",
        email: m.email ?? "",
        subject: m.subject ?? "",
        message: m.message ?? "",
        createdAt: m.createdAt ?? new Date().toISOString(),
      }));
    } catch (error) {
      log(`Failed to get messages: ${error}`, "error");
      throw new Error("Failed to fetch messages from database");
    }
  }

  async getMessageById(id: number): Promise<Message | null> {
    try {
      const result = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.id, id))
        .get();
      
      return result
        ? {
            id: result.id,
            name: result.name ?? "",
            email: result.email ?? "",
            subject: result.subject ?? "",
            message: result.message ?? "",
            createdAt: result.createdAt ?? new Date().toISOString(),
          }
        : null;
    } catch (error) {
      log(`Failed to get message ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch message with id ${id}`);
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      // Validate required fields
      if (!message.name || !message.email || !message.message) {
        throw new Error("Name, email, and message are required");
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(message.email)) {
        throw new Error("Invalid email format");
      }

      const inserted = await db
        .insert(messagesTable)
        .values(message)
        .returning()
        .get();

      log(`Created message from: ${inserted.name} (${inserted.email})`);
      return {
        id: inserted.id,
        name: inserted.name ?? "",
        email: inserted.email ?? "",
        subject: inserted.subject ?? "",
        message: inserted.message ?? "",
        createdAt: inserted.createdAt ?? new Date().toISOString(),
      };
    } catch (error) {
      log(`Failed to create message: ${error}`, "error");
      throw error;
    }
  }

  async deleteMessage(id: number): Promise<void> {
    try {
      const deleted = await db
        .delete(messagesTable)
        .where(eq(messagesTable.id, id))
        .returning()
        .get();

      if (!deleted) {
        throw new Error(`Message with id ${id} not found`);
      }

      log(`Deleted message from: ${deleted.name}`);
    } catch (error) {
      log(`Failed to delete message ${id}: ${error}`, "error");
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
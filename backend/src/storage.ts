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
    log(`Failed to parse JSON: ${error}`, "warn");
    return fallback;
  }
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ==================== TRANSFORM FUNCTIONS ====================

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

function transformSkill(dbSkill: any): Skill {
  return {
    id: dbSkill.id,
    name: dbSkill.name ?? "",
    category: dbSkill.category ?? "",
    icon: dbSkill.icon ?? "",
  };
}

function transformExperience(dbExp: any): Experience {
  return {
    id: dbExp.id,
    role: dbExp.role ?? "",
    organization: dbExp.organization ?? "",
    period: dbExp.period ?? "",
    description: dbExp.description ?? "",
    type: dbExp.type ?? "",
  };
}

function transformMessage(dbMsg: any): Message {
  return {
    id: dbMsg.id,
    name: dbMsg.name ?? "",
    email: dbMsg.email ?? "",
    subject: dbMsg.subject ?? "",
    message: dbMsg.message ?? "",
    createdAt: dbMsg.createdAt ?? new Date().toISOString(),
  };
}

// ==================== DATABASE STORAGE CLASS ====================

export class DatabaseStorage {
  // Simple in-memory cache for read-heavy data (skills, experiences)
  private skillsCache: Skill[] | null = null;
  private experiencesCache: Experience[] | null = null;
  private cacheTimestamp: Record<string, number> = {};
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL for Render

  // Invalidate cache when data changes
  private invalidateSkillsCache() {
    this.skillsCache = null;
    delete this.cacheTimestamp["skills"];
  }

  private invalidateExperiencesCache() {
    this.experiencesCache = null;
    delete this.cacheTimestamp["experiences"];
  }

  // ==================== PROJECTS ====================

  async getProjects(): Promise<Project[]> {
    try {
      const start = Date.now();
      const result = await db.select().from(projectsTable).all();
      const duration = Date.now() - start;
      log(`Fetched ${result.length} projects in ${duration}ms`);
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
      // Check cache (for Render's ephemeral storage optimization)
      const now = Date.now();
      if (
        this.skillsCache &&
        this.cacheTimestamp["skills"] &&
        now - this.cacheTimestamp["skills"] < this.CACHE_TTL
      ) {
        log("Returning cached skills");
        return this.skillsCache;
      }

      const start = Date.now();
      const result = await db.select().from(skillsTable).all();
      const duration = Date.now() - start;

      const transformed = result.map(transformSkill);
      this.skillsCache = transformed;
      this.cacheTimestamp["skills"] = now;

      log(`Fetched ${result.length} skills in ${duration}ms`);
      return transformed;
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
      return result ? transformSkill(result) : null;
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

      this.invalidateSkillsCache();
      log(`Created skill: ${inserted.name}`);
      return transformSkill(inserted);
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

      this.invalidateSkillsCache();
      log(`Updated skill: ${updated.name}`);
      return transformSkill(updated);
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

      this.invalidateSkillsCache();
      log(`Deleted skill: ${deleted.name}`);
    } catch (error) {
      log(`Failed to delete skill ${id}: ${error}`, "error");
      throw error;
    }
  }

  // ==================== EXPERIENCES ====================

  async getExperiences(): Promise<Experience[]> {
    try {
      // Check cache
      const now = Date.now();
      if (
        this.experiencesCache &&
        this.cacheTimestamp["experiences"] &&
        now - this.cacheTimestamp["experiences"] < this.CACHE_TTL
      ) {
        log("Returning cached experiences");
        return this.experiencesCache;
      }

      const start = Date.now();
      const result = await db.select().from(experiencesTable).all();
      const duration = Date.now() - start;

      const transformed = result.map(transformExperience);
      this.experiencesCache = transformed;
      this.cacheTimestamp["experiences"] = now;

      log(`Fetched ${result.length} experiences in ${duration}ms`);
      return transformed;
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
      return result ? transformExperience(result) : null;
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

      this.invalidateExperiencesCache();
      log(`Created experience: ${inserted.role} at ${inserted.organization}`);
      return transformExperience(inserted);
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

      this.invalidateExperiencesCache();
      log(`Updated experience: ${updated.role}`);
      return transformExperience(updated);
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

      this.invalidateExperiencesCache();
      log(`Deleted experience: ${deleted.role}`);
    } catch (error) {
      log(`Failed to delete experience ${id}: ${error}`, "error");
      throw error;
    }
  }

  // ==================== MESSAGES ====================

  async getMessages(): Promise<Message[]> {
    try {
      const start = Date.now();
      const result = await db.select().from(messagesTable).all();
      const duration = Date.now() - start;
      log(`Fetched ${result.length} messages in ${duration}ms`);
      return result.map(transformMessage);
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
      return result ? transformMessage(result) : null;
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

      // Email validation
      if (!isValidEmail(message.email)) {
        throw new Error("Invalid email format");
      }

      // Sanitize message (basic protection)
      const sanitized = {
        ...message,
        name: message.name.trim().slice(0, 255),
        email: message.email.trim().toLowerCase(),
        subject: (message.subject ?? "").trim().slice(0, 500),
        message: message.message.trim().slice(0, 5000),
      };

      const inserted = await db
        .insert(messagesTable)
        .values(sanitized)
        .returning()
        .get();

      log(`Created message from: ${inserted.name} (${inserted.email})`);
      return transformMessage(inserted);
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
// backend/storage.ts
import { db, sqlite } from "./db";
import {
  projects,
  skills,
  experiences,
  messages,
  type Project,
  type Skill,
  type Experience,
  type Message,
  type InsertMessage,
} from "../../shared/schema";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getSkills(): Promise<Skill[]>;
  getExperiences(): Promise<Experience[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    try {
      // With Drizzle + better-sqlite3, execute query synchronously
      const result: any[] = db.select().from(projects) as any;
      console.log("Projects fetched, count:", result.length);

      // Parse techStack from JSON string to array
      return result.map(project => ({
        ...project,
        techStack: JSON.parse(project.techStack as string) as string[]
      }));
    } catch (error) {
      console.error("Database error in getProjects:", error);
      console.error("Error details:", error instanceof Error ? error.stack : String(error));
      throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getSkills(): Promise<Skill[]> {
    try {
      // With Drizzle + better-sqlite3, execute query synchronously
      const result: Skill[] = db.select().from(skills) as any;
      console.log("Skills fetched successfully, count:", result.length);
      return result;
    } catch (error) {
      console.error("Database error in getSkills:", error);
      console.error("Error details:", error instanceof Error ? error.stack : String(error));
      throw new Error(`Failed to fetch skills: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getExperiences(): Promise<Experience[]> {
    try {
      const result: Experience[] = db.select().from(experiences) as any;
      return result;
    } catch (error) {
      console.error("Database error in getExperiences:", error);
      throw new Error(`Failed to fetch experiences: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
}

// Singleton instance for easy import
export const storage = new DatabaseStorage();
// backend/storage.ts
import { db } from "./db";
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
} from "../shared/schema";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getSkills(): Promise<Skill[]>;
  getExperiences(): Promise<Experience[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  async getSkills(): Promise<Skill[]> {
    return db.select().from(skills);
  }

  async getExperiences(): Promise<Experience[]> {
    return db.select().from(experiences);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
}

// Singleton instance for easy import
export const storage = new DatabaseStorage();

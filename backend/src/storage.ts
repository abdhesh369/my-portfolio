// backend/src/storage.ts
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
} from "../../shared/schema";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getSkills(): Promise<Skill[]>;
  getExperiences(): Promise<Experience[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  createProject(project: Omit<Project, "id">): Promise<Project>;
  createSkill(skill: Omit<Skill, "id">): Promise<Skill>;
  createExperience(exp: Omit<Experience, "id">): Promise<Experience>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    const result = await db.select().from(projects).all();
    return result.map(p => ({ ...p, techStack: JSON.parse(p.techStack as string) }));
  }

  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills).all();
  }

  async getExperiences(): Promise<Experience[]> {
    return await db.select().from(experiences).all();
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    return await db.insert(messages).values(insertMessage).returning().get();
  }

  async createProject(project: Omit<Project, "id">): Promise<Project> {
  // Convert techStack array to string for DB
  const inserted = await db
    .insert(projects)
    .values({ ...project, techStack: JSON.stringify(project.techStack) })
    .returning()
    .get();

  // Convert back to array before returning
  return { ...inserted, techStack: JSON.parse(inserted.techStack as string) };
}


  async createSkill(skill: Omit<Skill, "id">): Promise<Skill> {
    return await db.insert(skills).values(skill).returning().get();
  }

  async createExperience(exp: Omit<Experience, "id">): Promise<Experience> {
    return await db.insert(experiences).values(exp).returning().get();
  }
}

export const storage = new DatabaseStorage();

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ------------------- DATABASE TABLES -------------------

export const projectsTable = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  techStack: text("techStack").notNull().default("[]"), // JSON string array
  imageUrl: text("imageUrl").notNull(),
  githubUrl: text("githubUrl"),
  liveUrl: text("liveUrl"),
  category: text("category").notNull(),
  problemStatement: text("problemStatement"),
  motivation: text("motivation"),
  systemDesign: text("systemDesign"),
  challenges: text("challenges"),
  learnings: text("learnings"),
});

export const skillsTable = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull().default("Code"),
});

export const experiencesTable = sqliteTable("experiences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role").notNull(),
  organization: text("organization").notNull(),
  period: text("period").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("Experience"),
});

export const messagesTable = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
});

// ------------------- DRIZZLE-ZOD BASE SCHEMAS -------------------

// Base schemas generated from tables
export const selectProjectSchema = createSelectSchema(projectsTable);
export const insertProjectSchema = createInsertSchema(projectsTable);

export const selectSkillSchema = createSelectSchema(skillsTable);
export const insertSkillSchema = createInsertSchema(skillsTable);

export const selectExperienceSchema = createSelectSchema(experiencesTable);
export const insertExperienceSchema = createInsertSchema(experiencesTable);

export const selectMessageSchema = createSelectSchema(messagesTable);
export const insertMessageSchema = createInsertSchema(messagesTable);

// ------------------- CUSTOM API SCHEMAS WITH VALIDATION -------------------

// Project with parsed techStack array
export const projectSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  techStack: z.array(z.string()),
  imageUrl: z.string().url("Must be a valid URL"),
  githubUrl: z.string().nullable(),
  liveUrl: z.string().nullable(),
  category: z.string().min(1, "Category is required"),
  problemStatement: z.string().nullable(),
  motivation: z.string().nullable(),
  systemDesign: z.string().nullable(),
  challenges: z.string().nullable(),
  learnings: z.string().nullable(),
});

export const insertProjectApiSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  techStack: z.array(z.string()).default([]),
  imageUrl: z.string().url("Must be a valid URL"),
  githubUrl: z.string().url().nullable().optional(),
  liveUrl: z.string().url().nullable().optional(),
  category: z.string().min(1, "Category is required"),
  problemStatement: z.string().nullable().optional(),
  motivation: z.string().nullable().optional(),
  systemDesign: z.string().nullable().optional(),
  challenges: z.string().nullable().optional(),
  learnings: z.string().nullable().optional(),
});

export const skillSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  icon: z.string(),
});

export const insertSkillApiSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  icon: z.string().default("Code"),
});

export const experienceSchema = z.object({
  id: z.number(),
  role: z.string().min(1, "Role is required"),
  organization: z.string().min(1, "Organization is required"),
  period: z.string().min(1, "Period is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string(),
});

export const insertExperienceApiSchema = z.object({
  role: z.string().min(1, "Role is required"),
  organization: z.string().min(1, "Organization is required"),
  period: z.string().min(1, "Period is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().default("Experience"),
});

export const messageSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
  subject: z.string(),
  message: z.string().min(1, "Message is required"),
  createdAt: z.string(),
});

export const insertMessageApiSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
  subject: z.string().default(""),
  message: z.string().min(1, "Message is required"),
});

// ------------------- TYPESCRIPT TYPES -------------------

// Select types (what comes from DB)
export type SelectProject = typeof projectsTable.$inferSelect;
export type SelectSkill = typeof skillsTable.$inferSelect;
export type SelectExperience = typeof experiencesTable.$inferSelect;
export type SelectMessage = typeof messagesTable.$inferSelect;

// Insert types (what goes into DB) - using API schemas for validation
export type InsertProject = z.infer<typeof insertProjectApiSchema>;
export type InsertSkill = z.infer<typeof insertSkillApiSchema>;
export type InsertExperience = z.infer<typeof insertExperienceApiSchema>;
export type InsertMessage = z.infer<typeof insertMessageApiSchema>;

// API types (what the API returns/accepts)
export type Project = z.infer<typeof projectSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Message = z.infer<typeof messageSchema>;

// ------------------- TYPE GUARDS -------------------

export function isProject(obj: any): obj is Project {
  return projectSchema.safeParse(obj).success;
}

export function isSkill(obj: any): obj is Skill {
  return skillSchema.safeParse(obj).success;
}

export function isExperience(obj: any): obj is Experience {
  return experienceSchema.safeParse(obj).success;
}

export function isMessage(obj: any): obj is Message {
  return messageSchema.safeParse(obj).success;
}
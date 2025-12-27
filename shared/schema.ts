// shared/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  techStack: text("tech_stack").notNull(), // Stored as JSON string in DB
  imageUrl: text("image_url").notNull(),
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  category: text("category").notNull(),
  problemStatement: text("problem_statement"),
  motivation: text("motivation"),
  systemDesign: text("system_design"),
  challenges: text("challenges"),
  learnings: text("learnings"),
});

// Infer the DB type (techStack is string here)
type ProjectFromDB = typeof projects.$inferSelect;

// Export the application type with parsed techStack
export type Project = Omit<ProjectFromDB, 'techStack'> & {
  techStack: string[]; // Array in application code
};

export type InsertProject = typeof projects.$inferInsert;

// ... rest of your schema (skills, experiences, messages)

export const skills = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

export const experiences = sqliteTable("experiences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role").notNull(),
  organization: text("organization").notNull(),
  period: text("period").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
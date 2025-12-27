// shared/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/* ---------------------------------- */
/* Tables */
/* ---------------------------------- */

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  techStack: text("tech_stack").notNull(), // store as JSON string
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

export const skills = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  icon: text("icon"),
});

export const experiences = sqliteTable("experiences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role").notNull(),
  organization: text("organization").notNull(),
  period: text("period").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
});

/* ---------------------------------- */
/* Select Schemas */
/* ---------------------------------- */

export const projectSchema = createSelectSchema(projects);
export const skillSchema = createSelectSchema(skills);
export const experienceSchema = createSelectSchema(experiences);
export const messageSchema = createSelectSchema(messages);

/* ---------------------------------- */
/* Insert Schemas (with validation) */
/* ---------------------------------- */

export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true })
  .extend({
    techStack: z.array(z.string()), // convert array to JSON when inserting
  });

export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });

export const insertExperienceSchema = createInsertSchema(experiences).omit({ id: true });

export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true })
  .extend({
    email: z.string().email(),
    name: z.string().min(1),
    message: z.string().min(1),
  });

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

export type Project = typeof projects.$inferSelect & { techStack: string[] };
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

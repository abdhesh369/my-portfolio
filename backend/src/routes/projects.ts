import { Router } from "express";
import { db } from "../db";

const router = Router();

// Get all projects
router.get("/", async (_req, res) => {
  try {
    const projects = await db.all("SELECT * FROM projects");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

export default router;

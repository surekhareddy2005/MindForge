import express from "express";
import {
  createSession,
  getSessionsByCourse,
  deleteSession
} from "../controllers/sessionController.js";

import { protect, mentorOnly } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", protect, mentorOnly, createSession);
router.delete("/:sessionId", protect, mentorOnly, deleteSession);
router.get("/:courseId", getSessionsByCourse);

export default router;
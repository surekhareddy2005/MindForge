import express from "express";
import {
  createModule,
  getModulesByCourse,
  deleteModule
} from "../controllers/moduleController.js";

import { protect, mentorOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, mentorOnly, createModule);
router.delete("/:moduleId", protect, mentorOnly, deleteModule);
router.get("/:courseId", protect, getModulesByCourse);

export default router;
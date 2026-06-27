import express from "express";
import { createCourse, getCourses, getMyCourses, updateCourse, deleteCourse } from "../controllers/courseController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createCourse);
router.get("/", protect, getCourses);
router.get("/my", protect, getMyCourses);
router.put("/:id", protect, adminOnly, updateCourse);
router.delete("/:id", protect, adminOnly, deleteCourse);

export default router;
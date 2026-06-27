import express from "express";
import { submitFeedback, getMentorFeedback, getSessionFeedback, getAverageRating, getStudentFeedbacks } from "../controllers/feedbackController.js";
import { protect, mentorOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student routes
router.post("/", protect, submitFeedback);
router.get("/student", protect, getStudentFeedbacks);

// Mentor routes
router.get("/mentor", protect, mentorOnly, getMentorFeedback);
router.get("/session/:sessionId", protect, mentorOnly, getSessionFeedback);

// Public routes
router.get("/average/:userId", getAverageRating);

export default router;

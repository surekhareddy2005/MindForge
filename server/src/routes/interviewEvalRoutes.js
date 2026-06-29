import express from "express";
import { evaluateInterviewAnswer } from "../controllers/interviewEvalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/evaluate", protect, evaluateInterviewAnswer);

export default router;
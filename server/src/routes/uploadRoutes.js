import express from "express";
import {
  uploadFiles,
  getUploadsBySession,
  getAllUserUploads,
  generateTranscriptForUpload,
  generatePdfForUpload,
  generateFlashcardsForUpload,
  generateInterviewForUpload,
  generateQuizForUpload,
  getUploadPdf,
  getUploadStatus,
  getFlashcards,
  getInterviewQuestions,
  getQuiz,
  deleteUpload,
} from "../controllers/uploadController.js";
import { protect, mentorOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.delete("/:uploadId", protect, mentorOnly, deleteUpload);


router.post(
  "/",
  protect,
  mentorOnly,
  upload.array("files"),
  uploadFiles
);

router.get("/all", protect, getAllUserUploads);
router.get("/:sessionId", protect, getUploadsBySession);
router.post("/:uploadId/generate", protect, mentorOnly, generateTranscriptForUpload);
router.post("/:uploadId/pdf", protect, mentorOnly, generatePdfForUpload);
router.post("/:uploadId/flashcards", protect, mentorOnly, generateFlashcardsForUpload);
router.post("/:uploadId/interview", protect, mentorOnly, generateInterviewForUpload);
router.post("/:uploadId/quiz", protect, mentorOnly, generateQuizForUpload);

router.get("/status/:uploadId", protect, getUploadStatus);
router.get("/pdf/:uploadId", protect, getUploadPdf);
router.get("/flashcards/:sessionId", protect, getFlashcards);
router.get("/interview/:sessionId", protect, getInterviewQuestions);
router.get("/quiz/:sessionId", protect, getQuiz);

export default router;
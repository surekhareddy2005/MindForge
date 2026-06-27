import express from "express";
import { handleChat, getChatHistory, clearChatHistory, deleteChatThread, getCredits } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All chat routes should be protected
router.use(protect);

router.post("/", handleChat);
router.get("/user/credits", getCredits);
router.get("/:sessionId", getChatHistory);
router.delete("/:sessionId", clearChatHistory);
router.delete("/thread/:chatId", deleteChatThread);

export default router;

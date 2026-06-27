import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    topic: {
      type: String,
      default: "General Discussion"
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// We now allow multiple chats per student/session, differentiated by topic or ID
// chatSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;

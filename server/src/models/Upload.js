import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session"
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  originalname: String,
  filename: String,
  size: Number,
  mimetype: String,
  isProcessed: {
    type: Boolean,
    default: false
  },

  audioUrl: String,
  fileUrls: [String],

  // 🔥 AI Output
  transcript: String,
  pdfUrl: String,

  status: {
    type: String,
    enum: ["idle", "processing", "completed", "failed"],
    default: "idle"
  },
  flashcardsGenerated: {
    type: Boolean,
    default: false
  },
  interviewGenerated: {
    type: Boolean,
    default: false
  },
  quizGenerated: {
    type: Boolean,
    default: false
  },
  pdfGenerated: {
    type: Boolean,
    default: false
  },
  lastError: String
});

export default mongoose.model("Upload", uploadSchema);
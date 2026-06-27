import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  uploadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Upload"
  },
  questions: [
    {
      question: String,
      options: [String], // 4 options
      correctAnswer: String, // The correct option text
      explanation: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Quiz", quizSchema);

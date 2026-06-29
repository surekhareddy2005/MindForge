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
      options: [String],
      correctAnswer: String,
      correctIndex: Number,
      explanation: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Quiz", quizSchema);
import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
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
      answer: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Interview", interviewSchema);

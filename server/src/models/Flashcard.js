import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  uploadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Upload"
  },
  cards: [
    {
      topic: String,
      description: String // Approximately 10 lines
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Flashcard", flashcardSchema);

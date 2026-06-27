import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

// 🚫 Prevent duplicate module names in same course
moduleSchema.index({ title: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Module", moduleSchema);
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module"
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  }
});

// Allowing multiple sessions per course on the same date (e.g., Morning and Afternoon)
sessionSchema.index({ courseId: 1, date: 1 }, { unique: false });

export default mongoose.model("Session", sessionSchema);
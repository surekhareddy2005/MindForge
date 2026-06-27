import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["student", "mentor", "admin"]
  },
  profilePicture: {
    type: String,
    default: ""
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  ],
  chatCredits: {
    type: Number,
    default: 50
  },
  lastCreditResetDate: {
    type: String,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model("User", userSchema);
import Session from "../models/Session.js";
import Course from "../models/Course.js";
import Upload from "../models/Upload.js";
import Flashcard from "../models/Flashcard.js";
import Interview from "../models/Interview.js";
import Quiz from "../models/Quiz.js";

export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) return res.status(404).json({ msg: "Session not found" });

    // Robust authorization: Check if the user is the creator OR a mentor of the course
    const course = await Course.findById(session.courseId);
    const isCreator = session.mentorId && session.mentorId.toString() === req.user._id.toString();
    const isCourseMentor = course && course.mentors.some(m => m.toString() === req.user._id.toString());

    if (!isCreator && !isCourseMentor) {
      return res.status(403).json({ msg: "Not authorized to delete this session" });
    }

    console.log(`[DeleteSession] Attempting to delete session: ${sessionId} for user: ${req.user._id}`);

    // Cascading delete everything related to this session
    const results = await Promise.all([
      Upload.deleteMany({ sessionId }),
      Flashcard.deleteMany({ sessionId }),
      Interview.deleteMany({ sessionId }),
      Quiz.deleteMany({ sessionId }),
      Session.findByIdAndDelete(sessionId)
    ]);

    console.log(`[DeleteSession] Success. Results:`, results);

    res.json({ msg: "Session and all associated materials deleted successfully" });
  } catch (error) {
    console.error("Delete session error:", error);
    res.status(500).json({ msg: "Failed to delete session" });
  }
};


export const createSession = async (req, res) => {
  try {
    const { title, courseId, moduleId } = req.body;

    if (!title || !courseId || !moduleId) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const mentorId = req.user._id;

    const course = await Course.findById(courseId);

    if (!course.mentors.includes(mentorId)) {
      return res.status(403).json({
        msg: "You are not assigned to this course"
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const session = await Session.create({
      title,
      courseId,
      moduleId,
      mentorId,
      date: today
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSessionsByCourse = async (req, res) => {
  const sessions = await Session.find({
    courseId: req.params.courseId
  })
    .populate("moduleId", "title")
    .populate("mentorId", "name");

  res.json(sessions);
};
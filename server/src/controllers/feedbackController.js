import Feedback from "../models/Feedback.js";
import Session from "../models/Session.js";
import Course from "../models/Course.js";

// @desc    Submit feedback for a session
// @route   POST /api/feedback
// @access  Private (Student)
export const submitFeedback = async (req, res) => {
  try {
    const { sessionId, rating, comment, isAnonymous } = req.body;
    const studentId = req.user._id;

    if (req.user.role !== "student") {
      return res.status(403).json({ msg: "Only students can submit session feedback" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    const course = await Course.findById(session.courseId);
    const isEnrolled = course && course.students.some(s => s.toString() === studentId.toString());
    if (!isEnrolled) {
      return res.status(403).json({ msg: "You are not enrolled in this session's course" });
    }

    const existingFeedback = await Feedback.findOne({ sessionId, studentId });
    if (existingFeedback) {
      return res.status(400).json({ msg: "You have already provided feedback for this session" });
    }

    const feedback = await Feedback.create({
      sessionId,
      studentId,
      mentorId: session.mentorId,
      rating,
      comment,
      isAnonymous: !!isAnonymous
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get feedback for a mentor's sessions
// @route   GET /api/feedback/mentor
// @access  Private (Mentor)
export const getMentorFeedback = async (req, res) => {
  try {
    const mentorId = req.user._id;

    const feedbacks = await Feedback.find({ mentorId })
      .populate("sessionId", "title date")
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    // Transform feedbacks to respect anonymity
    const sanitizedFeedbacks = feedbacks.map(f => {
      const feedback = f.toObject();
      if (feedback.isAnonymous) {
        feedback.studentId = { name: "Anonymous Student", email: "hidden" };
      }
      return feedback;
    });

    res.json(sanitizedFeedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get feedback for a specific session (Mentor)
// @route   GET /api/feedback/session/:sessionId
// @access  Private (Mentor)
export const getSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const mentorId = req.user._id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    if (session.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const feedbacks = await Feedback.find({ sessionId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    // Transform feedbacks to respect anonymity
    const sanitizedFeedbacks = feedbacks.map(f => {
      const feedback = f.toObject();
      if (feedback.isAnonymous) {
        feedback.studentId = { name: "Anonymous Student", email: "hidden" };
      }
      return feedback;
    });

    res.json(sanitizedFeedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get average rating for a user
// @route   GET /api/feedback/average/:userId
// @access  Public
export const getAverageRating = async (req, res) => {
  try {
    const { userId } = req.params;

    const feedbacks = await Feedback.find({ mentorId: userId });

    if (feedbacks.length === 0) {
      return res.json({ averageRating: 0, totalRatings: 0 });
    }

    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = (totalRating / feedbacks.length).toFixed(1);

    res.json({ averageRating: parseFloat(averageRating), totalRatings: feedbacks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all feedbacks submitted by the logged-in student
// @route   GET /api/feedback/student
// @access  Private (Student)
export const getStudentFeedbacks = async (req, res) => {
  try {
    const studentId = req.user._id;
    const feedbacks = await Feedback.find({ studentId });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import Module from "../models/Module.js";
import Course from "../models/Course.js";
import Session from "../models/Session.js";
import Upload from "../models/Upload.js";
import Flashcard from "../models/Flashcard.js";
import Interview from "../models/Interview.js";
import Quiz from "../models/Quiz.js";

export const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findById(moduleId);

    if (!module) return res.status(404).json({ msg: "Module not found" });

    // Check if mentor belongs to the course
    const course = await Course.findById(module.courseId);
    if (!course || !course.mentors.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ msg: "Not authorized to delete this module" });
    }

    // Find all sessions in this module to delete their contents too
    const sessions = await Session.find({ moduleId });
    const sessionIds = sessions.map(s => s._id);

    // Cascading delete everything!
    await Promise.all([
      Upload.deleteMany({ sessionId: { $in: sessionIds } }),
      Flashcard.deleteMany({ sessionId: { $in: sessionIds } }),
      Interview.deleteMany({ sessionId: { $in: sessionIds } }),
      Quiz.deleteMany({ sessionId: { $in: sessionIds } }),
      Session.deleteMany({ moduleId }),
      Module.findByIdAndDelete(moduleId)
    ]);

    res.json({ msg: "Module and all associated sessions/materials deleted successfully" });
  } catch (error) {
    console.error("Delete module error:", error);
    res.status(500).json({ msg: "Failed to delete module" });
  }
};


export const createModule = async (req, res) => {
  try {
    const { title, courseId } = req.body;

    // ✅ Check if mentor belongs to course
    const course = await Course.findById(courseId);

    if (!course || !course.mentors.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({
        msg: "You are not assigned to this course"
      });
    }

    const module = await Module.create({ title, courseId, mentorId: req.user._id });

    res.json(module);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        msg: "Module already exists in this course"
      });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const mentorId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    // Check if the user is authorized (mentor or student assigned to this course)
    const isMentor = course.mentors.some(m => m.toString() === req.user._id.toString());
    const isStudent = course.students.some(s => s.toString() === req.user._id.toString());
    
    if (!isMentor && !isStudent) {
      return res.status(403).json({ msg: "You are not authorized to view this course" });
    }

    // Get all modules for the course
    const modules = await Module.find({ courseId }).lean();

    // For each module, find the active days for the current mentor
    const modulesWithActiveDays = await Promise.all(
      modules.map(async (module) => {
        const sessions = await Session.find({
          moduleId: module._id
        }).select('date');

        const activeDays = [...new Set(sessions.map(s => s.date))];
        return {
          ...module,
          activeDays,
        };
      })
    );

    res.json(modulesWithActiveDays);
  } catch (error) {
    console.error("Get modules error:", error);
    res.status(500).json({ msg: "Failed to get modules" });
  }
};
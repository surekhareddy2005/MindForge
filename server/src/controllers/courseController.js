import Course from "../models/Course.js";

export const createCourse = async (req, res) => {
  const { title, mentors, students } = req.body;

  const course = await Course.create({ title, mentors, students });

  res.json(course);
};

export const getCourses = async (req, res) => {
  const courses = await Course.find()
    .populate("mentors", "name email isActive profilePicture")
    .populate("students", "name email isActive profilePicture");
  res.json(courses);
};

export const getMyCourses = async (req, res) => {
  let query = {};
  if (req.user.role === "mentor") {
    query = { mentors: req.user._id };
  } else if (req.user.role === "student") {
    query = { students: req.user._id };
  }

  const courses = await Course.find(query)
    .populate("mentors", "name email isActive profilePicture")
    .populate("students", "name email isActive profilePicture");

  res.json(courses);
};

export const updateCourse = async (req, res) => {
  const { title, mentors, students } = req.body;
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { title, mentors, students }, { new: true });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Error updating course" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course" });
  }
};
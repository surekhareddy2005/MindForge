import express from "express";
import User from "../models/User.js";
import { getStudents, getMentors, getProfile, updateProfile, updatePassword } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

// Import upload middleware early so it can be used for profile too
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/students", protect, getStudents);
router.get("/mentors", protect, getMentors);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profilePicture"), updateProfile);
router.put("/password", protect, updatePassword);

// Admin Routes
import { createUser, updateUserByAdmin, deleteUser, bulkCreateUsers } from "../controllers/userController.js";
import { adminOnly } from "../middleware/authMiddleware.js";

router.post("/", protect, adminOnly, upload.single("profilePicture"), createUser);
router.post("/bulk", protect, adminOnly, upload.single("file"), bulkCreateUsers);
router.put("/:id", protect, adminOnly, upload.single("profilePicture"), updateUserByAdmin);
router.delete("/:id", protect, adminOnly, deleteUser);
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    console.log(`Fetched ${users.length} users for admin`);
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
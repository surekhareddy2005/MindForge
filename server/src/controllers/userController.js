import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("-password");
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid current password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      profilePicture: req.file ? `/uploads/${req.file.filename}` : "",
      isActive: req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : true
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    
    if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePicture === "") {
      user.profilePicture = "";
    }
    
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const bulkCreateUsers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please upload a CSV or Excel file" });

    const XLSX = await import('xlsx');
    const fs = await import('fs');
    
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const usersToCreate = [];

    for (const row of data) {
      // Handle both cases: header matching and column index
      const name = row.name || row.Name || Object.values(row)[0];
      const email = row.email || row.Email || Object.values(row)[1];
      const password = row.password || row.Password || Object.values(row)[2];
      const role = row.role || row.Role || Object.values(row)[3];

      if (!name || !email || !password || !role) continue;

      const userExists = await User.findOne({ email });
      if (userExists) continue;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      usersToCreate.push({
        name,
        email,
        password: hashedPassword,
        role: role.toString().toLowerCase()
      });
    }

    if (usersToCreate.length === 0) {
      return res.status(400).json({ message: "No valid users found in file" });
    }

    const createdUsers = await User.insertMany(usersToCreate);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(201).json({ 
      message: `Successfully imported ${createdUsers.length} users`,
      count: createdUsers.length 
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ message: "Error processing bulk upload" });
  }
};

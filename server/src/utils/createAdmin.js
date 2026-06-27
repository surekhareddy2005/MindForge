import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "admin@mindforge.com";
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
    } else {
      const hashedPassword = await bcrypt.hash("admin@123", 10);
      await User.create({
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: "admin"
      });
      console.log("Admin user created successfully!");
      console.log("Email: admin@mindforge.com");
      console.log("Password: admin@123");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();

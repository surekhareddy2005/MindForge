import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

import courseRoutes from "./routes/courseRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

import uploadRoutes from "./routes/uploadRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import interviewEvalRoutes from "./routes/interviewEvalRoutes.js";
const app = express();

const allowedOrigins = [
  "https://mindforge-seven.vercel.app",
  "https://mindforge.live",
  "https://www.mindforge.live",
  "https://project-8714f.vercel.app",
  "https://project-mindforge.vercel.app", 
  "http://localhost:5173",
  "http://localhost:8081",
  "http://localhost:19006",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : [])
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Permissive match for local development, emulators, and physical test devices on Wi-Fi
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.startsWith("http://localhost:") || 
      origin.startsWith("http://127.0.0.1:") || 
      origin.startsWith("http://192.168.")
    ) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight response for 24 hours
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("MindForge server is running!");
});

export default app;
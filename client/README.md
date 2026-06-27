# 🖥️ MindForge — React Web Client

This workspace contains the **Vite + React** web application for **MindForge**. It serves as the primary administration portal for mentors and a fully immersive, animated study portal for students.

---

## 🎨 Features & Modules
* **Mentor Dashboard**: Upload, manage, and coordinate course lectures. Includes automatic processing status charts.
* **Analytics Center**: Visual charts mapping student comprehension, lecture ratings, and reviews in real-time.
* **Student AI Study Workspace**: Access smart transcripts, flip study cards, take assessments, and chat with the 24/7 custom-tailored AI tutor.
* **Luxury Glassmorphic Aesthetics**: Sleek dark-gold themed layouts, customized page transitions, responsive navigation, and micro-interactions.

---

## 📁 Directory Structure
```text
client/
├── src/
│   ├── components/      # Common UI components (Navbar, Sidebar, Charts, PageTransition)
│   ├── context/         # Auth, Notification, and Theme React contexts
│   ├── pages/           # High-level screens (Dashboard, Course Management, Study Workspace, Login)
│   ├── services/        # Centralized Axios API service adapters
│   ├── styles/          # Vanilla CSS style tokens and rules
│   └── App.jsx          # Route management and provider configurations
├── package.json         # Front-end dependencies
└── vite.config.js       # Bundling rules
```

---

## ⚡ Quick Start: Running Locally
Ensure the Express backend server is up and listening on port `5000`.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   *The application will boot and be accessible at `http://localhost:5173`.*

---

## 📖 Complete Documentation
For full information on the system's end-to-end data pipeline, database models, mobile clients, and RAG architectures, please refer to the master [README.md](../README.md) file in the root directory.

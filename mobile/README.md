# 📱 MindForge — React Native Mobile Client

This workspace contains the **Expo + React Native** mobile student application for **MindForge**. It is built in JavaScript to allow lightning-fast hot-reloading and features a complete replication of the study workspace tailored for Android and iOS screens.

---

## 🎨 Features & Modules
* **Sleek Mobile Landing Page**: Fully immersive introductory dashboard with feature grids, stats, testimonial carousels, and quick login actions.
* **Themed Alerts & Popups**: 100% custom-themed modal dialogue overlay system mapped to dark-gold tokens, replacing all native dialog prompts.
* **Interactive Player Deck**: Dynamic native audio streaming with status bars, seek bars, and background streaming capabilities via `expo-av`.
* **Mobile Quiz Portal**: Custom animated radio selections and review summaries for rapid exam preparations.
* **Context-Aware Tutor**: Floating chat interface designed for touch-screen mobile devices, grounded in active lecture transcripts.

---

## 📁 Directory Structure
```text
mobile/
├── assets/          # High-res icons, splash screens, and images
├── src/
│   ├── components/  # Mobile reusable elements (Logo, Custom Themed Modals)
│   ├── context/     # AlertContext, ThemeContext, and AuthContext trees
│   ├── navigation/  # Native Stack and Bottom Tab React Navigation graphs
│   ├── screens/     # Screen views (Landing, Login, Session Details, Study Workspace, Settings)
│   └── services/    # REST API endpoints mapping to local LAN gateways
├── App.js           # Core bootstrapper and context provider attachments
├── app.json         # Expo build settings and platform-specific bundle IDs
└── package.json     # Mobile dependencies
```

---

## ⚡ Quick Start: Running Locally
Make sure you are on the same local Wi-Fi network as the backend server and that the backend server's active IP is updated in API adapters.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Metro Bundler**:
   ```bash
   npm start
   ```
3. **Run on a Device**:
   - **Android**: Install **Expo Go** from Google Play and scan the terminal QR code.
   - **iOS**: Scan the QR code using your Apple camera with **Expo Go** installed from the App Store.

---

## 🚀 Production Builds
To bundle, sign, and build this application for the App Store and Google Play without a Mac, we utilize **EAS Build**. Please refer to the detailed [mobile_production_handout.md](../artifacts/mobile_production_handout.md) guide in the artifacts folder for full steps.

---

## 📖 Complete Documentation
For comprehensive information on the database, AI transcription/summary pipeline, web portals, and RAG architectures, see the master [README.md](../README.md) at the repository root.

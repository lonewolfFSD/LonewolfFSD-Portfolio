# 🐺 LonewolfFSD Portfolio

This is the complete source code behind [lonewolffsd.in](https://lonewolffsd.in) — my personal portfolio and interactive site, built from scratch. It includes everything from a custom store and authentication system to a real-time AI chatbot named Lyra.

[![Screenshot-2025-06-18-212234.png](https://i.postimg.cc/y6P1ZzvL/Screenshot-2025-06-18-212234.png)](https://postimg.cc/HjrDqFGM)

---

## 🚀 Features

### ⚙️ Full Stack Setup

* **React (Vite)** + **TypeScript**
* **Firebase**: Auth, Firestore, Storage, Functions
* **TailwindCSS** for UI
* **Framer Motion** for animations

### 🛒 Store System

* Product catalog, digital delivery
* Razorpay integration for purchases
* Download tracking

### 🔐 Auth System

* Email/password & Google login
* Role-based access with admin layer

### 🧠 Lyra Mini (Chatbot)

* Credit-based chat limit
* Real-time response system
* Whisper timeline for theme memory
* Voice mode with capped usage
* Image generation support (API key-based)

### 📘 Portfolio & Admin

* Dynamic content from Firestore
* Admin area to manage content
* Projects, contact, skills sections

---

## 📦 Technologies Used

* React + TypeScript
* Firebase (Full suite)
* Razorpay API
* TailwindCSS
* Framer Motion
* SpeechRecognition API (Voice mode)

---

## 🔧 Local Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/lonewolfFSD/LonewolfFSD-Portfolio.git
   cd LonewolfFSD-Portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your `.env` file with Firebase & Razorpay config:

   ```env
   VITE_GEMINI_API_KEY=...
   RAZORPAY_SECRET=...
   VITE_RAZORPAY_KEY_ID=...
   GOOGLE_SHEETS_CREDENTIALS=...
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

---

## ⚠️ Usage Terms

This repository is provided **for educational and reference purposes only**. You are **not** allowed to:

* Fork or redistribute this code as your own
* Copy/paste the **exact** layout, logic, or styling
* Sell any part of this code or reuse it in paid/commercial templates

You **can**:

* Explore and learn from the structure
* Get inspired by small elements
* Build your own version from scratch using different implementation logic

Please respect the effort that went into this project. If you're inspired, build your own version — don't clone mine.

---

## 🙏 Credits

Developed and designed by **[LonewolfFSD](https://github.com/lonewolfFSD)** — full stack developer, creator of [LyraLabs AI](https://lyralabs.lonewolffsd.in)

---

## 🛡️ License

**Not Open Source.**
This codebase is protected under a **custom limited license**.
No forks, no reselling, no reuploads.

---


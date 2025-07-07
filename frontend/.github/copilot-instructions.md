# 🤖 KNSTherapy – Copilot Instructions

Welcome to **KNSTherapy**, an anonymous, stigma-free mental health support platform. This document will guide GitHub Copilot (and developers) in understanding the structure, features, and goals of the project to assist in writing helpful, privacy-aware code.

---

## 🧭 Project Vision

**YourTherapy** exists to remove barriers to mental health care by offering secure, anonymous access to therapists, a support chatbot, and a peer-led community forum.

**Motto:** _“Healing, not headlines. Anonymity first, always.”_

Also there is provision for matching to specialist therapists in particular fields (e.g., trauma, anxiety, etc.) according to user needs.

---

## 💡 Features

### 1. 🔐 Anonymous Access
- Users sign in with **one-time session tokens**.
- No collection of emails, names, IPs, or personal metadata.
- All interactions are **end-to-end encrypted**.

### 2. 💬 Mental Health Chatbot
- First responder to user queries.
- Built with NLP tools (e.g., GPT, Rasa, or simple decision trees).
- Can detect crisis language and escalate to human therapist.
- Lives at: `src/chatbot/handler.js`

### 3. 👥 Community Forum (Optional Module)
- Fully anonymous text-based discussion forum.
- Post moderation tools and reporting system.
- Forum backend lives in `src/forum/` and uses PostgreSQL for thread storage with row-level privacy.

### 4. 🧑‍⚕️ Therapist Matching & Sessions
- Therapist queueing system (`src/matchmaking/`).
- Secure, real-time communication:
  - **Text chat** using WebSocket (w/ encryption layer).
  - **Optional voice calls** with pitch-shifting + identity masking.

---

##Tech Stack

### Frontend
- Framework: `Next.js`
- Styling: `TailwindCSS`
- Data: `React Query` + WebSocket client
- PWA-ready service worker for mobile usage

### Backend (Node.js)
- Framework: `express.js`
- MongoDB
- Realtime: `Socket.IO` for chat sessions
- Security: `WebCrypto` + ephemeral storage

---
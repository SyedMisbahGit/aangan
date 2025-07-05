# 🔇 Shhh - WhisperVerse  
**An anonymous, emotionally intelligent campus social platform with 3D immersive design**

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)  
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC.svg)](https://tailwindcss.com/)  
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)  
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ❓ What is Shhh?

**Shhh** is a revolutionary **anonymous social platform** designed for **Central University of Jammu (CUJ)** students. It blends emotional intelligence, cultural sensitivity, and a futuristic 3D experience to create a **safe space for self-expression and connection**.

---

## 🌐 Production URLs

- **Frontend (Vercel):** [https://college-whisper.vercel.app/](https://college-whisper.vercel.app/)
- **Backend (Railway):** [https://aangan-production.up.railway.app/api](https://aangan-production.up.railway.app/api)

---

## 🚚 Migration: Render → Railway + Vercel (v2.0.0)

- Migrated backend from Render to Railway (free tier)
- Removed Redis dependency, replaced with in-memory alternatives
- Switched SQLite to persistent volume on Railway
- Created new server entry point (`app.js`)
- Improved health checks and error handling
- Migrated frontend authentication from Supabase to custom AuthContext
- Updated all API endpoints to use new Railway backend
- Deployed frontend to Vercel for global CDN and PWA support

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Modern browser (ES6+)

### Installation (Development)

```bash
git clone https://github.com/SyedMisbahGit/college-whisper.git
cd college-whisper
npm install
npm run dev
```

### Environment Variables
- For local development, create a `.env` file:
  ```
  VITE_API_URL=https://aangan-production.up.railway.app/api
  ```

### Security & Backup

#### Environment Variables (Backend)
```bash
# Required for production
SOCKET_SHARED_KEY=your-secret-socket-key
ADMIN_PASS_HASH=$2a$10$your-bcrypt-hash-here
JWT_SECRET=your-super-secret-jwt-key
```

#### Database Backups
- **Automated**: Nightly backups via GitHub Actions (3 AM IST)
- **Manual**: Run `node scripts/backup-db.js` to create compressed backup
- **Location**: `backups/whispers-{timestamp}.gz`

#### Security Features
- **Socket.IO Authentication**: All real-time connections require `clientKey`
- **Rate Limiting**: Per-IP limits on whispers and socket messages
- **Content Moderation**: Pre-filter for inappropriate content
- **Admin Password Hashing**: bcrypt-encrypted admin passwords
- **Trust Proxy**: Proper IP detection for rate limiting

#### Stress Testing
```bash
# Install Artillery
npm install -g artillery

# Run stress test (25 virtual users for 2 minutes)
npx artillery run scripts/artillery.yml
```

---

## 🌌 WhisperVerse – The 3D Diary World

Experience the future of anonymous social media with:

- 🌐 **Floating Whisper Orbs** (mood-reactive)
- 🛕 **3D Shrine Portals** for emotional venting
- 🔤 **Kinetic Typography** that responds to mood
- ✨ **Dynamic Light Auras** reflecting campus-wide emotions
- 🌱 **Organic Motion** using neumorphism and perspective tilt

---

## 🔑 Key Features

### Core Platform
- 🕵️ **Anonymous Whispering** – Share without fear  
- 🔄 **Real-time Feed** – Campus pulse in your hands  
- 🤖 **Emotional Intelligence** – AI-powered mood detection  
- 🛡️ **Smart Moderation** – Community-led filtering  
- 🔐 **Privacy-First Design** – Secrets stay secrets

### CUJ-Specific
- 🧭 **CUJ Campus Pulse** – Live zones & activities  
- 🗣️ **Dogri-Hinglish Prompts** – Local language integration  
- 🏅 **Badge System** – Earn recognition  
- 🎉 **Campus Rituals** – Traditional & modern  
- 🌍 **Local Culture** – Jammu-specific flavor

---

## 🌀 WhisperVerse 3D

- 🫧 **Floating Diary Orbs**  
- ✨ **Whisper Constellations**  
- 🧠 **AI Whisper Clustering**  
- 🧭 **Smart Campus Discovery**  
- 🧘 **Emotion Slow Mode**  
- 📈 **Growth Tracker**

---

## 🎨 Design System

- 🎭 **Mood-Pulse Hybrid Themes**: Dormlight, InkBloom, Void  
- 🌫️ **Glassmorphism**  
- 🎥 **Kinetic Animations**  
- 🌑 **Dark Mode**  
- 🎯 **Responsive Design with Perspective Tilt**

---

## 🧠 Cultural Intelligence

- 🌐 **Dogri Integration**  
- 🏛️ **CUJ Context & Community Focus**  
- 🤝 **Cultural Sensitivity in UX**

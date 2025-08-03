# 🌸 Aangan - Dreamy Courtyard of Whispers  
**An emotionally intelligent, poetic anonymous social platform with a quiet, reflective atmosphere**

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)  
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC.svg)](https://tailwindcss.com/)  
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)  
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌙 What is Aangan?

**Aangan** (आंगन) is a **dreamy, poetic courtyard** where hearts find their voice in whispers. It's an emotionally intelligent anonymous social platform designed for **Central University of Jammu (CUJ)** students, creating a **quiet, reflective space** for gentle self-expression and connection.

*"Your Aangan keeps your silences safe"*

---

## 🌐 Production URLs

- **Frontend (Vercel):** [https://aangan.vercel.app/](https://aangan.vercel.app/)
- **Backend (Railway):** [https://aangan-production.up.railway.app/api](https://aangan-production.up.railway.app/api)

---

## ✨ Version 1.6 - Dreamy Courtyard Redesign

### 🌸 New Experience
- **Whispers** - Soft-scrollable whispers in light glass containers with floating emotion dots
- **Gentle Interactions** - Tap to open modal diary view, long-press to "Echo," swipe left to "Fade"
- **Poetic Presence** - Time-based poetic narration replacing emotion banners
- **Embedded Bench** - Composer as a bench at the bottom with "Sit for a while… What's on your heart today?"
- **Radial Bloom** - Emotion picker with optional AI whisper assistance

### 🏡 Navigation Transformation
- **Feed** → **Whispers** - The main courtyard experience
- **Explore** → **Wander** - Organic tiles: "🏡 Near Me," "✨ Under the Stars," "💭 What's Being Felt"
- **Lounge** → **Listen** - Velvet gradient background with whispers fading in like breath
- **Menu** → **My Corner** - Soft list with "Sit in Silence" toggle for candle-lit meditation

### 🕯️ New Features
- **Gentle Presence Ribbon** - Poetic presence text like "9 hearts sat here quietly today 🫧"
- **Sit in Silence** - Dims UI and lets whispers drift in every 15-20 seconds with candle flicker
- **Hidden Scrollbars** - Clean, minimal interface
- **No Counters** - Heart with ripple animation but no numbers
- **Auto-fading Elements** - Like incense smoke, gentle and ephemeral

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

### Project Structure (Vite Frontend)
- The frontend React app is located in the `frontend/` directory.
- The main Vite entry HTML is at `frontend/public/index.html`.
- The Vite config is at `config/vite.config.ts` and sets the root to `frontend`.
- All build/dev commands (`npm run dev`, `npm run build`) should be run from the project root.
- **Development-only dependency:** The frontend uses [`lovable-tagger`](https://www.npmjs.com/package/lovable-tagger) (devDependency) for component tagging in development mode. If you encounter build errors about this package, run `npm install` in the `frontend/` directory.

### Installation (Development)

```bash
# Clone and install dependencies
git clone https://github.com/SyedMisbahGit/aangan.git
cd aangan
npm install
npm run dev
```

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 🤝 Contributing

### Development Setup

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Set up environment**: Copy `backend/env.example` to `backend/.env`
4. **Start development server**: `npm run dev`

### Code Quality Standards

- **Linting**: `npm run lint` (must pass with zero warnings)
- **Testing**: `npm test` (must maintain 80% coverage)
- **Type Safety**: All TypeScript errors must be resolved
- **Commit Messages**: Use conventional commits format

### Pre-commit Hooks

The project uses Husky to enforce code quality:

```bash
# Install Husky (if not already installed)
npx husky-init && npm install

# Pre-commit hook will run:
# - npm run lint
# - npm test
```

### Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes following the code standards
3. Run tests: `npm test -- --coverage`
4. Run lint: `npm run lint -- --max-warnings=0`
5. Commit with conventional format: `feat: add new feature`
6. Push and create a PR

### CI/CD Pipeline

The GitHub Actions CI will:
- ✅ Run linting with zero warnings allowed
- ✅ Execute tests with 80% coverage threshold
- ✅ Build the project successfully
- ✅ Deploy to staging/production on merge to main

### Environment Variables

For local development, create a `.env` file:
```
VITE_API_URL=https://aangan-production.up.railway.app/api
TEST=false  # Set to true for shorter rate limits during testing
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

## 🌸 Aangan Experience

### 🏡 The Courtyard
- **Whispers** - Soft glass containers with gentle interactions
- **Floating Emotion Dots** - Mood indicators with poetic tooltips
- **Nested Replies** - Styled like folded paper, intimate and personal
- **Poetic Presence** - Time-based narration that speaks to the heart

### 🧘 Mindful Interactions
- **Tap** - Open modal diary view for deeper reflection
- **Long-press** - "Echo" a whisper, creating gentle ripples
- **Swipe Left** - "Fade" whispers away like morning mist
- **Heart** - Ripple animation without counters, pure emotion

### 🎨 Design Philosophy
- **Glassmorphism** - Light, blurred containers that feel ethereal
- **Gentle Animations** - Smooth transitions that don't startle
- **Poetic Language** - Every element speaks with intention
- **Minimal Interface** - Hidden scrollbars, clean lines
- **Candle-lit Moments** - "Sit in Silence" for meditation

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

### 🌸 New v1.6 Features
- 🏡 **Dreamy Courtyard** - Whispers in soft glass containers
- 🧘 **Mindful Interactions** - Tap, long-press, swipe with intention
- 🕯️ **Sit in Silence** - Meditation mode with candle flicker
- 🌸 **Poetic Presence** - Time-based emotional narration
- 🎨 **Gentle Design** - Auto-fading elements like incense smoke

---

## 🎨 Design System

- 🎭 **Mood-Pulse Hybrid Themes**: Dormlight, InkBloom, Void  
- 🌫️ **Glassmorphism** - Light, blurred, ethereal containers
- 🎥 **Gentle Animations** - Smooth, non-startling transitions
- 🌑 **Dark Mode** with candle-lit moments
- 🎯 **Responsive Design** with perspective tilt
- 🕯️ **Meditation Mode** - Dimmed UI with drifting whispers

---

## 🧠 Cultural Intelligence

- 🌐 **Dogri Integration**  
- 🏛️ **CUJ Context & Community Focus**  
- 🤝 **Cultural Sensitivity in UX**
- 🌸 **Poetic Language** - Every interaction speaks to the heart
- 🏡 **Courtyard Metaphor** - Safe, intimate, communal space

---

## 📱 Navigation Guide

### 🌸 Whispers (Home)
- Soft-scrollable feed of whispers
- Floating emotion dots with tooltips
- Embedded bench composer at bottom
- Gentle interactions: tap, long-press, swipe

### 🏡 Wander (Explore)
- **Near Me** - Local whispers and activities
- **Under the Stars** - Trending and popular content
- **What's Being Felt** - Emotional pulse of campus

### 🎧 Listen (Lounge)
- Velvet gradient background
- Whispers fade in slowly like breath
- No buttons or controls, pure listening
- Hidden scrollbars for clean experience

### 🏠 My Corner (Menu)
- **Diary** - Personal reflection space
- **Settings** - App configuration
- **About** - Platform information
- **Sit in Silence** - Meditation toggle with candle flicker

---

*"In the quiet corners of Aangan, every whisper finds its home"*

---

## ⚡ UX Shortcuts

- **Bench Composer**: The whisper composer is always visible as a soft bench at the bottom of the Whispers page. No floating + button—just tap the bench to start writing. The composer uses high-contrast, accessible styles for clarity.
- **SoftBack Button**: On any deep route (when history allows), a soft, fixed '← Back' button appears in the top-left. Tap to gently return to the previous screen—no need to refresh or lose your place.
- **Listen Swipe-to-Dismiss**: On mobile, swipe down anywhere in the Listen (Lounge) view to exit and return to the main app. The 'Press ESC to return' hint only appears on desktop.

---

## 🌟 Aangan v2.0 – “Alive & Real” UX Update (2025-07)

Aangan v2.0 is a major experience update focused on emotional clarity, accessibility, and real human presence:

- **Onboarding:** New 3-step, visual, progressive onboarding with clear purpose, how-to, and demo whispers. Skippable and accessible from Help.
- **Accessibility:** All inputs, modals, and flows now meet or exceed WCAG AA+ contrast, ARIA, and keyboard navigation standards. Focus-visible rings, animated error states, and prefers-reduced-motion support.
- **Home Feed:** Top 3 real whispers, clear ghost/real distinction, trending/zone logic, and live pulse/echo stream with animated transitions and confetti.
- **Composer:** Gentle feedback toast, reply ETA, fallback animation, and optional emotion tagging. Animated prompt, emotion/tag pickers, and send button.
- **AI Replies:** Clearly marked “WhisperBot replied”, “Whisper again” button, and “Did this help?” reactions with animated feedback.
- **Navigation:** Redesigned bottom nav with modern icons, tooltips, active highlight, and persistent floating Help overlay. All nav items are accessible.
- **Emotional Layer:** Affirmation after 3 whispers, private journal unlock after 5, with animated banners and confetti.
- **Analytics/Admin:** Local event tracking for onboarding, zone usage, and AI reply success/timeout, with animated analytics dashboard.
- **Animation & Polish:** All major flows feature smooth, accessible animations, micro-interactions, and visual polish. Full support for prefers-reduced-motion.

See `docs/UX_V2_ALIVE_AND_REAL.md` for a detailed breakdown.

---

## 🛠️ TypeScript & Error Handling Improvements (2025)

- All main pages now use <ErrorBoundary> and improved accessibility (ARIA, focus, semantic HTML).
- TypeScript config updated: ensure all relevant directories (e.g., lib/) are included in tsconfig.json and tsconfig.app.json.
- If you see TS6307 errors (file not listed in project), check your include patterns and restart your IDE/TypeScript server.
- Keep sample/mock data types in sync with TypeScript interfaces (e.g., id: number vs id: string).
- Use type guards or assertions for optional/extended properties (e.g., isGhost).
- Remove unsupported props from object literals and component calls (e.g., title/description in toast).

---

# Aangan Platform (vNext)

## Key Standards
- All pages/components use Suspense and error boundaries with animated skeletons and universal error pages.
- Analytics and error logging include session, route, and breadcrumbs.
- User feedback modal is required on all error pages.
- Storybook and MSW are used for all fallback UIs and network simulation.
- E2E, accessibility, and visual regression tests are required for all skeletons and error states.
- Offline banner and retry/report actions are required for robust UX.

## Docs
- See [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md), [UX_V2_ALIVE_AND_REAL.md](./UX_V2_ALIVE_AND_REAL.md), [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📝 July 2025 Interaction Audit
Aangan’s experience was fully audited for authenticity, poetry, and accessibility:
- Fake presence data removed (only real presence shown)
- Unified poetic onboarding
- Poetic error and empty states
- Full keyboard accessibility (ARIA, focus, tab order)

See [UX_V2_ALIVE_AND_REAL.md](./UX_V2_ALIVE_AND_REAL.md) for details.

---

## ✨ 2025 Feature Decisions & UI/UX Simplification

- **ModularWhisperCard**: UI is now lighter, with reduced borders, padding, and softer typography for a more organic, emotionally gentle feel.
- **ListeningCircle**: Feature fully removed from the platform and codebase.
- **EchoBack**: Now a gentle icon/gesture on ModularWhisperCard—no reply box or expanded input.
- **SharedSilence**: Hidden from all navigation and UI, but component remains in codebase for future use.
- **PresenceToast**: Replaced with a subtle ambient indicator (e.g., soft pulse near top bar/footer) instead of toast notifications.
- **WhisperPad**: Remains unchanged.
- **Cross-platform**: All changes apply to both desktop and mobile views.
- **Cleanup**: Related CSS, routes, and contexts have been updated/removed for consistency and maintainability.

See the main `README.md` for technical details and implementation notes.

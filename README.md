# ⚡ Campus Pulse

> **Intelligent Multi-Modal Notice Extractor & Weekly Campus Digest**  
> Built with Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, and powered server-side by Google Gemini 2.5 Flash (`@google/genai`).

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini_2.5_Flash-@google/genai-8e24aa?logo=google)](https://aistudio.google.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deploy_Ready-black?logo=vercel)](https://vercel.com/)

---

## 🎯 The Core Problem
University students are bombarded by fragmented updates across WhatsApp class groups, club circulars, emails, and physical event posters. Critical details—registration cutoffs, dress codes, eligible batches, and timing—get buried under noise.

**Campus Pulse** solves this with a single intelligent student command center:
1. **Paste unstructured WhatsApp forwards or upload poster images.**
2. **AI extracts and structures event details** into digestible, color-coded cue cards.
3. **Auto-expiration and urgency prioritization** ensures today's priorities never get lost.
4. **"What do I need to know this week?"** button generates a synthesized weekly digest on demand.

---

## ✨ Key Features & Architecture

### 1. 🛡️ Strict Server-Side Gemini Intelligence (`gemini-2.5-flash`)
- **Zero Client Leakage:** All AI operations run strictly inside `/app/api/extract/route.ts` and `/app/api/summary/route.ts` using `@google/genai` (`new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })`).
- **Structured JSON Schema:** Direct JSON schema enforcement (`responseMimeType: "application/json"`, `responseSchema`) guarantees structured notice properties (`title`, `date`, `time`, `venue`, `category`, `importantRules`, `summary`).
- **Image Discarding:** Poster images uploaded for OCR extraction are discarded immediately on the server after processing—only clean JSON is returned.

### 2. 🔒 Input Sanitization & Security (`/lib/sanitize.ts`)
- Strips `<script>`, `<iframe>`, `javascript:`, inline event handlers, and malicious HTML tags.
- Enforces a strict 4,000-character ceiling to prevent prompt-injection overflows.

### 3. ⏱️ Pure Auto-Expiration & Priority Engine (`/lib/priority.ts`)
- Pure function `getNoticePriority(noticeDate, todayStr)` comparing event dates against today's local date (`YYYY-MM-DD`):
  - **`noticeDate < todayStr`** ➔ `status: "expired"`, `label: "Expired"`, `needsAttentionToday: false`
  - **`noticeDate === todayStr` or `today + 1`** ➔ `status: "urgent"`, `label: "Urgent • Happening Soon"`, `needsAttentionToday: true`
  - **`noticeDate > today + 1`** ➔ `status: "upcoming"`, `label: "Upcoming"`, `needsAttentionToday: false`

### 4. 🖼️ Client-Side HTML5 Canvas Image Optimizer (`/lib/imageCompress.ts`)
- High-resolution poster photos taken by student smartphones often exceed 5MB–15MB.
- An in-browser HTML5 `<canvas>` utility automatically scales images down to max 800px width at 0.7 JPEG quality, drastically slashing payload sizes to ~80KB–150KB (over 90% reduction) and comfortably staying within Vercel's 4.5MB request limit.

### 5. 💧 Zero Hydration Errors with Client `isMounted` Pattern (`/hooks/useNotices.ts`)
- Accesses `localStorage` **strictly** inside client `useEffect` hooks after mounting, ensuring seamless SSR hydration on Vercel without mismatches.

### 6. 📱 Interactive Multimodal Dashboard
- **Top Highlight Carousel:** Swipeable "Needs Attention Today & This Week" horizontal strip with accessible Prev/Next navigation.
- **Multimodal Input Card:** Switch between text input and poster image upload, with an instant "Try Sample WhatsApp Notice" generator.
- **Dynamic Views:** Toggle between **Cue Card Grid View** and **Calendar / Date-Grouped View** (`Happening Today`, `Happening Tomorrow`, `Later This Week`, `Next Week & Beyond`, `Expired`).
- **Actionable Cue Cards:** Includes 1-click Google Calendar link generator, .ics file export, copy-to-clipboard, and collapsible rules checklists.
- **AI Weekly Digest Drawer:** Prominent header button labeled **`What do I need to know this week?`** synthesizing today's priorities, upcoming deadlines, and key guidelines.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/Yashfeen11/Campus_Pulse.git
cd Campus_Pulse
npm install
```

### 2. Configure Environment
Create a `.env.local` file:
```bash
cp .env.example .env.local
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)).*

> Note: The app includes intelligent heuristic fallbacks, so you can explore the dashboard and seed data even before setting up an API key!

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📂 Project Structure
```
├── app/
│   ├── api/
│   │   ├── extract/route.ts      # Backend Agent 1: Gemini 2.5 Flash Notice Extractor
│   │   └── summary/route.ts      # Backend Agent 2: Gemini 2.5 Flash Weekly Digest
│   ├── globals.css               # Design system, glassmorphism & animations
│   ├── layout.tsx                # App root layout, SEO & metadata
│   └── page.tsx                  # Main interactive dashboard
├── components/
│   ├── CalendarDateGroupedView.tsx # Chronological timeline view
│   ├── CueCard.tsx               # Rich cue card with calendar links & rules checklist
│   ├── FilterControls.tsx        # Search, priority tabs, category pills & view toggle
│   ├── HighlightStrip.tsx        # "Needs Attention Today & This Week" carousel
│   ├── MultimodalInputCard.tsx   # Text & canvas-compressed image input card
│   ├── Navbar.tsx                # Sticky navbar with weekly summary trigger
│   └── WeeklySummaryModal.tsx    # "What do I need to know this week?" digest modal
├── hooks/
│   └── useNotices.ts             # SSR-safe localStorage hook with isMounted
├── lib/
│   ├── calendar.ts               # Google Calendar web URL & .ics generator
│   ├── imageCompress.ts          # HTML5 Canvas client-side compressor (max 800px)
│   ├── priority.ts               # Pure auto-expiration & priority engine
│   ├── sampleNotices.ts          # Realistic messy WhatsApp notices
│   ├── sanitize.ts               # Strict 4k-char HTML/script sanitizer
│   └── seedData.ts               # Dynamic seed notices relative to new Date()
├── types/
│   └── notice.ts                 # NoticeItem, Category, & Priority types
├── tailwind.config.js            # Custom Tailwind theme & color tokens
└── tsconfig.json                 # Next.js TypeScript configuration
```

---

## 🚢 Deploying to Vercel
1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. In Project Settings > Environment Variables, add:
   - `GEMINI_API_KEY`: Your Gemini API key.
4. Deploy! Next.js App Router and serverless routes will be configured automatically.

---

## 📄 License
MIT © 2026 Campus Pulse

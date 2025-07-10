# 聖經讀經之旅 (Bible Reading Quest) - Project Plan

This document outlines the development plan for the Bible Reading Quest web application.

## 1. Project Goal

To create a web application that helps young Christians create, follow, and track a personalized Bible reading plan in a gamified and social way.

## 2. Core Features

1.  **User Authentication:** Secure login and registration using Supabase to save user progress and data.
2.  **Plan Generation:** A settings page for users to define their reading plan:
    *   Start Date
    *   Reading Order (OT -> NT, NT -> OT, Parallel)
    *   Chapters per day
3.  **Progress Calendar:** A calendar view showing the daily reading assignments. Users can click to mark days as complete.
4.  **Gamified Map Puzzle:** A 3D map of Israel divided into 66 puzzle pieces, one for each book of the Bible. Completing a book unlocks its piece.
    *   Pop-up encouragement messages for every 3 books completed.
    *   Fireworks animation upon completing all 66 books.
5.  **Leaderboard ("同行榜"):** A social leaderboard showing the progress of all users, grouped by the number of books they have completed.

## 3. Technology Stack

*   **Framework:** Next.js (with App Router)
*   **Language:** TypeScript
*   **Backend & DB:** Supabase (Auth, PostgreSQL, Storage)
*   **Styling:** Tailwind CSS
*   **3D Rendering:** Three.js / @react-three/fiber
*   **UI Components:** Native components, potentially with a library like shadcn/ui or NextUI later.
*   **Animations:** canvas-confetti for celebration effects.

## 4. File Structure Overview

```
/bible-reading-quest
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/              # Main app pages (protected)
│   │   ├── dashboard/page.tsx  # Calendar view
│   │   ├── leaderboard/page.tsx
│   │   ├── map/page.tsx
│   │   ├── plan/page.tsx
│   │   └── layout.tsx       # Layout for the main app
│   ├── api/                 # API routes
│   ├── globals.css
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   └── ui/                  # Reusable UI components (Button, Modal, etc.)
├── lib/
│   ├── bibleData.ts         # Data for Bible books and chapters
│   └── supabase/            # Supabase client and server helpers
├── public/
└── package.json
```

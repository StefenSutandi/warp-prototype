# WARP — Virtual Workspace Prototype

> A gamified virtual workspace for remote creative teams, built as a DKV design prototype.

WARP lets employees move around a Phaser-powered virtual office, interact with teammates, manage tasks, and track XP — while employers create tasks, review submissions, and manage their team from a dedicated dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Game Engine | [Phaser 3](https://phaser.io/) |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Language | TypeScript 5.7 |

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/StefenSutandi/warp-prototype.git
cd warp-prototype

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Features

### 🧑‍💻 Employee View
- **Virtual Room** — Phaser 3 canvas with a Figma-aligned office layout (room base, table, chairs, TV, door)
- **Avatar System** — Full avatar creation page + in-session colour customizer with live preview
- **Chair Interaction** — Multi-state chairs (`idle → hover → selected`) with "Sit" overlay
- **Teammate Presence** — Clickable teammate avatars with role cards and call status
- **Room Navigation** — Door portal that transitions between Main Office and Team Lounge
- **Task Panel** — Left sidebar with personal task list and XP progress
- **Room Chat** — Live chat panel with emoji picker and simulated coworker replies
- **Pomodoro Timer** — Focus session timer in the HUD
- **WASD / Arrow Movement** — Player avatar movement with focus-aware keyboard blocking

### 🏢 Employer View
- **Dashboard** — Stats, recent rooms, team overview, reward balance
- **Task Management** — Full task page with three views:
  - `My Tasks` — task cards with assignee, deadline, progress bar, status
  - `Task Detail` — description, bullet checklist, activity feed, attachments, comments
  - `Review Tasks` — submission review with preview images, approve / request-revision actions, image lightbox
- **Create Task Modal** — Assign tasks to teammates with multi-select and XP reward

---

## Project Structure

```
warp-prototype/
├── app/
│   ├── page.tsx                  # Landing — role selection
│   ├── employee/page.tsx         # Employee workspace
│   ├── employer/page.tsx         # Employer dashboard
│   └── avatar/page.tsx           # Avatar creation
├── components/
│   ├── virtual-room-layout.tsx   # Full employee UI shell
│   ├── employer-dashboard.tsx    # Employer sidebar + routing
│   ├── employer-task-management-page.tsx
│   ├── create-new-task-modal.tsx # Shared task creation modal
│   ├── avatar-creation-page.tsx
│   ├── avatar-customizer.tsx
│   └── ...
├── game/
│   ├── scenes/MainOfficeScene.ts # Primary Phaser scene
│   └── components/
│       ├── PhaserGame.tsx
│       └── PhaserGameDynamic.tsx # SSR-safe Phaser wrapper
├── stores/                       # Zustand stores
│   ├── useAvatarStore.ts
│   ├── useRoomStore.ts
│   ├── useTaskStore.ts
│   ├── useUserStore.ts
│   └── useOfficeStore.ts
├── public/assets/
│   ├── virtual-room/             # SVG/PNG room assets
│   ├── avatar/                   # Avatar SVG assets
│   ├── dashboard-employer/       # Employer UI assets
│   └── tasks/                    # Task review preview images
├── lib/
│   ├── types.ts                  # Shared TypeScript interfaces
│   └── mock-data.ts              # Mock data (no backend)
└── DEVELOPMENT.md                # Developer reference guide
```

---

## Notes

- **No backend** — all data is mock/local state
- **Desktop-first** — optimised for 1280px+ screens
- **No real multiplayer** — teammate presence is simulated
- Prototype only — not production-ready

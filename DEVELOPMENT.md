# WARP Development Guide

## Project Structure

WARP is a gamified virtual workspace prototype for remote creative teams. Built with Next.js, Phaser 3, Zustand, and Tailwind CSS v4.

### Core Pages
- **`app/page.tsx`** — Landing page with role selection (Employer / Employee)
- **`app/employee/page.tsx`** — Employee workspace view (Virtual Room shell)
- **`app/employer/page.tsx`** — Employer/manager dashboard view
- **`app/avatar/page.tsx`** — Avatar creation / customization page

### Components
- **`WorkspaceShell`** — Main layout container wrapping the Phaser canvas and UI panels
- **`VirtualRoomLayout`** — Full employee virtual office UI (left sidebar, Phaser canvas, right panel)
- **`PhaserGameDynamic`** — Dynamic (SSR-safe) wrapper that mounts/unmounts the Phaser game instance
- **`AvatarCreationPage`** — Full-screen avatar builder before entering the workspace
- **`AvatarCustomizer`** — In-session avatar colour picker with live preview
- **`EmployerDashboard`** — Employer-side workspace with sidebar nav; routes to `EmployerTaskManagementPage` when the Tasks nav item is active
- **`EmployerTaskManagementPage`** — Full employer task management page with three views:
  - `list` — tabbed task list (My Tasks / Review Tasks) with progress bars and status badges
  - `detail` — task detail view with description, bullet checklist, activity feed, attachments, and comments
  - `review-detail` — submitter review view with previews, approve / request-revision actions, and image lightbox
- **`CreateNewTaskModal`** — Shared modal for creating and assigning tasks (used by both VirtualRoomLayout and EmployerTaskManagementPage)

### Game Engine (`game/`)
- **`game/scenes/MainOfficeScene.ts`** — Primary Phaser scene:
  - Image-based room layout aligned to Figma coordinates (`FIGMA_MAIN_ROOM`)
  - Multi-state chair system: `idle → hover → selected` with sit overlay
  - Teammate avatar spawning with click-to-interact menu
  - Invisible desk hitboxes mapped over the Figma table asset
  - Image-based door portal with hover tint and room-switch transition
  - Focus-aware movement blocking (WASD/arrows disabled when typing in inputs)
  - Zoom/viewport control via `warp:viewport-control` custom events
  - Scene lifecycle guards (`isSceneReady`, `isSceneShuttingDown`) preventing stale calls after unmount
- **`game/components/PhaserGameDynamic.tsx`** — Handles Phaser game init, canvas sizing, and clean teardown

### State Management (`stores/`)
- **`useAvatarStore`** — Avatar colour config and customizer open/close state
- **`useRoomStore`** — Current room ID, room title/subtitle sync from Phaser events
- **`useTaskStore`** — Task list CRUD with XP reward on completion
- **`useUserStore`** — Player profile, XP, and level tracking
- **`useOfficeStore`** — Office-wide presence state (teammates, call status)

### Data & Types
- **`lib/types.ts`** — TypeScript interfaces: `Role`, `Task`, `Teammate`, `User`
- **`lib/mock-data.ts`** — Mock data for both employee and employer views

---

## Virtual Room Asset Pipeline

All room assets live under `public/assets/virtual-room/`:

```
base/           room_base.svg
chairs/
  front/        chair_front_{orange,green,blue}.svg
  back/         chair_back_{orange,green,blue}.svg
  hover/        chair_{front,back}_hover_{orange,green,blue}.png
furniture/      table.svg, tv_console.svg, door 3.svg, door_hover.svg
overlays/       sit_popup_primary.png
logo/           logo.svg
ui/             pause.png, skip.png, start.png, tomato.png
```

Figma pixel coordinates are baked into `FIGMA_MAIN_ROOM` in `MainOfficeScene.ts` and scaled at runtime using `layoutScale` derived from the canvas size.

---

## Task Status Model

```
assigned → started → completed
```

Completions award XP tracked in `useUserStore`. Task creation goes through `CreateNewTaskModal` with multi-select teammate assignment.

---

## Room Chat

The Right Panel in `VirtualRoomLayout` contains a live Room Chat:
- Message history with auto-scroll
- Emoji picker (6 quick-insert emojis)
- Simulated coworker replies with 900 ms delay
- Enter key support for sending messages

---

## Scene Lifecycle

`MainOfficeScene` uses two flags to prevent errors during hot-reload and navigation:

| Flag | Set to `true` | Set to `false` |
|---|---|---|
| `isSceneReady` | After `loadRoom('main')` in `create()` | On `SHUTDOWN` event |
| `isSceneShuttingDown` | On `SHUTDOWN` event | At the start of `create()` |

`canApplySceneViewport()` checks both flags + `sys.isActive()` + `mainRoomBounds` before any camera/zoom operation.

---

## Styling & Theme

- **Color Scheme**: Purple/indigo primary (`#685EEB`), soft warm off-white backgrounds
- **Typography**: `warp-font-ui` (Inter) + `warp-font-display` (utility classes in `globals.css`)
- **Design System**: Tailwind CSS v4 with custom WARP tokens
- **Figma-aligned**: Key layout dimensions match Figma export coordinates

---

## Notes

- Mock data only — no backend or authentication
- Desktop-first design (1280px+)
- No real multiplayer (presence is simulated)
- No audio/video handling yet
(prepared for future implementation)

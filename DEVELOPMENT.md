# WARP Development Guide

## Project Structure

WARP is a gamified virtual workspace prototype for remote creative teams. Built with Next.js 16, Phaser 3, Zustand 5, and Tailwind CSS v4.

### Core Pages
- **`app/page.tsx`** — Landing page with role selection (Employer / Employee)
- **`app/employee/page.tsx`** — Employee workspace view (Virtual Room shell)
- **`app/employer/page.tsx`** — Employer/manager dashboard view
- **`app/avatar/page.tsx`** — Avatar creation / customization page

### Components
- **`WorkspaceShell`** — Main layout container wrapping the Phaser canvas and UI panels
- **`VirtualRoomLayout`** — Full employee virtual office UI (left sidebar, Phaser canvas, right panel with chat)
- **`LandingPage`** — Hero/role selection page
- **`AvatarCreationPage`** — Full-screen avatar builder before entering the workspace
- **`AvatarCustomizer`** — In-session avatar colour picker with live preview
- **`EmployerDashboard`** — Employer-side workspace with sidebar nav; routes to `EmployerTaskManagementPage` when the Tasks nav item is active
- **`EmployerTaskManagementPage`** — Full employer task management page with three views:
  - `list` — tabbed task list (My Tasks / Review Tasks) with progress bars and status badges
  - `detail` — task detail view with description, bullet checklist, activity feed, attachments, and comments
  - `review-detail` — submitter review view with previews, approve / request-revision actions, and image lightbox
- **`CreateNewTaskModal`** — Shared modal for creating and assigning tasks (used by both `VirtualRoomLayout` and `EmployerTaskManagementPage`)
- **`TaskList`** — Employee-side gamified task cards with status flow and XP rewards
- **`LevelUpModal`** — Celebration modal shown when the player levels up
- **`WorkspaceHeader`** — Top nav bar (used by WorkspaceShell)
- **`WorkspaceSidebar`** — Tabbed sidebar (Tasks / Team) used by WorkspaceShell

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
- **`game/components/PhaserGameDynamic.tsx`** — SSR-safe dynamic import wrapper; handles Phaser game init, canvas sizing, and clean teardown
- **`game/components/PhaserGame.tsx`** — Thin re-export used by the dynamic import boundary

### State Management (`stores/`)
- **`useAvatarStore`** — Avatar colour config, display name, position, interests, and customizer open/close state
- **`useRoomStore`** — Current room ID, room title/subtitle sync from Phaser `warp:room-changed` events
- **`useTaskStore`** — Task list CRUD (add, update status) with XP reward on completion
- **`useUserStore`** — Player profile, XP total, level, and `addXp()` with level-up detection
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

Other asset folders:
```
public/assets/avatar/             # Avatar SVG assets
public/assets/dashboard-employer/ # Employer UI assets (banner, branding, cards)
public/assets/tasks/              # Task review preview images (SVG)
```

Figma pixel coordinates are baked into `FIGMA_MAIN_ROOM` in `MainOfficeScene.ts` and scaled at runtime using `layoutScale` derived from the canvas size.

---

## Task Status Model

```
assigned → started → completed
```

Completions award XP tracked in `useUserStore`. If XP crosses a level threshold, `LevelUpModal` is shown. Task creation goes through `CreateNewTaskModal` with multi-select teammate assignment.

---

## Room Chat

The Right Panel in `VirtualRoomLayout` contains a live Room Chat:
- Message history with auto-scroll (`chatScrollRef`)
- Emoji picker (6 quick-insert emojis, closes on outside click)
- Simulated coworker replies with 900 ms delay
- Enter key support for sending messages
- Chat input correctly receives keyboard focus without triggering Phaser movement

---

## Scene Lifecycle

`MainOfficeScene` uses two flags to prevent errors during hot-reload and navigation:

| Flag | Set to `true` | Set to `false` |
|---|---|---|
| `isSceneReady` | After `loadRoom('main')` in `create()` | On `SHUTDOWN` event |
| `isSceneShuttingDown` | On `SHUTDOWN` event | At the start of `create()` |

`canApplySceneViewport()` checks both flags + `sys.isActive()` + `mainRoomBounds` before any camera/zoom operation.

Movement keys (`WASD`, `SPACE`, arrow keys) have their browser-default capture removed so they don't interfere with text inputs. Movement is additionally blocked when `isEditableElementFocused()` returns true.

---

## Employer Task Management

`EmployerTaskManagementPage` is a full-width page (no right panel) with:

- **Header tabs** — My Tasks (4 badge) / Review Tasks (1 badge)
- **Sidebar** — Overall Progress ring chart + Upcoming Deadlines card
- **Task cards** — Assignee, due date, progress bar, status badge, hover animation
- **Detail view** — Task metadata, description, bullet checklist, activity timeline, attachments, comments
- **Review detail view** — Submission notes, preview image thumbnails, image lightbox (Escape to close), approve / request-revision actions
- **Image lightbox** — `ImagePreviewModal` with keyboard (`Escape`) and click-outside dismiss

---

## Styling & Theme

- **Color Scheme**: Purple/indigo primary (`#685EEB`), gradient background (`#d5d2ff → #d9fff4`), soft off-white panels
- **Typography**: `warp-font-ui` (Inter stack) + `warp-font-display` (Azeret Mono for `#` token display)
- **Design System**: Tailwind CSS v4 with custom WARP tokens in `globals.css`
- **Figma-aligned**: Key layout dimensions and Figma export coordinates are preserved in component code

---

## Notes

- Mock data only — no backend or authentication
- Desktop-first design (1280px+)
- No real multiplayer (presence is simulated)
- No audio/video handling yet

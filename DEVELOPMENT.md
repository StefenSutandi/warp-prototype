# WARP Development Guide

## Project Structure

WARP is a gamified virtual workspace prototype for remote creative teams. The codebase is organized for clean architecture and future integration with Zustand (state management) and Phaser (3D virtual office).

### Core Pages
- **`app/page.tsx`** - Landing page with role selection (Employer/Employee)
- **`app/employee/page.tsx`** - Employee workspace view
- **`app/employer/page.tsx`** - Employer/manager workspace view

### Components
- **`WorkspaceShell`** - Main layout container (reused by both roles)
- **`WorkspaceHeader`** - Top navigation bar with branding and user info
- **`WorkspaceSidebar`** - Tabbed sidebar with Tasks and Team views
- **`RoleBadge`** - Fixed position badge showing current role
- **`VirtualOfficePlaceholder`** - Central area reserved for Phaser 3D scene
- **`TaskList`** - Gamified task cards with status and priority
- **`TeammateCard`** - Team member cards with status indicators
- **`LandingPage`** - Hero page with role selection buttons

### Data & Types
- **`lib/types.ts`** - TypeScript interfaces (Role, Task, Teammate, User)
- **`lib/mock-data.ts`** - Mock data for both employee and employer views

## Task Status Model

Tasks use the following status flow (prepared for employer task assignment):
- **`assigned`** - Task created and assigned by employer
- **`started`** - Employee has started working on the task
- **`completed`** - Task completed and marked done

## Future Integration Points

### Zustand State Management
Replace local `useState` hooks with Zustand store for:
- Task status updates (TaskList component - see TODO comments)
- Sidebar tab navigation (WorkspaceSidebar component)
- Global app state (user, role, workspace data)

### Phaser 3D Virtual Office
Replace `VirtualOfficePlaceholder` with Phaser game instance for:
- 3D workspace scene rendering
- Player avatar movement and positioning
- Real-time collaborative presence
- Spatial audio proximity

## Development Workflow

1. **Task Status Changes**: Currently handled by local state in TaskList
   - Ready to be moved to Zustand store
   - Hook: `onTaskStatusChange` callback prepared in TaskList props

2. **Navigation**: Currently placeholder links in WorkspaceHeader
   - Ready to be wired to actual route handlers

3. **Virtual Office**: Placeholder component with clear integration point
   - Ready for Phaser game instance replacement

## Styling & Theme

- **Color Scheme**: Dark cyberpunk aesthetic (slate-950 base, purple/cyan accents)
- **Design System**: Tailwind CSS v4 with custom WARP theme tokens in `globals.css`
- **Components**: Minimal, focused UI without bloat from unused shadcn components

## Notes

- Mock data only - no backend or authentication
- Desktop-first design
- No multiplayer logic yet (prepared for future implementation)
- No audio/video handling (prepared for future implementation)

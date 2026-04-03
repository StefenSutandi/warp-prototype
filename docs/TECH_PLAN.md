# WARP Prototype Technical Plan

## 1. Technical Objective
Build a stable desktop-browser interactive prototype of WARP that supports:
- role-based flows
- virtual office interaction
- task progression
- office upgrade logic
- simple avatar customization

The technical plan must prioritize:
- implementation speed
- demo stability
- scope control
- easy asset replacement

## 2. Recommended Stack

### Frontend App Shell
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### State Management
- Zustand

### Scene Layer
- Phaser 3 for the virtual office area

### Data Strategy
- mock or local JSON data
- optional localStorage for temporary session continuity

### Deployment
- Vercel or local browser-hosted demo build

## 3. Architecture Strategy
The prototype should be split into two major layers:

### A. Application or UI Layer
Handles:
- landing page
- role selection
- panels
- forms
- task UI
- employer controls
- customization
- reward UI
- office progression indicators

### B. Scene Layer
Handles:
- avatar movement
- teammate rendering
- hover and click interactions
- room transitions
- call-domain visual simulation
- office visual state changes

These two layers should communicate through a controlled state or event bridge.

## 4. Core State Domains

### Role State
Tracks:
- active role
- current route or screen
- role-based permissions

### Task State
Tracks:
- task list
- assignee
- status
- rewards

### Avatar State
Tracks:
- selected appearance options
- preview state

### Office State
Tracks:
- current room
- office level
- progress toward next level
- asset set in use

### Teammate State
Tracks:
- name
- status
- interaction state
- call-domain participation

## 5. Suggested Repository Structure

Suggested folders:
- `app/` for routes and pages
- `components/` for UI components
- `game/` for Phaser scene logic
- `stores/` for Zustand state
- `lib/` for types, constants, and mock data
- `public/` for placeholder and final assets
- `docs/` for planning and spec documents

## 6. Development Order

### Phase 1 - Documentation and setup
Deliverables:
- product spec
- MVP scope
- demo script
- acceptance criteria
- repo initialization
- stack setup

### Phase 2 - UI shell
Deliverables:
- landing page
- role select
- employer shell
- employee shell
- navigation and panel placeholders

### Phase 3 - Core office scene
Deliverables:
- office canvas or scene
- player movement
- teammate placeholders
- hover and click interactions
- room switching

### Phase 4 - Task flow
Deliverables:
- task list UI
- assign task
- start task
- complete task
- reward feedback

### Phase 5 - Employer flow
Deliverables:
- create room form
- build room summary
- invite link dummy
- employer-only controls

### Phase 6 - Progression and customization
Deliverables:
- office level system
- asset swapping
- decoration unlock
- avatar customization UI and preview

### Phase 7 - Polish and stabilization
Deliverables:
- asset replacement pass
- transition polish
- demo route
- bug fixes
- final demo readiness

## 7. Tool Usage Plan

### ChatGPT
Use for:
- writing specs and docs
- planning architecture
- generating prompts for v0
- debugging
- refactoring
- creating acceptance criteria
- turning client feedback into technical tasks

### v0
Use for:
- landing page
- role selection UI
- dashboard shell
- task panel
- employer form
- avatar customization UI
- reward modal or popup
- level-up modal

### Antigravity
Use for:
- implementing larger coordinated changes
- wiring multiple files together
- project-level refactors
- assisting with integration work
- testing and fixing flows across the app

## 8. Engineering Rules

### Rule 1
Do not wait for final assets before building logic.

### Rule 2
Do not treat simulated features as blockers.

### Rule 3
Do not merge unrelated features into one implementation pass.

### Rule 4
Always keep the demo script in mind when deciding feature depth.

### Rule 5
A feature is complete only if it supports the intended demo flow.

## 9. Risk Management

### Main risks
- over-scoping
- poor separation between UI and scene logic
- waiting too long for final assets
- unstable generated code from AI tools
- inconsistent role behavior
- too much polish before the main flow works

### Mitigation
- build from docs first
- lock MVP early
- use placeholder assets
- separate game scene and app shell
- finish one full end-to-end flow early
- test demo path continuously

## 10. Recommended Immediate Next Steps
1. initialize repo
2. paste docs into `/docs`
3. generate landing page and workspace shell in v0
4. establish folder structure
5. create mock data and stores
6. build minimal office scene placeholder
7. connect one end-to-end task flow before polishing visuals
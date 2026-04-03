# WARP Prototype Day 1 to Day 3 Plan

This document defines the first three working days for setting up the WARP prototype.

## Day 1 - Foundation and Shell

### Main Goal
Set up the project foundation and generate the first usable UI shell.

### Tasks
1. Create repository
2. Create base folder structure:
   - app
   - components
   - stores
   - lib
   - public
   - docs
   - game
3. Add planning documents into `docs/`
4. Initialize project stack:
   - Next.js
   - TypeScript
   - Tailwind
   - shadcn/ui
5. Use v0 to generate:
   - landing page
   - role select UI
   - workspace shell
6. Import generated code into local project
7. Clean up generated components and routes

### End of Day 1 Deliverable
By the end of Day 1, the prototype should have:
- running local app
- landing page
- selectable Employer and Employee role entry
- visible workspace shell with placeholder layout

### Notes
Do not worry about scene movement yet.
Do not worry about visual assets yet.
The target is a stable shell, not polish.

---

## Day 2 - Role Views and Core Panels

### Main Goal
Separate Employee and Employer views, then add the main panels.

### Tasks
1. Create employee route or mode
2. Create employer route or mode
3. Add role badge and role-aware controls
4. Use v0 to generate:
   - task panel UI
   - employer create room form UI
   - reward popup UI
   - avatar customization UI
5. Integrate generated UI into workspace shell
6. Add mock data for:
   - teammates
   - tasks
   - rewards
   - avatar presets
7. Set up Zustand stores:
   - roleStore
   - taskStore
   - avatarStore
   - officeStore

### End of Day 2 Deliverable
By the end of Day 2, the prototype should have:
- separate Employee and Employer workspace views
- visible task panel
- visible create room form
- visible avatar customization UI
- working mock data through local state

### Notes
Functionality can still be partial.
UI visibility and structural wiring are the priority.

---

## Day 3 - Office Scene Placeholder and First Interaction

### Main Goal
Introduce the virtual office scene and prove the first office interaction loop.

### Tasks
1. Set up Phaser inside the project
2. Create `OfficeScene`
3. Render:
   - placeholder room background
   - player avatar placeholder
   - 2 to 3 teammate placeholders
4. Add keyboard movement for player avatar
5. Add hover status behavior for teammates
6. Add click interaction menu trigger
7. Connect Phaser interaction events to React UI through simple bridge or callbacks
8. Add one minimal end-to-end interaction:
   - hover teammate
   - click teammate
   - show interaction menu
   - trigger dummy Kudos

### End of Day 3 Deliverable
By the end of Day 3, the prototype should have:
- workspace shell
- embedded office scene
- basic player movement
- visible teammate interaction
- one working interaction loop

### Notes
Keep the scene simple.
Do not start room switching or office level up yet.
The goal is to prove integration, not completeness.

---

## Success Criteria After Day 3
The first three days are successful if:
- the project runs locally without major structural issues
- role selection works
- workspace shell is stable
- Employee and Employer views are separated
- at least one UI feature uses mock state
- the office scene is embedded
- player movement works
- teammate interaction is visible

---

## Common Mistakes to Avoid
- trying to build all features before the shell is stable
- waiting for final assets before coding
- making the Phaser scene too complicated too early
- mixing all logic into one file
- generating too much code at once from AI tools
- polishing visuals before core interaction works

---

## Suggested Daily Priority Rule
For each day:
1. make one thing visible
2. make one thing interactive
3. make one thing stable

If all three happen, the day is productive.
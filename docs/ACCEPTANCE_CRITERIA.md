# WARP Prototype Acceptance Criteria

## 1. General Principle
Each feature is considered complete only if:
- it is visible in the prototype
- it behaves consistently within the intended flow
- it supports the demo narrative
- it does not depend on hidden manual intervention to appear functional

## 2. Role Selection

### Acceptance Criteria
- user can select Employer or Employee
- selected role changes accessible UI and actions
- the correct workspace shell loads after role selection
- role state remains consistent during the active session

## 3. Workspace Shell

### Acceptance Criteria
- desktop-first layout is rendered correctly
- main workspace area is visible
- top bar and side panel are visible
- role indicator is shown
- task, teammate, and management panels can be opened where relevant

## 4. Virtual Office Movement

### Acceptance Criteria
- player avatar can move responsively using keyboard controls
- avatar remains within intended scene boundaries
- movement is stable enough for demo use
- scene renders teammate avatars and main office area clearly

## 5. Room Switching

### Acceptance Criteria
- user can move or trigger transition to another room or area
- room transition is visually clear
- the new room state loads successfully without breaking UI
- user context remains intact after transition

## 6. Teammate Hover Interaction

### Acceptance Criteria
- hovering on teammate displays tooltip or small status popup
- tooltip contains teammate activity status
- tooltip appears reliably and disappears appropriately

## 7. Teammate Click Interaction

### Acceptance Criteria
- clicking teammate opens an interaction menu
- menu includes at least one dummy interaction such as Kudos
- interaction menu is dismissible
- the action does not break the scene or UI state

## 8. Kudos Interaction

### Acceptance Criteria
- user can trigger Kudos from teammate interaction menu
- a visible response is shown, such as feedback text, icon, or animation
- the feature behaves consistently even if it is only simulated

## 9. Private Call Simulation

### Acceptance Criteria
- initiating a call creates a visible domain or area around teammate avatar
- teammate status changes to "In a Call"
- another user or player can join by clicking avatar
- no real audio integration is required
- call simulation can be exited or reset for demo purposes

## 10. Task Assignment

### Acceptance Criteria
- Employer can assign a task through the task UI
- assigned task appears in the relevant task list
- task data includes title, assignee, and reward value
- assigned task is stored in mock or local state

## 11. Task Start

### Acceptance Criteria
- Employee can start an assigned task
- task state changes from assigned to started
- started state is visible in UI

## 12. Task Completion

### Acceptance Criteria
- Employee can complete a started task
- task state changes to completed
- completion triggers reward response
- completed task is visibly different from incomplete tasks

## 13. Reward System

### Acceptance Criteria
- completing a task shows reward popup, notification, or visible point increment
- reward value is understandable in the UI
- reward feedback is visually satisfying enough for demo

## 14. Employer Create Room Flow

### Acceptance Criteria
- Employer can open Create Room form
- form includes:
  - number of employees
  - number of rooms
  - working hours
  - project timeline
- submitting form produces a build room summary or preview
- form interaction works without backend dependency

## 15. Invite Link Dummy Flow

### Acceptance Criteria
- build room flow includes dummy invite link output
- user can click copy button or equivalent action
- visual confirmation is shown after copying or triggering the action

## 16. Avatar Customization

### Acceptance Criteria
- user can modify hair
- user can modify skin tone
- user can modify face preset
- user can modify top
- user can modify bottom
- avatar preview updates visibly when selections change

## 17. Office Level Progression

### Acceptance Criteria
- task completion contributes to progression state
- when threshold is reached, office level-up state is triggered
- level-up event is visible in UI or environment

## 18. Asset Swapping

### Acceptance Criteria
- leveling up changes at least one visible office asset
- upgraded version is visually distinguishable from previous state
- additional decorations may appear after progression
- asset swap is stable and demo-ready even with placeholder assets

## 19. Demo Stability

### Acceptance Criteria
- prototype can complete at least one full Employee flow without critical break
- prototype can complete at least one Employer flow without critical break
- office level-up can be demonstrated
- prototype can be shown within a single controlled session

## 20. Non-Goals Validation

### Acceptance Criteria
The prototype is still acceptable even without:
- real-time multiplayer
- real voice or audio communication
- full persistence backend
- production-grade authentication
- advanced server-side infrastructure
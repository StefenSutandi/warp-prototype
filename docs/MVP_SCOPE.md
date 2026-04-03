# WARP Prototype MVP Scope

## 1. MVP Objective
The MVP should demonstrate the main WARP concept through a stable, demo-ready interactive prototype for desktop browser. The MVP must prioritize clarity of flow, visual credibility, and implementation feasibility within the available timeline.

## 2. In-Scope Features

### 2.1 Role Selection
Users can choose one of two roles:
- Employer
- Employee

This choice changes available UI controls and interactions.

### 2.2 Virtual Office Core
The virtual office must support:
- player/avatar movement
- teammate presence
- room switching
- clickable interaction points
- role-based UI context

### 2.3 Teammate Interaction
Required teammate interactions:
- hover to show activity tooltip/status
- click to open interaction options
- send dummy Kudos
- simulated private call domain
- join simulated call by clicking teammate
- status update to "In a Call"

### 2.4 Task Flow
Required task flow:
- Employer assigns task
- Employee sees assigned task
- Employee starts task
- Employee completes task
- reward popup or reward increment is triggered

### 2.5 Employer Create Room Flow
Employer-only flow:
- open create room form
- input number of employees
- input number of rooms
- input work hours
- input project timeline
- generate build room summary
- dummy invite-link copy action

### 2.6 Office Progression
Required progression system:
- task completion increments progress
- progress threshold triggers office level up
- level up swaps office assets
- new decorative assets may appear

### 2.7 Avatar Customization
Required customization categories:
- hair
- skin tone
- face preset
- top
- bottom

Customization can be limited in asset variety for prototype purposes.

## 3. Semi-Interactive or Simulated Features
The following features should look functional but may remain simplified:
- teammate activity states via mock data
- private voice call without audio integration
- invite link as dummy copy text
- build room as generated summary rather than true environment builder
- teammates as scripted or mock avatars rather than real users

## 4. Out of Scope
The following are explicitly excluded from MVP:
- real-time multiplayer
- real backend database
- live collaboration sync
- real voice or video call
- advanced physics or pathfinding
- real authentication or account creation
- notification infrastructure
- production security
- admin analytics dashboard
- chat system with real messaging
- mobile optimization as primary target

## 5. Priority Order

### Priority 1
- role selection
- workspace shell
- virtual office layout placeholder
- avatar movement
- teammate hover and click interaction

### Priority 2
- task list
- assign, start, and complete task flow
- reward popup
- employer role separation

### Priority 3
- create room form
- build room summary
- dummy invite flow
- avatar customization

### Priority 4
- office level up
- asset swapping
- decoration unlock
- polish and transitions

## 6. Asset Strategy
Development must not wait for final visual assets.

Use:
- placeholder assets
- mock sprites
- temporary cards and panels
- fake environment states

Final assets can be swapped in later once the core logic is stable.

## 7. Technical Scope Rule
Any feature not directly required to support the demo narrative should be either:
- deferred
- simplified
- converted into a non-blocking simulation

## 8. MVP Definition of Done
The MVP is considered complete when:
- both roles can be demonstrated
- the virtual office is explorable
- teammate interactions are visible
- at least one end-to-end task flow works
- employer can perform at least one management flow
- office progression can be demonstrated visually
- avatar customization is functional at a basic level
- the whole prototype can be shown in a clean demo without requiring hidden manual steps
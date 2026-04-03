# WARP Prototype

WARP is a desktop browser-based interactive prototype of a gamified virtual workspace for remote creative teams. This project is built for demo and thesis purposes, not for production deployment.

## Project Goal
The goal of this prototype is to simulate a virtual office experience where users can:
- move through a workspace
- interact with teammates
- manage and complete tasks
- receive rewards
- experience office progression through level-up and asset changes

## Roles
### Employee
Focused on:
- entering the office
- moving around the workspace
- interacting with teammates
- completing assigned tasks
- receiving rewards
- customizing avatar

### Employer
Focused on:
- creating and configuring rooms
- assigning tasks
- accessing management controls
- copying invite links
- managing workspace setup

## Core Features
- role selection
- virtual office movement
- teammate hover and click interaction
- simulated private call domain
- task system
- employer create room flow
- avatar customization
- office level up and asset swapping

## Prototype Boundaries
This is a prototype only.

Included:
- mock data
- local state
- simulated flows
- visual transitions
- demo-ready interactions

Not included:
- real-time multiplayer
- real audio or video calls
- production backend
- production authentication
- enterprise persistence

## Suggested Tech Stack
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- Phaser 3

## Suggested Folder Structure
- `app/` for pages and routing
- `components/` for reusable UI
- `game/` for office scene logic
- `stores/` for Zustand state
- `lib/` for constants, types, mock data
- `public/` for assets
- `docs/` for planning documents

## Development Priorities
1. role selection and workspace shell
2. employee and employer UI separation
3. virtual office scene integration
4. task flow
5. employer room flow
6. avatar customization
7. office level up
8. polish and stabilization

## Demo Core Loop
1. select role
2. enter office
3. move avatar
4. interact with teammate
5. assign or start task
6. complete task
7. receive reward
8. trigger office progression

## Key Documents
See:
- `docs/PRODUCT_SPEC.md`
- `docs/MVP_SCOPE.md`
- `docs/DEMO_SCRIPT.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/TECH_PLAN.md`

## Engineering Rules
- do not wait for final assets before building logic
- prioritize demo stability over completeness
- simulate anything non-essential
- keep UI shell and office scene separated
- always build against the demo flow
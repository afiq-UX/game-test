# CLAUDE.md

Guidance for Claude Code (and other contributors) working in this repository.

MELP is a small Three.js + TypeScript browser game built with Vite. The player walks
through a kampung house and turns off all 20 glowing appliances (some via mini-puzzles)
before a 5-minute timer expires. Stars are awarded based on completion time.

## Commands

- `npm install` — install deps
- `npm run dev` — Vite dev server with hot reload
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build

There is no test suite, linter, or typecheck script configured — verify changes by
running `npm run dev` in the browser.

## Architecture map

`src/main.ts` simply constructs `Game` and calls `init()`. Everything hangs off
`Game.ts`, which owns the renderer, scene, camera, the fixed render loop (`animate`),
the countdown timer, and the win/lose flow. It wires the subsystems together; the
subsystems do not know about each other except where a dependency is passed in
explicitly via the constructor.

Layers (one line each):

**core/** (engine plumbing)
- `InputManager.ts` — unifies keyboard (WASD/arrows, E/Space) and touch input into a
  movement `Vector2` and an interact edge-trigger; owns a `TouchControls` instance.
- `PlayerController.ts` — builds the placeholder character mesh, applies movement,
  smooth-rotates toward heading, animates legs, delegates collision resolution.
- `CameraController.ts` — third-person follow camera that lerps to an offset behind the
  player and looks slightly above them.
- `CollisionSystem.ts` — holds the world's `Box3` colliders and resolves desired player
  movement against them with axis sliding.

**world/** (the house)
- `RoomDefinitions.ts` — **data**: `ROOMS` array (room positions, sizes, wall segments,
  furniture), wall constants, and `PLAYER_SPAWN`. Source of truth for the layout.
- `HouseBuilder.ts` — consumes `ROOMS` to build floors, walls (with collision boxes),
  furniture (with collision boxes), stilts, and per-room lights; returns the collider list.
- `FurnitureFactory.ts` — turns a `FurnitureDef` into a single box mesh (all furniture
  is boxes).

**gameplay/**
- `ApplianceManager.ts` — **data**: `APPLIANCE_DEFS` array (the 20 appliances) plus the
  manager that builds their meshes/lights, tracks on/off state, the pulsing glow
  animation, and fires `onCountChange` when one is turned off.
- `InteractionSystem.ts` — finds the nearest active appliance within range, shows the
  "Press E" prompt, and on interact either turns off `press`-type appliances directly
  or returns the appliance so `Game` can open a puzzle.
- `PuzzleManager.ts` — builds DOM-overlay mini-puzzles (flip switches / hold button /
  find plug), resolves a promise with `'solved' | 'skipped' | 'cancelled'`; freezes
  player movement while `active`.

**ui/** (all DOM, no Three.js geometry except reading player position)
- `HUD.ts` — appliance counter (`X/20`), countdown timer, and the room label derived
  from player position vs `ROOMS`.
- `MenuScreens.ts` — the START overlay; fires an `onStart` callback.
- `TouchControls.ts` — nipplejs joystick (bottom-left) + action button (bottom-right);
  only shown on touch devices.

## Data-driven design — edit data, not geometry

Two arrays are the single source of truth for game content. To change the game, edit
these, not the builders:

- **`ROOMS` in `world/RoomDefinitions.ts`** drives the entire house. Adding a room,
  moving a wall, or placing furniture means editing this array — `HouseBuilder` and the
  HUD room label both read from it. Room-local coordinates are offset by `room.position`
  at build time.
- **`APPLIANCE_DEFS` in `gameplay/ApplianceManager.ts`** drives every appliance: its
  name, room, world position, size, colors, and `puzzleType`. `ApplianceManager.build()`
  iterates this array to create all meshes and lights.

`FurnitureFactory` and `ApplianceManager.build()` are generic — they render whatever the
data describes. You almost never need to touch them to add content.

## Key invariants

- **Exactly 20 appliances.** `APPLIANCE_DEFS` currently has 20 entries (4 Living Room,
  5 Kitchen, 3 Bedroom 1, 4 Bedroom 2, 2 Bathroom, 1 Veranda, 1 Car Porch). The HUD
  **hardcodes `/20`** (`HUD.updateCounter` computes `20 - remaining` and renders
  `${turned}/20`; `updateCounter(20)` / `updateTimer(300)` seed the initial display).
  If you change the number of appliances, you must update `HUD.ts` to match, or the
  counter will be wrong.
- **Win condition** fires when `getRemainingCount()` reaches 0 via the `onCountChange`
  callback wired in `Game.init()`.
- A `puzzleType: 'press'` appliance turns off immediately on interact (handled in
  `InteractionSystem.tryInteract`); the other three types open `PuzzleManager`.

## Collision model

- Colliders are axis-aligned `THREE.Box3`es collected by `HouseBuilder` (walls computed
  as AABBs from their segment endpoints; furniture via `Box3.setFromObject`).
- The player is approximated as a box of **radius 0.35** (half-width in X and Z) and
  **height 1.6** (`PLAYER_RADIUS` / `PLAYER_HEIGHT` in `CollisionSystem.ts`).
- `resolveMovement` tries the full move first, then falls back to sliding along X-only
  or Z-only, preferring the axis with more displacement; if both are blocked the player
  stays put. There is no gravity or vertical movement — the box's `min.y` is the player
  position's Y.

## Main tuning constants

| Constant | Value | Where |
|---|---|---|
| `MOVE_SPEED` | `5` | `core/PlayerController.ts` |
| `ROTATION_SPEED` | `10` | `core/PlayerController.ts` |
| `INTERACT_DISTANCE` | `2.0` | `gameplay/InteractionSystem.ts` |
| `gameTime` | `300` (seconds, = 5 min) | `Game.ts` |
| Skip penalty | `-5` seconds | `Game.openPuzzle` in `Game.ts` |
| Hold-button duration | `3000` ms | `gameplay/PuzzleManager.ts` |
| Star thresholds | `< 120s` = 3, `< 210s` = 2, else 1 (time *used*) | `Game.onWin` |
| Player radius / height | `0.35` / `1.6` | `core/CollisionSystem.ts` |
| Camera offset / smoothing | `(0, 4, -3.5)` / `5` | `core/CameraController.ts` |

## Conventions

- All rendered geometry is Three.js primitives (boxes, cylinders, spheres); there are no
  asset files to load.
- All UI is created imperatively in TypeScript via DOM elements with inline styles — there
  is no HTML template or CSS file for game UI. Keep new UI in the relevant `ui/` module.
- Player/world coordinates: X is east/west, Z is north/south (negative Z is "north" in
  the layout comments), Y is up. Room data uses `[x, z]` pairs for 2D positions.

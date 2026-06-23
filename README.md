# MELP — Turn Off The Lights!

MELP is a short (about 5-minute) 3D game built with Three.js. You play a character
exploring a Malaysian-style kampung house rendered on stilts. The whole house is lit
up: **20 appliances are running**, each glowing and humming. Your job is to find every
one and switch it off — by walking up to it and solving a quick mini-puzzle — before
the 5-minute timer runs out.

When the last appliance goes dark you win, and you're graded with 1–3 stars based on
how fast you cleared the house.

## How to play

- **Goal:** turn off all 20 appliances before the timer hits zero.
- **Find appliances:** they glow and pulse. A floating room label at the bottom of the
  screen tells you which room you're in.
- **Interact:** walk close to a glowing appliance and a "Press E — <name>" prompt
  appears. Trigger it to either switch the appliance off instantly or open a mini-puzzle.
- **Mini-puzzles:** some appliances need a small puzzle to switch off:
  - *Flip the switches* — set 3–4 switches to the right hidden combination.
  - *Hold the button* — press and hold for 3 seconds.
  - *Find the plug* — tap the correct plug to unplug it.
  - Every puzzle has a **Skip** button, but skipping costs you **5 seconds**.
- **Scoring (stars):** based on time used to clear the house — under 2:00 = 3 stars,
  under 3:30 = 2 stars, otherwise 1 star.

## Controls

### Desktop
- **Move:** `W` `A` `S` `D` or the arrow keys
- **Interact:** `E` or `Space`

### Mobile / touch
- **Move:** on-screen joystick (bottom-left, powered by nipplejs)
- **Interact:** the round `E` action button (bottom-right)

Touch controls appear automatically on touch-capable devices.

## Tech stack

- **[Three.js](https://threejs.org/) 0.184** — 3D rendering (WebGL, shadows, ACES tone mapping)
- **[Vite](https://vite.dev/) 8** — dev server and build tooling
- **[TypeScript](https://www.typescriptlang.org/) 6** — all source is TypeScript
- **[nipplejs](https://github.com/yoannmoinet/nipplejs) 1.x** — virtual joystick for mobile

The entire house, furniture, and appliances are built from simple Three.js box/cylinder
primitives — there are no external 3D model assets to load.

## Setup

Requires Node.js (with npm).

```bash
# Install dependencies
npm install

# Start the dev server (with hot reload)
npm run dev

# Produce a production build in dist/
npm run build

# Preview the production build locally
npm run preview
```

After `npm run dev`, open the URL Vite prints (typically http://localhost:5173) and
click **START**.

## Project layout

```
src/
  main.ts                  Entry point — instantiates and starts the Game
  Game.ts                  Orchestrator: scene, loop, timer, win condition
  core/                    Input, player movement, camera, collision
  world/                   House geometry + room/furniture data
  gameplay/                Appliances, interaction, mini-puzzles
  ui/                      HUD, menu, touch controls
```

For an architecture deep-dive aimed at contributors (and AI coding assistants), see
[CLAUDE.md](./CLAUDE.md).

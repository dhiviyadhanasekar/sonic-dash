# Sonic Dash — 2 Player Ring Rush 🌀

A two-player browser game inspired by Sonic the Hedgehog. Race your friend to collect **15 rings** first and win! Built with React, TypeScript, and HTML Canvas — no installs needed, just open in a browser.

---

## Table of Contents

- [How to Play](#how-to-play)
- [Characters](#characters)
- [Controls](#controls)
- [Game Rules](#game-rules)
- [Features](#features)
- [Development Setup](#development-setup)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)

---

## How to Play

1. **Open the game** in your browser.
2. Press **Space** or **Enter** on the title screen to open the Character Select screen.
3. **Both players pick a character** — Player 1 uses A/D to browse and W to confirm; Player 2 uses ←/→ to browse and ↑ to confirm.
4. Once both players have confirmed, the game begins.
5. **Run, jump, and collect golden rings** scattered around the level.
6. **First player to collect 15 rings wins!**
7. After the game ends, press **Space** or **Enter** to return to the character select screen and play again.

---

## Characters

Choose from 5 characters — each has a unique look on the canvas:

| Character | Colour / Style | Notes |
|---|---|---|
| **Sonic** | Classic blue with white eyes and red shoes | The original speedster |
| **Shadow** | Black body with red highlights and red eyes | The ultimate life form |
| **Tails** | Orange with animated twin tails | Two tails spin as he runs |
| **Super Sonic** | Golden quills pointing upward | Powered-up form of Sonic |
| **Knuckles** | Red with dreadlock spikes and darker fists | The guardian of the Master Emerald |

> **Tip:** Both players can pick the same character! When they do, a **P1** or **P2** label appears above each character so you can always tell them apart.

---

## Controls

### Character Select Screen

| Action | Player 1 | Player 2 |
|---|---|---|
| Browse left | A | ← Arrow |
| Browse right | D | → Arrow |
| Confirm choice | W | ↑ Arrow |

### In-Game

| Action | Player 1 | Player 2 |
|---|---|---|
| Run left | A | ← Arrow |
| Run right | D | → Arrow |
| Jump | W | ↑ Arrow |

### General

| Action | Key |
|---|---|
| Open character select / restart | Space or Enter |

---

## Game Rules

- The level is filled with **20 golden rings** at a time. Rings respawn once all are collected.
- **Spikes** are dotted around the level — touching one costs you **3 rings** and briefly makes you invincible so you can get away safely.
- **Springs** launch you high into the air — great for reaching rings on higher platforms.
- The **HUD at the top** shows each player's ring count and character name in real time.
- The **first player to reach 15 rings** triggers the win screen, which announces the winner by character name.

---

## Features

- Smooth 60 fps canvas rendering
- 5 unique hand-drawn characters with animations
- Accessible character select overlay (keyboard navigable, full ARIA support)
- Platform physics — gravity, jumping, wall-clamping, and platform landing
- Spike hazards with invincibility frames and ring-loss penalty
- Spring launchers
- Ring-collection particle effects
- Twinkling starfield background
- Aria-live announcements for screen readers
- Content Security Policy headers

---

## Development Setup

**Prerequisites:** Node.js 24, pnpm 10

```bash
# Install dependencies
pnpm install

# Start the game dev server
pnpm --filter @workspace/sonic-game run dev
```

The game will be available at the URL shown in the terminal (proxied through Replit's shared reverse proxy in that environment).

---

## Running Tests

```bash
# Unit and integration tests (Vitest)
cd artifacts/sonic-game
pnpm exec vitest run

# End-to-end tests (Playwright — requires Chromium)
pnpm exec playwright test
```

All tests must pass before merging:

| Suite | Count |
|---|---|
| Unit tests (`logic.unit.test.ts`, `characters.unit.test.ts`) | 119 |
| Integration tests (`game.integration.test.ts`) | 24 |
| E2E tests (`game.spec.ts`) | 22 |
| **Total** | **165** |

---

## Project Structure

```
artifacts/sonic-game/
├── src/
│   ├── game/
│   │   ├── logic.ts           # All game state, physics, and character types
│   │   ├── Game.tsx           # Canvas renderer + game loop + input handling
│   │   └── CharacterSelect.tsx # Accessible character selection overlay
│   ├── __tests__/
│   │   ├── characters.unit.test.ts  # TDD tests for character system
│   │   ├── logic.unit.test.ts       # Unit tests for core game logic
│   │   └── game.integration.test.ts # Integration tests for game state flows
│   └── main.tsx              # React entry point
├── tests/
│   └── game.spec.ts          # Playwright E2E tests
├── index.html                # Entry HTML with CSP meta tag
├── vite.config.ts            # Vite config
└── playwright.config.ts      # Playwright config (uses Nix Chromium)
```

### Key source files

| File | Purpose |
|---|---|
| `src/game/logic.ts` | Single source of truth for game rules: `CharacterType`, `CHARACTERS`, `tickGameState`, `startGameWithCharacters`, physics functions |
| `src/game/Game.tsx` | All canvas drawing (one `drawXxx` function per character), the `requestAnimationFrame` game loop, keyboard event handling |
| `src/game/CharacterSelect.tsx` | HTML overlay rendered by React; captures keyboard with capture-phase listener so game handler is bypassed during selection |

---

## Tech Stack

- **React 19** + **Vite 7** — UI and dev server
- **TypeScript 5.9** — strict typing throughout
- **HTML Canvas API** — all game rendering
- **Vitest 3** + **jsdom** — unit and integration tests
- **Playwright 1.49** — end-to-end browser tests
- **pnpm workspaces** — monorepo package management

---

## Accessibility

- Canvas has `role="application"` and a descriptive `aria-label`
- Game state changes are announced via an `aria-live` region
- Character Select has `role="dialog"` with `aria-modal`; each card has `role="option"` and `aria-selected`
- Keyboard-only navigation is fully supported throughout

---

*Made with love for a 6-year-old Sonic fan. 💛*

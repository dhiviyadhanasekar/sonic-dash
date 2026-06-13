# Sonic Dash — Two-Player Ring Rush

A two-player browser game inspired by Sonic the Hedgehog. Race your friend to collect **15 rings** first and win! Built with React 19, TypeScript 5.9, and the HTML Canvas API — no installs needed, runs entirely in the browser.

**Built on [Replit](https://replit.com) for a 6-year-old.**

---

## Play

Open the Replit preview and press **Space** to choose your character, then start running.

| Player | Move | Jump |
|--------|------|------|
| Player 1 | A / D | W |
| Player 2 | ← / → | ↑ |

---

## Characters

| Character | Description |
|-----------|-------------|
| Sonic | Classic blue speedster |
| Shadow | Red-and-black with attitude |
| Tails | Orange with animated twin tails |
| Super Sonic | Golden powered-up form |
| Knuckles | Red guardian with dreadlock spikes |

Both players can pick the same character — a P1 / P2 label appears so you can tell them apart.

---

## Game Rules

- First player to collect **15 rings** wins
- **Spikes** cost 3 rings on contact and grant brief invincibility
- **Springs** launch you to higher platforms
- Rings respawn after all 20 have been collected

---

## Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + Vite 7 |
| Language | TypeScript 5.9 (strict) |
| Rendering | HTML Canvas API at 60 fps |
| Monorepo | pnpm workspaces |
| Unit / Integration tests | Vitest 3 — 143 tests |
| End-to-end tests | Playwright 1.49 — 22 tests |

---

## Project Structure

```
artifacts/
  sonic-game/       # The game (React + Canvas)
  sonic-dash-deck/  # 9-slide project presentation deck
  api-server/       # Express API server
```

---

## Development

```bash
# Install dependencies
pnpm install

# Run the game dev server
pnpm --filter @workspace/sonic-game run dev

# Run all unit + integration tests
pnpm --filter @workspace/sonic-game run test

# Run Playwright E2E tests
pnpm --filter @workspace/sonic-game run test:e2e

# Full typecheck
pnpm run typecheck
```

---

## Tests

```
165 tests — all passing
  119  unit tests  (physics, ring logic, characters, win conditions)
   24  integration tests  (full game-state flows)
   22  Playwright E2E  (character select, gameplay, win screen)
```

Test-first approach: character system tests were written before the implementation.

---

## Accessibility & Security

- Canvas has `role="application"` and a descriptive `aria-label`
- Aria-live region announces game state to screen readers
- Character select uses proper ARIA dialog roles with full keyboard navigation
- Content Security Policy meta tag (OWASP A05)
- Keyboard handling only calls `preventDefault` for known game keys

---

*Made with love on [Replit](https://replit.com) — dhiviyadhanasekar*

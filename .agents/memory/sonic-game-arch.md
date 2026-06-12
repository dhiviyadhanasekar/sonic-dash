---
name: Sonic game architecture
description: Key structural decisions for the sonic-game artifact — character system, selection screen, and player representation.
---

## CharacterType replaces isSonic

`Player.isSonic: boolean` was replaced with `Player.characterType: CharacterType` where `CharacterType = "sonic" | "shadow" | "tails" | "superSonic" | "knuckles"`.

**Why:** Needed 5 characters; boolean can't represent 5 states cleanly.

**How to apply:** Any new character requires: entry in `CHARACTERS[]`, a `drawXxx` function in `Game.tsx`, and a case in `drawPlayer`'s switch.

## Character selection is an HTML overlay, not canvas

`CharacterSelect.tsx` is a React component absolutely positioned over the canvas. It has its own `window.addEventListener("keydown", handler, { capture: true })` and calls `e.stopPropagation()` so game key handler never sees selection keys.

**Why:** HTML gives us accessible ARIA roles, focus management, and React state for free. Drawing a selection UI on canvas would require manual hit-testing and no accessibility.

**How to apply:** `showCharSelectRef` (ref, not state) is used inside the game key handler to early-return when selection is visible. `setShowCharSelect` (state) triggers re-render. Both must stay in sync — update `showCharSelectRef.current` whenever `setShowCharSelect` is called.

## makePlayer signature

`makePlayer(x: number, characterType: CharacterType, facing = 1): Player`

P1 always gets `facing=1`, P2 always gets `facing=-1`. The facing direction is positional (left/right side of screen), not character-specific.

## needsDifferentiation

`needsDifferentiation(p1, p2)` returns `p1.characterType === p2.characterType`. When true, `drawPlayer` draws a colored "P1"/"P2" pill label above each player so they're distinguishable.

## Test counts (as of last update)

- 143 Vitest unit + integration tests (3 files)
- 22 Playwright E2E tests

Playwright uses Nix Chromium at `~/.nix-profile/bin/chromium` with `--no-sandbox`.

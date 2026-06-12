import { describe, it, expect } from "vitest";
import {
  W, H, PW, PH, GRAVITY, JUMP_FORCE, SPEED, WIN_RINGS,
  rectOverlap, makePlayer, makePlatforms, makeRings,
  makeSpikes, makeSprings, createGameState,
  applyGravity, applyMovement, integratePlatformCollisions,
  applySpikeHit, collectRings, applySpringLaunch,
  tickInvincibility, tickAnimation, tickSprings, tickEffects,
  checkWin, clampPlayerToCanvas,
} from "../game/logic";

// ─── rectOverlap ──────────────────────────────────────────────────────────────
describe("rectOverlap", () => {
  it("returns false when rects do not overlap horizontally", () => {
    expect(rectOverlap(0, 0, 10, 10, 20, 0, 10, 10)).toBe(false);
  });

  it("returns false when rects do not overlap vertically", () => {
    expect(rectOverlap(0, 0, 10, 10, 0, 20, 10, 10)).toBe(false);
  });

  it("returns true when rects overlap", () => {
    expect(rectOverlap(0, 0, 20, 20, 10, 10, 20, 20)).toBe(true);
  });

  it("returns true when one rect contains another", () => {
    expect(rectOverlap(5, 5, 5, 5, 0, 0, 20, 20)).toBe(true);
  });

  it("returns false when rects share only a touching edge (left/right)", () => {
    expect(rectOverlap(0, 0, 10, 10, 10, 0, 10, 10)).toBe(false);
  });

  it("returns false when rects share only a touching edge (top/bottom)", () => {
    expect(rectOverlap(0, 0, 10, 10, 0, 10, 10, 10)).toBe(false);
  });

  it("returns true when rects overlap by just 1 pixel", () => {
    expect(rectOverlap(0, 0, 11, 10, 10, 0, 10, 10)).toBe(true);
  });
});

// ─── makePlayer ───────────────────────────────────────────────────────────────
describe("makePlayer", () => {
  it("creates Sonic with correct name and blue identity", () => {
    const p = makePlayer(100, true);
    expect(p.name).toBe("SONIC");
    expect(p.isSonic).toBe(true);
  });

  it("creates Tails with correct name", () => {
    const p = makePlayer(100, false);
    expect(p.name).toBe("TAILS");
    expect(p.isSonic).toBe(false);
  });

  it("positions player at given x", () => {
    expect(makePlayer(200, true).x).toBe(200);
    expect(makePlayer(800, false).x).toBe(800);
  });

  it("starts with zero velocity", () => {
    const p = makePlayer(0, true);
    expect(p.vx).toBe(0);
    expect(p.vy).toBe(0);
  });

  it("starts with zero rings", () => {
    expect(makePlayer(0, true).rings).toBe(0);
    expect(makePlayer(0, false).rings).toBe(0);
  });

  it("starts not on ground", () => {
    expect(makePlayer(0, true).onGround).toBe(false);
  });

  it("starts not invincible", () => {
    expect(makePlayer(0, true).invincible).toBe(0);
  });

  it("Sonic faces right, Tails faces left initially", () => {
    expect(makePlayer(0, true).facing).toBe(1);
    expect(makePlayer(0, false).facing).toBe(-1);
  });
});

// ─── makePlatforms ────────────────────────────────────────────────────────────
describe("makePlatforms", () => {
  it("returns 14 platforms", () => {
    expect(makePlatforms()).toHaveLength(14);
  });

  it("includes a full-width ground platform", () => {
    const platforms = makePlatforms();
    const ground = platforms.find(p => p.w === W && p.y === H - 40);
    expect(ground).toBeDefined();
  });

  it("all platforms have positive width and height", () => {
    makePlatforms().forEach(p => {
      expect(p.w).toBeGreaterThan(0);
      expect(p.h).toBeGreaterThan(0);
    });
  });

  it("all platforms are within canvas bounds horizontally", () => {
    makePlatforms().forEach(p => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x + p.w).toBeLessThanOrEqual(W);
    });
  });

  it("all platforms are within canvas bounds vertically", () => {
    makePlatforms().forEach(p => {
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y + p.h).toBeLessThanOrEqual(H);
    });
  });

  it("all platforms have a color string", () => {
    makePlatforms().forEach(p => {
      expect(typeof p.color).toBe("string");
      expect(p.color.startsWith("#")).toBe(true);
    });
  });
});

// ─── makeRings ────────────────────────────────────────────────────────────────
describe("makeRings", () => {
  it("returns 20 rings", () => {
    expect(makeRings()).toHaveLength(20);
  });

  it("all rings start uncollected", () => {
    makeRings().forEach(r => expect(r.collected).toBe(false));
  });

  it("all ring positions are within canvas bounds", () => {
    makeRings().forEach(r => {
      expect(r.x).toBeGreaterThan(0);
      expect(r.x).toBeLessThan(W);
      expect(r.y).toBeGreaterThan(0);
      expect(r.y).toBeLessThan(H);
    });
  });

  it("rings have unique animFrame offsets", () => {
    const frames = makeRings().map(r => r.animFrame);
    const unique = new Set(frames);
    expect(unique.size).toBe(frames.length);
  });
});

// ─── makeSpikes / makeSprings ─────────────────────────────────────────────────
describe("makeSpikes", () => {
  it("returns 3 spikes", () => {
    expect(makeSpikes()).toHaveLength(3);
  });

  it("all spikes have positive dimensions", () => {
    makeSpikes().forEach(s => {
      expect(s.w).toBeGreaterThan(0);
      expect(s.h).toBeGreaterThan(0);
    });
  });
});

describe("makeSprings", () => {
  it("returns 2 springs", () => {
    expect(makeSprings()).toHaveLength(2);
  });

  it("springs start inactive", () => {
    makeSprings().forEach(s => {
      expect(s.active).toBe(false);
      expect(s.timer).toBe(0);
    });
  });
});

// ─── createGameState ─────────────────────────────────────────────────────────
describe("createGameState", () => {
  it("starts in title state", () => {
    expect(createGameState().gameState).toBe("title");
  });

  it("starts with t=0", () => {
    expect(createGameState().t).toBe(0);
  });

  it("has no winner initially", () => {
    expect(createGameState().winner).toBe("");
  });

  it("has 20 rings", () => {
    expect(createGameState().rings).toHaveLength(20);
  });
});

// ─── applyGravity ─────────────────────────────────────────────────────────────
describe("applyGravity", () => {
  it("increases vy by GRAVITY each tick", () => {
    const p = makePlayer(0, true);
    const result = applyGravity(p);
    expect(result.vy).toBeCloseTo(p.vy + GRAVITY);
  });

  it("caps vy at 20", () => {
    const p = { ...makePlayer(0, true), vy: 19.8 };
    expect(applyGravity(p).vy).toBe(20);
  });

  it("does not modify other fields", () => {
    const p = makePlayer(100, true);
    const result = applyGravity(p);
    expect(result.x).toBe(p.x);
    expect(result.rings).toBe(p.rings);
  });
});

// ─── applyMovement ────────────────────────────────────────────────────────────
describe("applyMovement", () => {
  it("moves left when left key pressed", () => {
    const p = makePlayer(0, true);
    const result = applyMovement(p, { left: true, right: false, jump: false });
    expect(result.vx).toBe(-SPEED);
    expect(result.facing).toBe(-1);
    expect(result.running).toBe(true);
  });

  it("moves right when right key pressed", () => {
    const p = makePlayer(0, true);
    const result = applyMovement(p, { left: false, right: true, jump: false });
    expect(result.vx).toBe(SPEED);
    expect(result.facing).toBe(1);
    expect(result.running).toBe(true);
  });

  it("decelerates when no key pressed", () => {
    const p = { ...makePlayer(0, true), vx: 10 };
    const result = applyMovement(p, { left: false, right: false, jump: false });
    expect(result.vx).toBeLessThan(10);
  });

  it("applies jump force when jump pressed and on ground", () => {
    const p = { ...makePlayer(0, true), onGround: true };
    const result = applyMovement(p, { left: false, right: false, jump: true });
    expect(result.vy).toBe(JUMP_FORCE);
    expect(result.onGround).toBe(false);
    expect(result.spinning).toBe(true);
  });

  it("does not jump when not on ground", () => {
    const p = { ...makePlayer(0, true), onGround: false, vy: 0 };
    const result = applyMovement(p, { left: false, right: false, jump: true });
    expect(result.vy).toBe(0);
  });

  it("decrements spinTimer each tick", () => {
    const p = { ...makePlayer(0, true), spinTimer: 10, spinning: true };
    const result = applyMovement(p, { left: false, right: false, jump: false });
    expect(result.spinTimer).toBe(9);
  });

  it("clears spinning when spinTimer reaches zero", () => {
    const p = { ...makePlayer(0, true), spinTimer: 1, spinning: true };
    const result = applyMovement(p, { left: false, right: false, jump: false });
    expect(result.spinning).toBe(false);
  });
});

// ─── clampPlayerToCanvas ─────────────────────────────────────────────────────
describe("clampPlayerToCanvas", () => {
  it("clamps player to left edge", () => {
    const p = { ...makePlayer(-50, true) };
    expect(clampPlayerToCanvas(p).x).toBe(0);
  });

  it("clamps player to right edge", () => {
    const p = { ...makePlayer(W + 100, true) };
    expect(clampPlayerToCanvas(p).x).toBe(W - PW);
  });

  it("does not change player within bounds", () => {
    const p = makePlayer(400, true);
    expect(clampPlayerToCanvas(p).x).toBe(400);
  });
});

// ─── integratePlatformCollisions ─────────────────────────────────────────────
describe("integratePlatformCollisions", () => {
  it("lands player on top of a platform when falling onto it", () => {
    const platform = { x: 0, y: 400, w: W, h: 40, color: "#2ecc71" };
    const p = { ...makePlayer(100, true), y: 400 - PH - 1, vy: 5 };
    const result = integratePlatformCollisions(p, [platform]);
    expect(result.y).toBe(platform.y - PH);
    expect(result.vy).toBe(0);
    expect(result.onGround).toBe(true);
  });

  it("respawns player at top when falling off bottom of screen", () => {
    const p = { ...makePlayer(100, true), y: H + 200, vy: 5 };
    const result = integratePlatformCollisions(p, []);
    expect(result.y).toBe(80);
    expect(result.vy).toBe(0);
  });

  it("does not set onGround when not on any platform", () => {
    const p = { ...makePlayer(100, true), y: 100, vy: 2 };
    const result = integratePlatformCollisions(p, []);
    expect(result.onGround).toBe(false);
  });
});

// ─── applySpikeHit ───────────────────────────────────────────────────────────
describe("applySpikeHit", () => {
  const spike = { x: 100, y: 600, w: 30, h: 20 };

  it("deducts 3 rings and grants invincibility on spike hit", () => {
    const p = { ...makePlayer(102, true), y: 606, rings: 10, invincible: 0 };
    const { player, hit } = applySpikeHit(p, [spike]);
    expect(hit).toBe(true);
    expect(player.rings).toBe(7);
    expect(player.invincible).toBe(90);
  });

  it("does not reduce rings below zero", () => {
    const p = { ...makePlayer(102, true), y: 606, rings: 1, invincible: 0 };
    const { player } = applySpikeHit(p, [spike]);
    expect(player.rings).toBeGreaterThanOrEqual(0);
  });

  it("bounces player upward on spike hit", () => {
    const p = { ...makePlayer(102, true), y: 606, rings: 5, invincible: 0 };
    const { player } = applySpikeHit(p, [spike]);
    expect(player.vy).toBe(-9);
  });

  it("skips hit when player is invincible", () => {
    const p = { ...makePlayer(102, true), y: 606, rings: 10, invincible: 30 };
    const { player, hit } = applySpikeHit(p, [spike]);
    expect(hit).toBe(false);
    expect(player.rings).toBe(10);
  });

  it("returns hit=false when player not overlapping spike", () => {
    const p = makePlayer(500, true);
    const { hit } = applySpikeHit(p, [spike]);
    expect(hit).toBe(false);
  });
});

// ─── collectRings ─────────────────────────────────────────────────────────────
describe("collectRings", () => {
  it("collects a ring when player overlaps it", () => {
    const ring = { x: 120, y: 200, collected: false, animFrame: 0 };
    const p = { ...makePlayer(112, true), y: 192, rings: 0 };
    const { player, rings } = collectRings(p, [ring]);
    expect(player.rings).toBe(1);
    expect(rings[0].collected).toBe(true);
  });

  it("does not collect an already-collected ring", () => {
    const ring = { x: 120, y: 200, collected: true, animFrame: 0 };
    const p = { ...makePlayer(112, true), y: 192, rings: 5 };
    const { player } = collectRings(p, [ring]);
    expect(player.rings).toBe(5);
  });

  it("does not collect a ring out of range", () => {
    const ring = { x: 900, y: 200, collected: false, animFrame: 0 };
    const p = makePlayer(100, true);
    const { player } = collectRings(p, [ring]);
    expect(player.rings).toBe(0);
  });

  it("creates an effect when a ring is collected", () => {
    const ring = { x: 120, y: 200, collected: false, animFrame: 0 };
    const p = { ...makePlayer(112, true), y: 192 };
    const { effects } = collectRings(p, [ring]);
    expect(effects).toHaveLength(1);
    expect(effects[0].life).toBe(30);
  });

  it("collects multiple rings in one pass", () => {
    const rings = [
      { x: 120, y: 200, collected: false, animFrame: 0 },
      { x: 130, y: 200, collected: false, animFrame: 1 },
    ];
    const p = { ...makePlayer(112, true), y: 192 };
    const { player } = collectRings(p, rings);
    expect(player.rings).toBe(2);
  });
});

// ─── applySpringLaunch ───────────────────────────────────────────────────────
describe("applySpringLaunch", () => {
  const spring = { x: 100, y: 640, active: false, timer: 0 };

  it("launches player upward when overlapping spring", () => {
    const p = { ...makePlayer(102, true), y: 646 };
    const { player, springs } = applySpringLaunch(p, [spring]);
    expect(player.vy).toBe(-24);
    expect(player.onGround).toBe(false);
    expect(player.spinning).toBe(true);
    expect(springs[0].active).toBe(true);
    expect(springs[0].timer).toBe(20);
  });

  it("does not affect player when not near spring", () => {
    const p = makePlayer(500, true);
    const { player } = applySpringLaunch(p, [spring]);
    expect(player.vy).toBe(0);
  });
});

// ─── tickInvincibility ────────────────────────────────────────────────────────
describe("tickInvincibility", () => {
  it("decrements invincible when > 0", () => {
    const p = { ...makePlayer(0, true), invincible: 30 };
    expect(tickInvincibility(p).invincible).toBe(29);
  });

  it("does not go below 0", () => {
    const p = { ...makePlayer(0, true), invincible: 0 };
    expect(tickInvincibility(p).invincible).toBe(0);
  });
});

// ─── tickSprings ─────────────────────────────────────────────────────────────
describe("tickSprings", () => {
  it("decrements timer when active", () => {
    const springs = [{ x: 0, y: 0, active: true, timer: 10 }];
    expect(tickSprings(springs)[0].timer).toBe(9);
  });

  it("deactivates spring when timer reaches 0", () => {
    const springs = [{ x: 0, y: 0, active: true, timer: 1 }];
    const result = tickSprings(springs);
    expect(result[0].active).toBe(false);
    expect(result[0].timer).toBe(0);
  });

  it("does not modify inactive springs with timer 0", () => {
    const springs = [{ x: 0, y: 0, active: false, timer: 0 }];
    expect(tickSprings(springs)[0]).toEqual(springs[0]);
  });
});

// ─── tickEffects ──────────────────────────────────────────────────────────────
describe("tickEffects", () => {
  it("moves effects upward each tick", () => {
    const effects = [{ x: 100, y: 200, life: 30 }];
    expect(tickEffects(effects)[0].y).toBeLessThan(200);
  });

  it("decrements life each tick", () => {
    const effects = [{ x: 100, y: 200, life: 30 }];
    expect(tickEffects(effects)[0].life).toBeLessThan(30);
  });

  it("removes expired effects", () => {
    const effects = [{ x: 100, y: 200, life: 0.5 }];
    expect(tickEffects(effects)).toHaveLength(0);
  });

  it("keeps effects with life > 1 after decrement", () => {
    const effects = [{ x: 100, y: 200, life: 5 }];
    expect(tickEffects(effects)).toHaveLength(1);
  });
});

// ─── checkWin ─────────────────────────────────────────────────────────────────
describe("checkWin", () => {
  it("returns over=false when neither player has enough rings", () => {
    const p1 = makePlayer(0, true);
    const p2 = makePlayer(0, false);
    expect(checkWin(p1, p2).over).toBe(false);
  });

  it("returns Sonic as winner when p1 reaches WIN_RINGS", () => {
    const p1 = { ...makePlayer(0, true), rings: WIN_RINGS };
    const p2 = makePlayer(0, false);
    const result = checkWin(p1, p2);
    expect(result.over).toBe(true);
    expect(result.winner).toBe("SONIC");
  });

  it("returns Tails as winner when p2 reaches WIN_RINGS", () => {
    const p1 = makePlayer(0, true);
    const p2 = { ...makePlayer(0, false), rings: WIN_RINGS };
    const result = checkWin(p1, p2);
    expect(result.over).toBe(true);
    expect(result.winner).toBe("TAILS");
  });

  it("triggers at exactly WIN_RINGS (not one below)", () => {
    const p1 = { ...makePlayer(0, true), rings: WIN_RINGS - 1 };
    const p2 = makePlayer(0, false);
    expect(checkWin(p1, p2).over).toBe(false);
  });
});

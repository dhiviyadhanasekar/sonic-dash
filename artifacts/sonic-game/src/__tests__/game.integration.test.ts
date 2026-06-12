import { describe, it, expect } from "vitest";
import {
  createGameState, tickGameState, startGame,
  makePlayer, makeRings, makePlatforms,
  WIN_RINGS, H, W, PH,
  type TickKeys,
} from "../game/logic";

const noKeys: TickKeys = {
  p1: { left: false, right: false, jump: false },
  p2: { left: false, right: false, jump: false },
};

function runTicks(state: ReturnType<typeof createGameState>, keys: TickKeys, n: number) {
  let s = state;
  for (let i = 0; i < n; i++) s = tickGameState(s, keys);
  return s;
}

// ─── State machine ────────────────────────────────────────────────────────────
describe("game state machine", () => {
  it("starts in title state", () => {
    expect(createGameState().gameState).toBe("title");
  });

  it("ticking in title state does not change to playing", () => {
    const s = runTicks(createGameState(), noKeys, 60);
    expect(s.gameState).toBe("title");
  });

  it("startGame transitions to playing", () => {
    const s = startGame(createGameState());
    expect(s.gameState).toBe("playing");
  });

  it("startGame resets ring counts", () => {
    let s = startGame(createGameState());
    s = { ...s, p1: { ...s.p1, rings: 10 }, p2: { ...s.p2, rings: 8 } };
    const restarted = startGame(s);
    expect(restarted.p1.rings).toBe(0);
    expect(restarted.p2.rings).toBe(0);
  });

  it("startGame resets all rings to uncollected", () => {
    let s = startGame(createGameState());
    s = { ...s, rings: s.rings.map(r => ({ ...r, collected: true })) };
    const restarted = startGame(s);
    expect(restarted.rings.every(r => !r.collected)).toBe(true);
  });

  it("game over when p1 collects WIN_RINGS rings", () => {
    let s = startGame(createGameState());
    s = { ...s, p1: { ...s.p1, rings: WIN_RINGS } };
    s = tickGameState(s, noKeys);
    expect(s.gameState).toBe("over");
    expect(s.winner).toBe("SONIC");
  });

  it("game over when p2 collects WIN_RINGS rings", () => {
    let s = startGame(createGameState());
    s = { ...s, p2: { ...s.p2, rings: WIN_RINGS } };
    s = tickGameState(s, noKeys);
    expect(s.gameState).toBe("over");
    expect(s.winner).toBe("TAILS");
  });

  it("game does not tick players when in over state", () => {
    let s = startGame(createGameState());
    s = { ...s, gameState: "over" as const, p1: { ...s.p1, x: 100 } };
    const after = tickGameState(s, { p1: { left: true, right: false, jump: false }, p2: noKeys.p2 });
    expect(after.p1.x).toBe(100);
  });
});

// ─── Time increments ─────────────────────────────────────────────────────────
describe("time counter", () => {
  it("increments t each tick in title state", () => {
    const s = runTicks(createGameState(), noKeys, 5);
    expect(s.t).toBe(5);
  });

  it("increments t each tick in playing state", () => {
    const s = runTicks(startGame(createGameState()), noKeys, 10);
    expect(s.t).toBe(10);
  });
});

// ─── Player movement ─────────────────────────────────────────────────────────
describe("player movement integration", () => {
  it("p1 moves right when right key held", () => {
    const initialX = startGame(createGameState()).p1.x;
    const s = runTicks(startGame(createGameState()), {
      p1: { left: false, right: true, jump: false },
      p2: noKeys.p2,
    }, 5);
    expect(s.p1.x).toBeGreaterThan(initialX);
  });

  it("p1 moves left when left key held", () => {
    let s = startGame(createGameState());
    s = { ...s, p1: { ...s.p1, x: 400 } };
    const result = runTicks(s, {
      p1: { left: true, right: false, jump: false },
      p2: noKeys.p2,
    }, 5);
    expect(result.p1.x).toBeLessThan(400);
  });

  it("p2 moves right when right key held", () => {
    const s = startGame(createGameState());
    const initialX = s.p2.x;
    const result = runTicks(s, {
      p1: noKeys.p1,
      p2: { left: false, right: true, jump: false },
    }, 5);
    expect(result.p2.x).toBeGreaterThan(initialX);
  });

  it("p1 stays within left canvas boundary", () => {
    let s = startGame(createGameState());
    s = { ...s, p1: { ...s.p1, x: 5 } };
    const result = runTicks(s, {
      p1: { left: true, right: false, jump: false },
      p2: noKeys.p2,
    }, 20);
    expect(result.p1.x).toBeGreaterThanOrEqual(0);
  });

  it("p1 stays within right canvas boundary", () => {
    let s = startGame(createGameState());
    s = { ...s, p1: { ...s.p1, x: W - 60 } };
    const result = runTicks(s, {
      p1: { left: false, right: true, jump: false },
      p2: noKeys.p2,
    }, 20);
    expect(result.p1.x).toBeLessThanOrEqual(W);
  });
});

// ─── Gravity & landing ────────────────────────────────────────────────────────
describe("gravity and landing", () => {
  it("gravity pulls player down when airborne", () => {
    let s = startGame(createGameState());
    const startY = s.p1.y;
    s = { ...s, p1: { ...s.p1, onGround: false, vy: 0 } };
    const result = runTicks(s, noKeys, 3);
    expect(result.p1.y).toBeGreaterThan(startY);
  });

  it("player lands on ground platform and stops falling", () => {
    let s = startGame(createGameState());
    // Put player high up, let gravity bring them down
    s = { ...s, p1: { ...s.p1, y: 100, vy: 0, onGround: false } };
    const result = runTicks(s, noKeys, 80);
    // Should be resting on ground (H - 40) or a platform
    expect(result.p1.onGround).toBe(true);
  });
});

// ─── Ring collection ─────────────────────────────────────────────────────────
describe("ring collection integration", () => {
  it("collecting a ring increments player ring count", () => {
    let s = startGame(createGameState());
    const ring = s.rings[0];
    // Place p1 so hitbox (p.x+8 … p.x+40) overlaps only ring[0] (at ring.x ± 12)
    // Using p.x = ring.x - 40 → hitbox 208–240, ring[0] at 228–252, ring[1] at 258–282 ✓
    s = { ...s, p1: { ...s.p1, x: ring.x - 40, y: ring.y - 8, onGround: true, vy: 0 } };
    const result = tickGameState(s, noKeys);
    expect(result.p1.rings).toBe(1);
    expect(result.rings[0].collected).toBe(true);
  });

  it("collected ring is not collected again next tick", () => {
    let s = startGame(createGameState());
    const ring = s.rings[0];
    s = { ...s, p1: { ...s.p1, x: ring.x - 40, y: ring.y - 8, onGround: true, vy: 0 } };
    s = tickGameState(s, noKeys);
    const rings1 = s.p1.rings;
    s = tickGameState(s, noKeys);
    expect(s.p1.rings).toBe(rings1);
  });

  it("p2 can independently collect rings", () => {
    let s = startGame(createGameState());
    const ring = s.rings[0];
    s = { ...s, p2: { ...s.p2, x: ring.x - 40, y: ring.y - 8, onGround: true, vy: 0 } };
    const result = tickGameState(s, noKeys);
    expect(result.p2.rings).toBe(1);
  });

  it("adds a +1 effect when ring is collected", () => {
    let s = startGame(createGameState());
    const ring = s.rings[0];
    s = { ...s, p1: { ...s.p1, x: ring.x - 40, y: ring.y - 8, onGround: true, vy: 0 } };
    const result = tickGameState(s, noKeys);
    expect(result.effects.length).toBeGreaterThan(0);
    // tickEffects runs in the same frame as collection, decrementing life by 1 (30 → 29)
    expect(result.effects[0].life).toBe(29);
  });
});

// ─── Invincibility ───────────────────────────────────────────────────────────
describe("invincibility", () => {
  it("invincibility timer counts down each tick", () => {
    let s = startGame(createGameState());
    s = { ...s, p1: { ...s.p1, invincible: 50 } };
    const result = tickGameState(s, noKeys);
    expect(result.p1.invincible).toBe(49);
  });

  it("player does not take spike damage while invincible", () => {
    let s = startGame(createGameState());
    const spike = s.spikes[0];
    s = {
      ...s,
      p1: { ...s.p1, x: spike.x + 2, y: spike.y + 2, rings: 10, invincible: 30 },
    };
    const result = tickGameState(s, noKeys);
    expect(result.p1.rings).toBeGreaterThanOrEqual(10);
  });
});

// ─── Effects lifecycle ────────────────────────────────────────────────────────
describe("effects lifecycle", () => {
  it("effects fade and are removed after ~25 ticks", () => {
    let s = startGame(createGameState());
    s = { ...s, effects: [{ x: 100, y: 100, life: 1 }] };
    const result = tickGameState(s, noKeys);
    expect(result.effects).toHaveLength(0);
  });

  it("effects move upward each tick", () => {
    let s = startGame(createGameState());
    s = { ...s, effects: [{ x: 100, y: 200, life: 20 }] };
    const result = tickGameState(s, noKeys);
    expect(result.effects[0].y).toBeLessThan(200);
  });
});

// ─── Win condition end-to-end ─────────────────────────────────────────────────
describe("win condition end-to-end", () => {
  it("game correctly identifies winner when p1 wins", () => {
    let s = startGame(createGameState());
    s = { ...s, p1: { ...s.p1, rings: WIN_RINGS - 1 } };
    // Give p1 one more ring
    const ring = { ...s.rings[0], collected: false };
    s = {
      ...s,
      rings: [ring, ...s.rings.slice(1)],
      p1: { ...s.p1, x: ring.x - 8, y: ring.y - 8, onGround: true, vy: 0 },
    };
    const result = tickGameState(s, noKeys);
    expect(result.gameState).toBe("over");
    expect(result.winner).toBe("SONIC");
  });

  it("game correctly identifies winner when p2 wins", () => {
    let s = startGame(createGameState());
    s = { ...s, p2: { ...s.p2, rings: WIN_RINGS - 1 } };
    const ring = { ...s.rings[0], collected: false };
    s = {
      ...s,
      rings: [ring, ...s.rings.slice(1)],
      p2: { ...s.p2, x: ring.x - 8, y: ring.y - 8, onGround: true, vy: 0 },
    };
    const result = tickGameState(s, noKeys);
    expect(result.gameState).toBe("over");
    expect(result.winner).toBe("TAILS");
  });
});

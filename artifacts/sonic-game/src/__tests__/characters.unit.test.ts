import { describe, it, expect } from "vitest";
import {
  CHARACTERS, getCharacterName, needsDifferentiation,
  makePlayer, createGameState, startGameWithCharacters, tickGameState,
  type CharacterType,
} from "../game/logic";

// ─── CHARACTERS constant ──────────────────────────────────────────────────────
describe("CHARACTERS constant", () => {
  it("has exactly 5 characters", () => {
    expect(CHARACTERS).toHaveLength(5);
  });

  it("includes sonic, shadow, tails, superSonic, knuckles", () => {
    const ids = CHARACTERS.map(c => c.id);
    expect(ids).toContain("sonic");
    expect(ids).toContain("shadow");
    expect(ids).toContain("tails");
    expect(ids).toContain("superSonic");
    expect(ids).toContain("knuckles");
  });

  it("each character has a non-empty name", () => {
    CHARACTERS.forEach(c => {
      expect(c.name.length).toBeGreaterThan(0);
    });
  });

  it("each character has a non-empty description", () => {
    CHARACTERS.forEach(c => {
      expect(c.description.length).toBeGreaterThan(0);
    });
  });

  it("all character ids are unique", () => {
    const ids = CHARACTERS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("sonic is the first character", () => {
    expect(CHARACTERS[0].id).toBe("sonic");
  });

  it("tails is the third character", () => {
    expect(CHARACTERS[2].id).toBe("tails");
  });
});

// ─── getCharacterName ─────────────────────────────────────────────────────────
describe("getCharacterName", () => {
  it("returns SONIC for sonic", () => {
    expect(getCharacterName("sonic")).toBe("SONIC");
  });

  it("returns SHADOW for shadow", () => {
    expect(getCharacterName("shadow")).toBe("SHADOW");
  });

  it("returns TAILS for tails", () => {
    expect(getCharacterName("tails")).toBe("TAILS");
  });

  it("returns SUPER SONIC for superSonic", () => {
    expect(getCharacterName("superSonic")).toBe("SUPER SONIC");
  });

  it("returns KNUCKLES for knuckles", () => {
    expect(getCharacterName("knuckles")).toBe("KNUCKLES");
  });
});

// ─── makePlayer with CharacterType ────────────────────────────────────────────
describe("makePlayer with characterType", () => {
  it("stores the characterType on the player", () => {
    expect(makePlayer(100, "sonic").characterType).toBe("sonic");
    expect(makePlayer(100, "shadow").characterType).toBe("shadow");
    expect(makePlayer(100, "tails").characterType).toBe("tails");
    expect(makePlayer(100, "superSonic").characterType).toBe("superSonic");
    expect(makePlayer(100, "knuckles").characterType).toBe("knuckles");
  });

  it("sets the name from getCharacterName", () => {
    expect(makePlayer(100, "sonic").name).toBe("SONIC");
    expect(makePlayer(100, "shadow").name).toBe("SHADOW");
    expect(makePlayer(100, "tails").name).toBe("TAILS");
    expect(makePlayer(100, "superSonic").name).toBe("SUPER SONIC");
    expect(makePlayer(100, "knuckles").name).toBe("KNUCKLES");
  });

  it("accepts an optional facing direction (default 1)", () => {
    expect(makePlayer(100, "sonic").facing).toBe(1);
    expect(makePlayer(100, "sonic", 1).facing).toBe(1);
    expect(makePlayer(100, "sonic", -1).facing).toBe(-1);
  });

  it("does NOT have an isSonic field", () => {
    const p = makePlayer(100, "sonic");
    expect((p as Record<string, unknown>)["isSonic"]).toBeUndefined();
  });
});

// ─── needsDifferentiation ─────────────────────────────────────────────────────
describe("needsDifferentiation", () => {
  it("returns true when both players have the same character", () => {
    const p1 = makePlayer(100, "sonic");
    const p2 = makePlayer(900, "sonic");
    expect(needsDifferentiation(p1, p2)).toBe(true);
  });

  it("returns true for all five characters when duplicated", () => {
    const chars: CharacterType[] = ["sonic", "shadow", "tails", "superSonic", "knuckles"];
    chars.forEach(c => {
      expect(needsDifferentiation(makePlayer(0, c), makePlayer(0, c))).toBe(true);
    });
  });

  it("returns false when players have different characters", () => {
    const p1 = makePlayer(100, "sonic");
    const p2 = makePlayer(900, "tails");
    expect(needsDifferentiation(p1, p2)).toBe(false);
  });

  it("returns false for every non-duplicate pairing (spot check)", () => {
    expect(needsDifferentiation(makePlayer(0, "sonic"), makePlayer(0, "shadow"))).toBe(false);
    expect(needsDifferentiation(makePlayer(0, "shadow"), makePlayer(0, "knuckles"))).toBe(false);
    expect(needsDifferentiation(makePlayer(0, "superSonic"), makePlayer(0, "tails"))).toBe(false);
  });
});

// ─── startGameWithCharacters ──────────────────────────────────────────────────
describe("startGameWithCharacters", () => {
  it("transitions gameState to playing", () => {
    const s = createGameState();
    const result = startGameWithCharacters(s, "sonic", "shadow");
    expect(result.gameState).toBe("playing");
  });

  it("assigns chosen characters to p1 and p2", () => {
    const s = createGameState();
    const result = startGameWithCharacters(s, "knuckles", "superSonic");
    expect(result.p1.characterType).toBe("knuckles");
    expect(result.p2.characterType).toBe("superSonic");
  });

  it("resets both players' ring counts to 0", () => {
    const s = { ...createGameState() };
    const result = startGameWithCharacters(s, "sonic", "tails");
    expect(result.p1.rings).toBe(0);
    expect(result.p2.rings).toBe(0);
  });

  it("resets all rings to uncollected", () => {
    const s = createGameState();
    const result = startGameWithCharacters(s, "sonic", "tails");
    expect(result.rings.every(r => !r.collected)).toBe(true);
  });

  it("sets correct names for chosen characters", () => {
    const s = createGameState();
    const result = startGameWithCharacters(s, "shadow", "knuckles");
    expect(result.p1.name).toBe("SHADOW");
    expect(result.p2.name).toBe("KNUCKLES");
  });

  it("p1 faces right and p2 faces left initially", () => {
    const s = createGameState();
    const result = startGameWithCharacters(s, "sonic", "tails");
    expect(result.p1.facing).toBe(1);
    expect(result.p2.facing).toBe(-1);
  });

  it("works when both players choose the same character", () => {
    const s = createGameState();
    const result = startGameWithCharacters(s, "sonic", "sonic");
    expect(result.p1.characterType).toBe("sonic");
    expect(result.p2.characterType).toBe("sonic");
    expect(result.gameState).toBe("playing");
  });
});

// ─── GameState "selecting" phase ──────────────────────────────────────────────
describe("GameState selecting phase", () => {
  it("createGameState starts in title (not selecting)", () => {
    expect(createGameState().gameState).toBe("title");
  });

  it("gameState can be set to 'selecting'", () => {
    const s = { ...createGameState(), gameState: "selecting" as const };
    expect(s.gameState).toBe("selecting");
  });

  it("ticking a 'selecting' state increments t but does not move players", () => {
    const noKeys = { p1: { left: false, right: false, jump: false }, p2: { left: false, right: false, jump: false } };
    const s = { ...createGameState(), gameState: "selecting" as const };
    const p1x = s.p1.x;
    const result = tickGameState(s, noKeys);
    expect(result.t).toBe(1);
    expect(result.p1.x).toBe(p1x);
  });
});

// ─── Constants ───────────────────────────────────────────────────────────────
export const W = 1280;
export const H = 720;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -15;
export const SPEED = 5;
export const WIN_RINGS = 15;
export const PW = 48;
export const PH = 56;

// ─── Character types ──────────────────────────────────────────────────────────
export type CharacterType = "sonic" | "shadow" | "tails" | "superSonic" | "knuckles";

export interface CharacterDef {
  id: CharacterType;
  name: string;
  description: string;
}

export const CHARACTERS: CharacterDef[] = [
  { id: "sonic",      name: "SONIC",       description: "Fastest thing alive" },
  { id: "shadow",     name: "SHADOW",      description: "Ultimate life form" },
  { id: "tails",      name: "TAILS",       description: "Genius fox inventor" },
  { id: "superSonic", name: "SUPER SONIC", description: "Invincible power" },
  { id: "knuckles",   name: "KNUCKLES",    description: "Master of power" },
];

export function getCharacterName(type: CharacterType): string {
  return CHARACTERS.find(c => c.id === type)!.name;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Platform { x: number; y: number; w: number; h: number; color: string }
export interface Ring { x: number; y: number; collected: boolean; animFrame: number }
export interface Spike { x: number; y: number; w: number; h: number }
export interface Spring { x: number; y: number; active: boolean; timer: number }
export interface Effect { x: number; y: number; life: number }

export interface Player {
  x: number; y: number;
  vx: number; vy: number;
  onGround: boolean;
  rings: number;
  facing: number;
  animFrame: number;
  animTimer: number;
  running: boolean;
  invincible: number;
  spinning: boolean;
  spinTimer: number;
  characterType: CharacterType;
  name: string;
}

export interface GameState {
  t: number;
  gameState: "title" | "selecting" | "playing" | "over";
  winner: string;
  p1: Player;
  p2: Player;
  platforms: Platform[];
  rings: Ring[];
  spikes: Spike[];
  springs: Spring[];
  effects: Effect[];
}

export interface PlayerKeys {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface TickKeys {
  p1: PlayerKeys;
  p2: PlayerKeys;
}

// ─── Character helpers ────────────────────────────────────────────────────────
export function needsDifferentiation(p1: Player, p2: Player): boolean {
  return p1.characterType === p2.characterType;
}

// ─── Factories ────────────────────────────────────────────────────────────────
export function makePlayer(x: number, characterType: CharacterType, facing = 1): Player {
  return {
    x, y: H - 200,
    vx: 0, vy: 0,
    onGround: false,
    rings: 0,
    facing,
    animFrame: 0, animTimer: 0,
    running: false,
    invincible: 0,
    spinning: false, spinTimer: 0,
    characterType,
    name: getCharacterName(characterType),
  };
}

export function makePlatforms(): Platform[] {
  return [
    { x: 0,    y: H - 40,  w: W,   h: 40, color: "#2ecc71" },
    { x: 200,  y: H - 150, w: 180, h: 20, color: "#27ae60" },
    { x: 500,  y: H - 220, w: 200, h: 20, color: "#27ae60" },
    { x: 800,  y: H - 170, w: 160, h: 20, color: "#27ae60" },
    { x: 1050, y: H - 250, w: 180, h: 20, color: "#27ae60" },
    { x: 350,  y: H - 320, w: 150, h: 20, color: "#27ae60" },
    { x: 650,  y: H - 370, w: 120, h: 20, color: "#27ae60" },
    { x: 900,  y: H - 340, w: 140, h: 20, color: "#27ae60" },
    { x: 100,  y: H - 410, w: 130, h: 20, color: "#f39c12" },
    { x: 550,  y: H - 480, w: 200, h: 20, color: "#f39c12" },
    { x: 1000, y: H - 430, w: 150, h: 20, color: "#f39c12" },
    { x: 300,  y: H - 540, w: 160, h: 20, color: "#e74c3c" },
    { x: 720,  y: H - 560, w: 140, h: 20, color: "#e74c3c" },
    { x: 580,  y: H - 640, w: 130, h: 20, color: "#9b59b6" },
  ];
}

export function makeRings(): Ring[] {
  const positions = [
    { x: 240, y: H - 180 }, { x: 270, y: H - 180 }, { x: 300, y: H - 180 },
    { x: 550, y: H - 250 }, { x: 580, y: H - 250 }, { x: 610, y: H - 250 },
    { x: 850, y: H - 200 }, { x: 880, y: H - 200 },
    { x: 1080, y: H - 280 }, { x: 1110, y: H - 280 }, { x: 1140, y: H - 280 },
    { x: 380, y: H - 350 }, { x: 410, y: H - 350 }, { x: 440, y: H - 350 },
    { x: 670, y: H - 400 }, { x: 700, y: H - 400 },
    { x: 590, y: H - 510 }, { x: 620, y: H - 510 }, { x: 650, y: H - 510 },
    { x: 600, y: H - 670 },
  ];
  return positions.map((p, i) => ({ x: p.x, y: p.y, collected: false, animFrame: i * 3 }));
}

export function makeSpikes(): Spike[] {
  return [
    { x: 440,  y: H - 60, w: 30, h: 20 },
    { x: 750,  y: H - 60, w: 30, h: 20 },
    { x: 1000, y: H - 60, w: 30, h: 20 },
  ];
}

export function makeSprings(): Spring[] {
  return [
    { x: 160, y: H - 56, active: false, timer: 0 },
    { x: 720, y: H - 56, active: false, timer: 0 },
  ];
}

export function createGameState(): GameState {
  return {
    t: 0,
    gameState: "title",
    winner: "",
    p1: makePlayer(120, "sonic", 1),
    p2: makePlayer(W - 170, "tails", -1),
    platforms: makePlatforms(),
    rings: makeRings(),
    spikes: makeSpikes(),
    springs: makeSprings(),
    effects: [],
  };
}

// ─── Pure collision / physics helpers ────────────────────────────────────────
export function rectOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function clampPlayerToCanvas(p: Player): Player {
  return {
    ...p,
    x: Math.max(0, Math.min(W - PW, p.x)),
  };
}

export function applyGravity(p: Player): Player {
  const vy = Math.min(p.vy + GRAVITY, 20);
  return { ...p, vy };
}

export function applyMovement(p: Player, keys: PlayerKeys): Player {
  let { vx, facing, running, spinning, spinTimer, vy, onGround } = p;

  if (keys.left)  { vx = -SPEED; facing = -1; running = true; }
  else if (keys.right) { vx = SPEED; facing = 1; running = true; }
  else { vx = vx * 0.75; running = Math.abs(vx) > 0.5; }

  if (keys.jump && onGround) {
    vy = JUMP_FORCE;
    onGround = false;
    spinning = true;
    spinTimer = 28;
  }

  if (spinTimer > 0) { spinTimer--; if (spinTimer === 0) spinning = false; }

  return { ...p, vx, vy, facing, running, spinning, spinTimer, onGround };
}

export function integratePlatformCollisions(p: Player, platforms: Platform[]): Player {
  let { x, y, vx, vy, onGround, spinning } = p;

  x += vx;
  y += vy;
  x = Math.max(0, Math.min(W - PW, x));

  for (const plat of platforms) {
    if (!rectOverlap(x, y, PW, PH, plat.x, plat.y, plat.w, plat.h)) continue;

    const fromTop    = y + PH - plat.y;
    const fromBottom = plat.y + plat.h - y;
    const fromLeft   = x + PW - plat.x;
    const fromRight  = plat.x + plat.w - x;
    const min = Math.min(fromTop, fromBottom, fromLeft, fromRight);

    if (min === fromTop && vy >= 0) {
      y = plat.y - PH; vy = 0; onGround = true; spinning = false;
    } else if (min === fromBottom && vy < 0) {
      y = plat.y + plat.h; vy = 0;
    } else if (min === fromLeft) {
      x = plat.x - PW; vx = 0;
    } else {
      x = plat.x + plat.w; vx = 0;
    }
  }

  if (y > H + 100) { y = 80; vy = 0; }

  return { ...p, x, y, vx, vy, onGround, spinning };
}

export interface SpikeResult { player: Player; hit: boolean }
export function applySpikeHit(p: Player, spikes: Spike[]): SpikeResult {
  if (p.invincible > 0) return { player: p, hit: false };
  for (const s of spikes) {
    if (rectOverlap(p.x + 6, p.y + 6, PW - 12, PH - 12, s.x, s.y, s.w, s.h)) {
      return {
        player: { ...p, rings: Math.max(0, p.rings - 3), invincible: 90, vy: -9 },
        hit: true,
      };
    }
  }
  return { player: p, hit: false };
}

export interface RingCollectResult {
  player: Player;
  rings: Ring[];
  effects: Effect[];
}
export function collectRings(p: Player, rings: Ring[]): RingCollectResult {
  const effects: Effect[] = [];
  let playerRings = p.rings;
  const updatedRings = rings.map(r => {
    if (r.collected) return r;
    if (rectOverlap(p.x + 8, p.y + 8, PW - 16, PH - 16, r.x - 12, r.y - 12, 24, 24)) {
      effects.push({ x: r.x, y: r.y - 20, life: 30 });
      playerRings++;
      return { ...r, collected: true };
    }
    return r;
  });
  return { player: { ...p, rings: playerRings }, rings: updatedRings, effects };
}

export interface SpringResult { player: Player; springs: Spring[] }
export function applySpringLaunch(p: Player, springs: Spring[]): SpringResult {
  const updated = springs.map(s => ({ ...s }));
  let player = { ...p };
  for (const s of updated) {
    if (rectOverlap(p.x + 4, p.y + 4, PW - 8, PH - 8, s.x, s.y + 8, 30, 8)) {
      player = { ...player, vy: -24, onGround: false, spinning: true, spinTimer: 45 };
      s.active = true;
      s.timer = 20;
    }
  }
  return { player, springs: updated };
}

export function tickInvincibility(p: Player): Player {
  return p.invincible > 0 ? { ...p, invincible: p.invincible - 1 } : p;
}

export function tickAnimation(p: Player): Player {
  const animTimer = p.animTimer + 1;
  if (p.running && animTimer > 5) {
    return { ...p, animFrame: (p.animFrame + 1) % 4, animTimer: 0 };
  }
  return { ...p, animTimer };
}

export function tickSprings(springs: Spring[]): Spring[] {
  return springs.map(s => {
    if (s.timer <= 0) return s;
    const timer = s.timer - 1;
    return { ...s, timer, active: timer > 0 };
  });
}

export function tickEffects(effects: Effect[]): Effect[] {
  return effects
    .map(e => ({ ...e, y: e.y - 1.2, life: e.life - 1 }))
    .filter(e => e.life > 0);
}

export function checkWin(p1: Player, p2: Player): { over: boolean; winner: string } {
  if (p1.rings >= WIN_RINGS) return { over: true, winner: p1.name };
  if (p2.rings >= WIN_RINGS) return { over: true, winner: p2.name };
  return { over: false, winner: "" };
}

// ─── Full frame tick (pure) ───────────────────────────────────────────────────
export function tickGameState(state: GameState, keys: TickKeys): GameState {
  if (state.gameState !== "playing") return { ...state, t: state.t + 1 };

  let { p1, p2, rings, springs, effects } = state;

  p1 = applyMovement(p1, keys.p1);
  p1 = applyGravity(p1);
  p1 = integratePlatformCollisions(p1, state.platforms);
  const sr1 = applySpringLaunch(p1, springs);
  p1 = sr1.player; springs = sr1.springs;
  const sp1 = applySpikeHit(p1, state.spikes);
  p1 = sp1.player;
  const cr1 = collectRings(p1, rings);
  p1 = cr1.player; rings = cr1.rings; effects = [...effects, ...cr1.effects];
  p1 = tickInvincibility(p1);
  p1 = tickAnimation(p1);

  p2 = applyMovement(p2, keys.p2);
  p2 = applyGravity(p2);
  p2 = integratePlatformCollisions(p2, state.platforms);
  const sr2 = applySpringLaunch(p2, springs);
  p2 = sr2.player; springs = sr2.springs;
  const sp2 = applySpikeHit(p2, state.spikes);
  p2 = sp2.player;
  const cr2 = collectRings(p2, rings);
  p2 = cr2.player; rings = cr2.rings; effects = [...effects, ...cr2.effects];
  p2 = tickInvincibility(p2);
  p2 = tickAnimation(p2);

  springs = tickSprings(springs);
  effects = tickEffects(effects);

  const win = checkWin(p1, p2);

  return {
    ...state,
    t: state.t + 1,
    p1, p2, rings, springs, effects,
    gameState: win.over ? "over" : "playing",
    winner: win.winner,
  };
}

export function startGame(state: GameState): GameState {
  return {
    ...createGameState(),
    gameState: "playing",
    p1: makePlayer(120, state.p1.characterType, 1),
    p2: makePlayer(W - 170, state.p2.characterType, -1),
  };
}

export function startGameWithCharacters(
  _state: GameState,
  p1Char: CharacterType,
  p2Char: CharacterType,
): GameState {
  return {
    ...createGameState(),
    gameState: "playing",
    p1: makePlayer(120, p1Char, 1),
    p2: makePlayer(W - 170, p2Char, -1),
  };
}

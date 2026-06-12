import { useEffect, useRef, useState, useCallback } from "react";

const W = 1280;
const H = 720;
const GRAVITY = 0.6;
const JUMP_FORCE = -14;
const SPEED = 5;
const RING_COUNT = 20;
const WIN_RINGS = 15;

interface Vec { x: number; y: number; }
interface Platform { x: number; y: number; w: number; h: number; color: string; }
interface Ring { x: number; y: number; collected: boolean; animFrame: number; }
interface Spike { x: number; y: number; w: number; h: number; }
interface Spring { x: number; y: number; active: boolean; timer: number; }

interface Player {
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
  color: string;
  altColor: string;
  eyeColor: string;
  shoeColor: string;
  name: string;
}

function makePlatforms(): Platform[] {
  return [
    { x: 0, y: H - 40, w: W, h: 40, color: "#2ecc71" },
    { x: 200, y: H - 150, w: 180, h: 20, color: "#27ae60" },
    { x: 500, y: H - 220, w: 200, h: 20, color: "#27ae60" },
    { x: 800, y: H - 170, w: 160, h: 20, color: "#27ae60" },
    { x: 1050, y: H - 250, w: 180, h: 20, color: "#27ae60" },
    { x: 350, y: H - 320, w: 150, h: 20, color: "#27ae60" },
    { x: 650, y: H - 370, w: 120, h: 20, color: "#27ae60" },
    { x: 900, y: H - 340, w: 140, h: 20, color: "#27ae60" },
    { x: 100, y: H - 410, w: 130, h: 20, color: "#f39c12" },
    { x: 550, y: H - 480, w: 200, h: 20, color: "#f39c12" },
    { x: 1000, y: H - 430, w: 150, h: 20, color: "#f39c12" },
    { x: 300, y: H - 540, w: 160, h: 20, color: "#e74c3c" },
    { x: 720, y: H - 560, w: 140, h: 20, color: "#e74c3c" },
    { x: 580, y: H - 640, w: 130, h: 20, color: "#9b59b6" },
  ];
}

function makeRings(platforms: Platform[]): Ring[] {
  const rings: Ring[] = [];
  const positions: Vec[] = [
    { x: 240, y: H - 180 }, { x: 270, y: H - 180 }, { x: 300, y: H - 180 },
    { x: 550, y: H - 250 }, { x: 580, y: H - 250 }, { x: 610, y: H - 250 },
    { x: 850, y: H - 200 }, { x: 880, y: H - 200 },
    { x: 1080, y: H - 280 }, { x: 1110, y: H - 280 }, { x: 1140, y: H - 280 },
    { x: 380, y: H - 350 }, { x: 410, y: H - 350 }, { x: 440, y: H - 350 },
    { x: 670, y: H - 400 }, { x: 700, y: H - 400 },
    { x: 590, y: H - 510 }, { x: 620, y: H - 510 }, { x: 650, y: H - 510 },
    { x: 600, y: H - 670 },
  ];
  for (let i = 0; i < Math.min(RING_COUNT, positions.length); i++) {
    rings.push({ x: positions[i].x, y: positions[i].y, collected: false, animFrame: i * 3 });
  }
  return rings;
}

function makeSpikes(): Spike[] {
  return [
    { x: 440, y: H - 60, w: 30, h: 20 },
    { x: 750, y: H - 60, w: 30, h: 20 },
    { x: 1000, y: H - 60, w: 30, h: 20 },
  ];
}

function makeSprings(): Spring[] {
  return [
    { x: 160, y: H - 56, active: false, timer: 0 },
    { x: 720, y: H - 56, active: false, timer: 0 },
  ];
}

function makePlayer(x: number, color: string, altColor: string, eyeColor: string, shoeColor: string, name: string): Player {
  return {
    x, y: H - 150,
    vx: 0, vy: 0,
    onGround: false,
    rings: 0,
    facing: 1,
    animFrame: 0,
    animTimer: 0,
    running: false,
    invincible: 0,
    spinning: false,
    spinTimer: 0,
    color, altColor, eyeColor, shoeColor, name,
  };
}

function rectOverlap(ax: number, ay: number, aw: number, ah: number,
                     bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + 20;
  const cy = p.y + 24;
  const blink = p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0;
  if (blink) return;

  ctx.save();
  if (p.facing < 0) {
    ctx.translate(cx, cy);
    ctx.scale(-1, 1);
    ctx.translate(-cx, -cy);
  }

  if (p.spinning) {
    const spin = (t * 0.4) % (Math.PI * 2);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin);
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = p.altColor;
    ctx.fill();
    ctx.restore();
  } else {
    const bob = p.running ? Math.sin(t * 0.3) * 2 : 0;
    const legSwing = p.running ? Math.sin(t * 0.3) * 12 : 0;

    ctx.beginPath();
    ctx.ellipse(cx, cy + bob, 20, 18, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx + 6, cy - 10 + bob, 14, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 6 + bob, 12, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.altColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx + 14, cy - 8 + bob, 8, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx + 16, cy - 9 + bob, 4, 0, Math.PI * 2);
    ctx.fillStyle = p.eyeColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx + 17, cy - 9 + bob, 2, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx + 17.5, cy - 10 + bob, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    const spines = [[-4, -22], [-10, -20], [-16, -17]];
    spines.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(cx + sx + 6, cy + sy + 10 + bob);
      ctx.lineTo(cx + sx - 8, cy + sy + 4 + bob);
      ctx.lineTo(cx + sx + 2, cy + sy + 14 + bob);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    const lx1 = cx - 8 + Math.sin((legSwing * Math.PI) / 180) * 8;
    const lx2 = cx + 6 - Math.sin((legSwing * Math.PI) / 180) * 8;
    const ly = cy + 18 + bob;

    ctx.beginPath();
    ctx.roundRect(lx1 - 10, ly, 22, 10, 5);
    ctx.fillStyle = p.shoeColor;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(lx2 - 2, ly, 22, 10, 5);
    ctx.fillStyle = p.shoeColor;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

function drawRing(ctx: CanvasRenderingContext2D, r: Ring, t: number) {
  if (r.collected) return;
  const wobble = Math.cos((t + r.animFrame) * 0.08) * 6;
  const rx = r.x + wobble;

  ctx.save();
  ctx.translate(rx, r.y);

  const grad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 12);
  grad.addColorStop(0, "#FFE066");
  grad.addColorStop(0.4, "#FFD700");
  grad.addColorStop(1, "#B8860B");

  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = "transparent";
  ctx.clearRect(-8, -8, 16, 16);

  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.arc(0, 0, 7, 0, Math.PI * 2, true);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-3, -4, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fill();

  ctx.restore();
}

function drawSpike(ctx: CanvasRenderingContext2D, s: Spike) {
  const count = Math.floor(s.w / 10);
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.moveTo(s.x + i * 10, s.y + s.h);
    ctx.lineTo(s.x + i * 10 + 5, s.y);
    ctx.lineTo(s.x + i * 10 + 10, s.y + s.h);
    ctx.closePath();
    ctx.fillStyle = "#aaa";
    ctx.fill();
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawSpring(ctx: CanvasRenderingContext2D, s: Spring) {
  const compressed = s.active;
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(0, compressed ? 8 : 2, 30, compressed ? 6 : 12);
  const stripes = 4;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#c0392b" : "#ff6b6b";
    ctx.fillRect(0, (compressed ? 8 : 2) + i * (compressed ? 1.5 : 3), 30, compressed ? 1.5 : 3);
  }
  ctx.fillStyle = "#f39c12";
  ctx.fillRect(-2, compressed ? 12 : 12, 34, 4);
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, t: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#1a0a4e");
  grad.addColorStop(0.5, "#0d4f8e");
  grad.addColorStop(1, "#0a2e5e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 60; i++) {
    const sx = ((i * 127 + t * (i % 3 === 0 ? 0.1 : 0.05)) % W + W) % W;
    const sy = (i * 89) % (H * 0.7);
    const size = (i % 3) + 1;
    const alpha = 0.4 + (Math.sin(t * 0.05 + i) + 1) * 0.3;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  for (let i = 0; i < 5; i++) {
    const mx = ((i * 250 + 50 + t * 0.2) % (W + 200)) - 100;
    const my = 80 + i * 50;
    ctx.save();
    ctx.translate(mx, my);
    const grad2 = ctx.createRadialGradient(0, 0, 10, 0, 0, 60);
    grad2.addColorStop(0, "rgba(255,255,255,0.15)");
    grad2.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fillStyle = grad2;
    ctx.fill();
    ctx.restore();
  }
}

function drawPlatform(ctx: CanvasRenderingContext2D, p: Platform) {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.w, p.h, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.roundRect(p.x + 4, p.y + 2, p.w - 8, 5, 3);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);
}

function drawHUD(ctx: CanvasRenderingContext2D, p1: Player, p2: Player, gameState: string, winner: string) {
  if (gameState === "title") return;

  const drawPlayerHUD = (p: Player, x: number, side: "left" | "right") => {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.roundRect(x, 10, 200, 70, 12);
    ctx.fill();

    ctx.fillStyle = p.color;
    ctx.font = "bold 14px Arial";
    ctx.textAlign = side === "left" ? "left" : "right";
    ctx.fillText(p.name, side === "left" ? x + 14 : x + 186, 32);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = side === "left" ? "left" : "right";
    ctx.fillText(`${p.rings} rings`, side === "left" ? x + 14 : x + 186, 60);

    const barW = 160;
    const barX = x + 20;
    const barY = 68;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(barX, barY, barW, 8);
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(barX, barY, (p.rings / WIN_RINGS) * barW, 8);

    ctx.restore();
  };

  drawPlayerHUD(p1, 10, "left");
  drawPlayerHUD(p2, W - 210, "right");

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 80, 10, 160, 40, 10);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`First to ${WIN_RINGS} rings wins!`, W / 2, 35);

  if (gameState === "over") {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.textAlign = "center";

    const grad = ctx.createLinearGradient(W/2 - 200, H/2 - 80, W/2 + 200, H/2 + 80);
    grad.addColorStop(0, "#FFD700");
    grad.addColorStop(0.5, "#FFF");
    grad.addColorStop(1, "#FFD700");

    ctx.font = "bold 72px Arial";
    ctx.fillStyle = grad;
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 30;
    ctx.fillText("🏆 " + winner + " WINS! 🏆", W / 2, H / 2 - 20);

    ctx.shadowBlur = 0;
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Press ENTER or SPACE to play again", W / 2, H / 2 + 50);
    ctx.restore();
  }
}

function drawTitle(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();
  ctx.textAlign = "center";

  ctx.font = "bold 82px Arial";
  const tGrad = ctx.createLinearGradient(W/2 - 250, H/2 - 120, W/2 + 250, H/2 - 40);
  tGrad.addColorStop(0, "#00BFFF");
  tGrad.addColorStop(0.5, "#FFD700");
  tGrad.addColorStop(1, "#00BFFF");
  ctx.fillStyle = tGrad;
  ctx.shadowColor = "#00BFFF";
  ctx.shadowBlur = 20 + Math.sin(t * 0.05) * 10;
  ctx.fillText("SONIC DASH", W / 2, H / 2 - 60);

  ctx.shadowBlur = 0;
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#FFD700";
  ctx.fillText("2 PLAYER RING RUSH", W / 2, H / 2 - 15);

  ctx.font = "18px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("PLAYER 1:  A / D  to run   W  to jump", W / 2, H / 2 + 45);
  ctx.fillText("PLAYER 2:  ← / →  to run   ↑  to jump", W / 2, H / 2 + 75);
  ctx.fillText("Press SPACE or ENTER to start!", W / 2, H / 2 + 130);

  const pulse = Math.abs(Math.sin(t * 0.07)) * 0.5 + 0.5;
  ctx.font = `bold ${24 + pulse * 4}px Arial`;
  ctx.fillStyle = `rgba(255,215,0,${0.7 + pulse * 0.3})`;
  ctx.fillText("★ Collect " + WIN_RINGS + " rings to win! ★", W / 2, H / 2 + 170);

  ctx.restore();
}

function drawCollectEffect(ctx: CanvasRenderingContext2D, effects: {x:number;y:number;life:number}[]) {
  effects.forEach(e => {
    const alpha = e.life / 30;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${18 + (30 - e.life)}px Arial`;
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "center";
    ctx.fillText("+1", e.x, e.y);
    ctx.restore();
  });
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    t: 0,
    gameState: "title" as "title" | "playing" | "over",
    winner: "",
    p1: makePlayer(150, "#2980b9", "#ecf0f1", "#27ae60", "#c0392b", "SONIC"),
    p2: makePlayer(W - 190, "#f39c12", "#fff3cd", "#8e44ad", "#1a1a1a", "TAILS"),
    platforms: makePlatforms(),
    rings: [] as Ring[],
    spikes: makeSpikes(),
    springs: makeSprings(),
    keys: {} as Record<string, boolean>,
    effects: [] as { x: number; y: number; life: number }[],
  });

  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.p1 = makePlayer(150, "#2980b9", "#ecf0f1", "#27ae60", "#c0392b", "SONIC");
    s.p2 = makePlayer(W - 190, "#f39c12", "#fff3cd", "#8e44ad", "#1a1a1a", "TAILS");
    s.rings = makeRings(s.platforms);
    s.spikes = makeSpikes();
    s.springs = makeSprings();
    s.effects = [];
    s.gameState = "playing";
    s.winner = "";
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    s.rings = makeRings(s.platforms);

    const onKey = (e: KeyboardEvent, down: boolean) => {
      s.keys[e.code] = down;
      if (down && s.gameState !== "playing") {
        if (["Space", "Enter"].includes(e.code)) {
          if (s.gameState === "title") resetGame();
          else if (s.gameState === "over") resetGame();
        }
      }
      e.preventDefault();
    };

    window.addEventListener("keydown", e => onKey(e, true));
    window.addEventListener("keyup", e => onKey(e, false));
    return () => {
      window.removeEventListener("keydown", e => onKey(e, true));
      window.removeEventListener("keyup", e => onKey(e, false));
    };
  }, [resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const updatePlayer = (p: Player, leftKey: string, rightKey: string, jumpKey: string, altJumpKey?: string) => {
      const s = stateRef.current;
      const left = s.keys[leftKey];
      const right = s.keys[rightKey];
      const jump = s.keys[jumpKey] || (altJumpKey ? s.keys[altJumpKey] : false);

      if (left) { p.vx = -SPEED; p.facing = -1; p.running = true; }
      else if (right) { p.vx = SPEED; p.facing = 1; p.running = true; }
      else { p.vx *= 0.8; p.running = Math.abs(p.vx) > 0.5; }

      if (jump && p.onGround) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        p.spinning = true;
        p.spinTimer = 30;
      }

      if (p.spinTimer > 0) {
        p.spinTimer--;
        if (p.spinTimer === 0) p.spinning = false;
      }

      p.vy += GRAVITY;
      if (p.vy > 20) p.vy = 20;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = 0;
      if (p.x > W - 40) p.x = W - 40;

      p.onGround = false;
      for (const plat of s.platforms) {
        const px = p.x, py = p.y, pw = 40, ph = 48;
        if (rectOverlap(px, py, pw, ph, plat.x, plat.y, plat.w, plat.h)) {
          const fromTop = p.y + ph - plat.y;
          const fromBottom = plat.y + plat.h - p.y;
          const fromLeft = p.x + pw - plat.x;
          const fromRight = plat.x + plat.w - p.x;
          const minOverlap = Math.min(fromTop, fromBottom, fromLeft, fromRight);
          if (minOverlap === fromTop && p.vy >= 0) {
            p.y = plat.y - ph;
            p.vy = 0;
            p.onGround = true;
            p.spinning = false;
          } else if (minOverlap === fromBottom && p.vy < 0) {
            p.y = plat.y + plat.h;
            p.vy = 0;
          } else if (minOverlap === fromLeft) {
            p.x = plat.x - pw;
            p.vx = 0;
          } else if (minOverlap === fromRight) {
            p.x = plat.x + plat.w;
            p.vx = 0;
          }
        }
      }

      for (const spike of s.spikes) {
        if (p.invincible === 0 && rectOverlap(p.x + 4, p.y + 4, 32, 44, spike.x, spike.y, spike.w, spike.h)) {
          p.rings = Math.max(0, p.rings - 3);
          p.invincible = 90;
          p.vy = -8;
        }
      }

      for (const spring of s.springs) {
        if (rectOverlap(p.x + 4, p.y + 4, 32, 44, spring.x, spring.y + 6, 30, 10)) {
          p.vy = -22;
          p.onGround = false;
          spring.active = true;
          spring.timer = 20;
          p.spinning = true;
          p.spinTimer = 40;
        }
      }

      for (const r of s.rings) {
        if (!r.collected && rectOverlap(p.x + 8, p.y + 8, 24, 32, r.x - 12, r.y - 12, 24, 24)) {
          r.collected = true;
          p.rings++;
          s.effects.push({ x: r.x, y: r.y - 20, life: 30 });
        }
      }

      if (p.y > H + 100) {
        p.y = 100;
        p.vy = 0;
      }

      if (p.invincible > 0) p.invincible--;

      p.animTimer++;
      if (p.running && p.animTimer > 6) {
        p.animFrame = (p.animFrame + 1) % 4;
        p.animTimer = 0;
      }
    };

    const update = () => {
      const s = stateRef.current;
      s.t++;

      if (s.gameState !== "playing") return;

      updatePlayer(s.p1, "KeyA", "KeyD", "KeyW");
      updatePlayer(s.p2, "ArrowLeft", "ArrowRight", "ArrowUp");

      for (const sp of s.springs) {
        if (sp.timer > 0) {
          sp.timer--;
          if (sp.timer === 0) sp.active = false;
        }
      }

      s.effects = s.effects.map(e => ({ ...e, y: e.y - 1, life: e.life - 1 })).filter(e => e.life > 0);

      if (s.p1.rings >= WIN_RINGS) { s.gameState = "over"; s.winner = s.p1.name; }
      if (s.p2.rings >= WIN_RINGS) { s.gameState = "over"; s.winner = s.p2.name; }
    };

    const render = () => {
      const s = stateRef.current;
      const { t, p1, p2, platforms, rings, spikes, springs, effects, gameState, winner } = s;

      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, t);

      if (gameState === "title") {
        drawTitle(ctx, t);
        return;
      }

      for (const plat of platforms) drawPlatform(ctx, plat);
      for (const spike of spikes) drawSpike(ctx, spike);
      for (const spring of springs) drawSpring(ctx, spring);
      for (const ring of rings) drawRing(ctx, ring, t);
      drawCollectEffect(ctx, effects);
      drawPlayer(ctx, p1, t);
      drawPlayer(ctx, p2, t);
      drawHUD(ctx, p1, p2, gameState, winner);
    };

    const loop = () => {
      update();
      render();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh", background: "#1a0a2e" }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 0 60px rgba(0,100,255,0.5)" }}
      />
    </div>
  );
}

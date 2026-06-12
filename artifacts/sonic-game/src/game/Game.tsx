import { useEffect, useRef, useCallback } from "react";

const W = 1280;
const H = 720;
const GRAVITY = 0.6;
const JUMP_FORCE = -15;
const SPEED = 5;
const WIN_RINGS = 15;
const PW = 48;
const PH = 56;

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
  isSonic: boolean;
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

function makeRings(): Ring[] {
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
  return positions.map((p, i) => ({ x: p.x, y: p.y, collected: false, animFrame: i * 3 }));
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

function makePlayer(x: number, isSonic: boolean): Player {
  return {
    x, y: H - 200,
    vx: 0, vy: 0,
    onGround: false,
    rings: 0,
    facing: isSonic ? 1 : -1,
    animFrame: 0, animTimer: 0,
    running: false,
    invincible: 0,
    spinning: false, spinTimer: 0,
    isSonic,
    name: isSonic ? "SONIC" : "TAILS",
  };
}

function rectOverlap(ax: number, ay: number, aw: number, ah: number,
                     bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ─── Sonic drawing ───────────────────────────────────────────────────────────
function drawSonic(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + PW / 2;
  const cy = p.y + PH / 2;

  ctx.save();
  if (p.facing < 0) {
    ctx.translate(cx, cy);
    ctx.scale(-1, 1);
    ctx.translate(-cx, -cy);
  }

  if (p.spinning) {
    // Spin dash ball
    const angle = (t * 0.5) % (Math.PI * 2);
    ctx.save();
    ctx.translate(cx, cy + 6);
    ctx.rotate(angle);
    // Blue ball
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#0050C8";
    ctx.fill();
    // Spin lines
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
      ctx.strokeStyle = "#003090";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    // Shine
    ctx.beginPath();
    ctx.arc(-8, -8, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
    ctx.restore();
    ctx.restore();
    return;
  }

  const bob = p.running ? Math.sin(t * 0.35) * 2 : 0;
  const legSwing = p.running ? Math.sin(t * 0.35) * 15 : 0;
  const fy = cy + bob;

  // ── Quills (drawn behind everything) ──
  // Back quill (longest, points most backward)
  ctx.beginPath();
  ctx.moveTo(cx - 2, fy - 18);
  ctx.lineTo(cx - 28, fy - 8);
  ctx.lineTo(cx - 16, fy - 2);
  ctx.closePath();
  ctx.fillStyle = "#0050C8";
  ctx.fill();
  ctx.strokeStyle = "#003090";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Middle quill
  ctx.beginPath();
  ctx.moveTo(cx + 2, fy - 22);
  ctx.lineTo(cx - 20, fy - 14);
  ctx.lineTo(cx - 10, fy - 6);
  ctx.closePath();
  ctx.fillStyle = "#0050C8";
  ctx.fill();
  ctx.strokeStyle = "#003090";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top quill (short, upward)
  ctx.beginPath();
  ctx.moveTo(cx + 6, fy - 24);
  ctx.lineTo(cx - 8, fy - 20);
  ctx.lineTo(cx - 2, fy - 12);
  ctx.closePath();
  ctx.fillStyle = "#0050C8";
  ctx.fill();
  ctx.strokeStyle = "#003090";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Body ──
  ctx.beginPath();
  ctx.ellipse(cx, fy + 6, 16, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0050C8";
  ctx.fill();

  // ── Cream belly ──
  ctx.beginPath();
  ctx.ellipse(cx + 4, fy + 10, 10, 13, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#FFDD99";
  ctx.fill();

  // ── Head (big, round) ──
  ctx.beginPath();
  ctx.arc(cx + 4, fy - 12, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#0050C8";
  ctx.fill();

  // ── Face cream patch ──
  ctx.beginPath();
  ctx.ellipse(cx + 12, fy - 8, 11, 9, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#FFDD99";
  ctx.fill();

  // ── Nose ──
  ctx.beginPath();
  ctx.ellipse(cx + 22, fy - 10, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();

  // ── Eye ──
  // White sclera
  ctx.beginPath();
  ctx.ellipse(cx + 14, fy - 17, 9, 8, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // Green iris
  ctx.beginPath();
  ctx.ellipse(cx + 16, fy - 17, 6, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#00AA00";
  ctx.fill();

  // Black pupil
  ctx.beginPath();
  ctx.ellipse(cx + 17, fy - 17, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();

  // Eye shine
  ctx.beginPath();
  ctx.arc(cx + 15, fy - 19, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // Eyebrow (angled for determined look)
  ctx.beginPath();
  ctx.moveTo(cx + 8, fy - 26);
  ctx.lineTo(cx + 22, fy - 22);
  ctx.strokeStyle = "#0050C8";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();

  // ── Ear ──
  ctx.beginPath();
  ctx.moveTo(cx + 4, fy - 28);
  ctx.lineTo(cx - 2, fy - 38);
  ctx.lineTo(cx + 12, fy - 32);
  ctx.closePath();
  ctx.fillStyle = "#0050C8";
  ctx.fill();

  // ── White gloves / arms ──
  // Arm
  ctx.beginPath();
  ctx.ellipse(cx - 12, fy + 2, 5, 8, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#0050C8";
  ctx.fill();

  // Glove
  ctx.beginPath();
  ctx.arc(cx - 16, fy + 8, 7, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Legs ──
  const leg1x = cx - 6 + Math.sin((legSwing * Math.PI) / 180) * 6;
  const leg2x = cx + 6 - Math.sin((legSwing * Math.PI) / 180) * 6;
  const legY = fy + 22;

  // Leg 1
  ctx.beginPath();
  ctx.moveTo(leg1x, legY - 10);
  ctx.lineTo(leg1x - 2, legY);
  ctx.strokeStyle = "#0050C8";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.stroke();

  // Leg 2
  ctx.beginPath();
  ctx.moveTo(leg2x, legY - 10);
  ctx.lineTo(leg2x + 2, legY);
  ctx.strokeStyle = "#0050C8";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.stroke();

  // ── Red shoes with white strap ──
  const drawShoe = (sx: number, sy: number) => {
    ctx.beginPath();
    ctx.ellipse(sx + 2, sy + 5, 13, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#CC0000";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // White strap across shoe
    ctx.beginPath();
    ctx.moveTo(sx - 8, sy + 4);
    ctx.lineTo(sx + 12, sy + 4);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gold buckle
    ctx.beginPath();
    ctx.rect(sx + 1, sy + 2, 5, 4);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
  };

  drawShoe(leg1x - 11, legY - 2);
  drawShoe(leg2x - 9, legY - 2);

  ctx.restore();
}

// ─── Tails drawing ────────────────────────────────────────────────────────────
function drawTails(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + PW / 2;
  const cy = p.y + PH / 2;

  ctx.save();
  if (p.facing < 0) {
    ctx.translate(cx, cy);
    ctx.scale(-1, 1);
    ctx.translate(-cx, -cy);
  }

  if (p.spinning) {
    const angle = (t * 0.5) % (Math.PI * 2);
    ctx.save();
    ctx.translate(cx, cy + 6);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#E87C00";
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
      ctx.strokeStyle = "#B85C00";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(-8, -8, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
    ctx.restore();
    ctx.restore();
    return;
  }

  const bob = p.running ? Math.sin(t * 0.35) * 2 : 0;
  const legSwing = p.running ? Math.sin(t * 0.35) * 15 : 0;
  const tailWag = Math.sin(t * 0.15) * 18;
  const fy = cy + bob;

  // ── Two fox tails ──
  // Tail 1
  ctx.beginPath();
  ctx.moveTo(cx - 4, fy + 8);
  ctx.bezierCurveTo(
    cx - 22, fy + 2 + tailWag * 0.5,
    cx - 36, fy - 10 + tailWag,
    cx - 30, fy - 22 + tailWag
  );
  ctx.bezierCurveTo(
    cx - 24, fy - 30 + tailWag,
    cx - 14, fy - 24 + tailWag * 0.8,
    cx - 10, fy + 4
  );
  ctx.closePath();
  ctx.fillStyle = "#E87C00";
  ctx.fill();
  ctx.strokeStyle = "#B85C00";
  ctx.lineWidth = 1;
  ctx.stroke();

  // White tail tip 1
  ctx.beginPath();
  ctx.ellipse(cx - 30, fy - 22 + tailWag, 10, 7, -0.5 + tailWag * 0.02, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // Tail 2 (offset slightly)
  const tailWag2 = Math.sin(t * 0.15 + 0.5) * 15;
  ctx.beginPath();
  ctx.moveTo(cx - 2, fy + 10);
  ctx.bezierCurveTo(
    cx - 18, fy + 6 + tailWag2 * 0.5,
    cx - 28, fy - 6 + tailWag2,
    cx - 24, fy - 18 + tailWag2
  );
  ctx.bezierCurveTo(
    cx - 18, fy - 26 + tailWag2,
    cx - 8, fy - 20 + tailWag2 * 0.8,
    cx - 6, fy + 6
  );
  ctx.closePath();
  ctx.fillStyle = "#F59C20";
  ctx.fill();
  ctx.strokeStyle = "#B85C00";
  ctx.lineWidth = 1;
  ctx.stroke();

  // White tail tip 2
  ctx.beginPath();
  ctx.ellipse(cx - 24, fy - 18 + tailWag2, 9, 6, -0.4 + tailWag2 * 0.02, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // ── Body ──
  ctx.beginPath();
  ctx.ellipse(cx, fy + 6, 15, 17, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#E87C00";
  ctx.fill();

  // ── Cream belly ──
  ctx.beginPath();
  ctx.ellipse(cx + 3, fy + 10, 9, 12, -0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF0CC";
  ctx.fill();

  // ── Head ──
  ctx.beginPath();
  ctx.arc(cx + 3, fy - 13, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#E87C00";
  ctx.fill();

  // ── Face cream patch ──
  ctx.beginPath();
  ctx.ellipse(cx + 10, fy - 8, 11, 9, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF0CC";
  ctx.fill();

  // ── Nose ──
  ctx.beginPath();
  ctx.ellipse(cx + 20, fy - 10, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();

  // ── Eyes (Tails has teal/blue eyes) ──
  ctx.beginPath();
  ctx.ellipse(cx + 13, fy - 17, 9, 8, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + 15, fy - 17, 6, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0099CC";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + 16, fy - 17, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx + 14, fy - 19, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // Eyebrow (friendlier angle)
  ctx.beginPath();
  ctx.moveTo(cx + 6, fy - 25);
  ctx.lineTo(cx + 20, fy - 23);
  ctx.strokeStyle = "#B85C00";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.stroke();

  // ── Ears (round fox ears) ──
  ctx.beginPath();
  ctx.moveTo(cx - 2, fy - 28);
  ctx.lineTo(cx - 8, fy - 42);
  ctx.lineTo(cx + 6, fy - 34);
  ctx.closePath();
  ctx.fillStyle = "#E87C00";
  ctx.fill();

  // Inner ear
  ctx.beginPath();
  ctx.moveTo(cx - 1, fy - 29);
  ctx.lineTo(cx - 5, fy - 39);
  ctx.lineTo(cx + 4, fy - 33);
  ctx.closePath();
  ctx.fillStyle = "#FFB0B0";
  ctx.fill();

  // Right ear
  ctx.beginPath();
  ctx.moveTo(cx + 14, fy - 28);
  ctx.lineTo(cx + 18, fy - 40);
  ctx.lineTo(cx + 24, fy - 30);
  ctx.closePath();
  ctx.fillStyle = "#E87C00";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 15, fy - 29);
  ctx.lineTo(cx + 18, fy - 38);
  ctx.lineTo(cx + 22, fy - 31);
  ctx.closePath();
  ctx.fillStyle = "#FFB0B0";
  ctx.fill();

  // ── White gloves ──
  ctx.beginPath();
  ctx.ellipse(cx - 12, fy + 2, 5, 7, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#E87C00";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 15, fy + 8, 7, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Legs ──
  const leg1x = cx - 6 + Math.sin((legSwing * Math.PI) / 180) * 6;
  const leg2x = cx + 6 - Math.sin((legSwing * Math.PI) / 180) * 6;
  const legY = fy + 22;

  ctx.beginPath();
  ctx.moveTo(leg1x, legY - 10);
  ctx.lineTo(leg1x - 2, legY);
  ctx.strokeStyle = "#E87C00";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(leg2x, legY - 10);
  ctx.lineTo(leg2x + 2, legY);
  ctx.strokeStyle = "#E87C00";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.stroke();

  // ── White shoes (Tails has white shoes) ──
  const drawShoe = (sx: number, sy: number) => {
    ctx.beginPath();
    ctx.ellipse(sx + 2, sy + 5, 13, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx - 8, sy + 4);
    ctx.lineTo(sx + 12, sy + 4);
    ctx.strokeStyle = "#E87C00";
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  drawShoe(leg1x - 11, legY - 2);
  drawShoe(leg2x - 9, legY - 2);

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const blink = p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0;
  if (blink) return;
  if (p.isSonic) drawSonic(ctx, p, t);
  else drawTails(ctx, p, t);
}

function drawRing(ctx: CanvasRenderingContext2D, r: Ring, t: number) {
  if (r.collected) return;
  const wobble = Math.cos((t + r.animFrame) * 0.08) * 6;
  const scaleX = Math.abs(Math.cos((t + r.animFrame) * 0.06));

  ctx.save();
  ctx.translate(r.x + wobble, r.y);
  ctx.scale(scaleX, 1);

  const grad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 12);
  grad.addColorStop(0, "#FFE566");
  grad.addColorStop(0.5, "#FFD700");
  grad.addColorStop(1, "#B8860B");

  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.arc(0, 0, 7, 0, Math.PI * 2, true);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-3, -4, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
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
  ctx.fillStyle = compressed ? "#ff4444" : "#e74c3c";
  ctx.fillRect(0, compressed ? 8 : 2, 30, compressed ? 6 : 12);
  ctx.fillStyle = "#f39c12";
  ctx.fillRect(-2, 12, 34, 4);
  if (!compressed) {
    ctx.fillStyle = "#ff8888";
    ctx.fillRect(4, 4, 22, 3);
  }
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, t: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0d1b5e");
  grad.addColorStop(0.5, "#1a4080");
  grad.addColorStop(1, "#0a2040");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 70; i++) {
    const sx = ((i * 137 + t * (i % 4 < 2 ? 0.08 : 0.04)) % W + W) % W;
    const sy = (i * 97) % (H * 0.75);
    const size = (i % 3) + 1;
    const alpha = 0.35 + (Math.sin(t * 0.04 + i) + 1) * 0.25;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  // Clouds
  for (let i = 0; i < 4; i++) {
    const cx2 = ((i * 300 + 80 + t * 0.15) % (W + 200)) - 100;
    const cy2 = 60 + i * 55;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(cx2, cy2, 50, 0, Math.PI * 2);
    ctx.arc(cx2 + 40, cy2 - 10, 35, 0, Math.PI * 2);
    ctx.arc(cx2 + 70, cy2, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPlatform(ctx: CanvasRenderingContext2D, p: Platform) {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(p.x, p.y, p.w, p.h, 6);
  else ctx.rect(p.x, p.y, p.w, p.h);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(p.x + 4, p.y + 2, p.w - 8, 5, 3);
  else ctx.rect(p.x + 4, p.y + 2, p.w - 8, 5);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);
}

function drawHUD(ctx: CanvasRenderingContext2D, p1: Player, p2: Player, gameState: string, winner: string) {
  const drawPanel = (p: Player, x: number, align: "left" | "right") => {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, 8, 210, 76, 12);
    else ctx.rect(x, 8, 210, 76);
    ctx.fill();

    const nameColor = p.isSonic ? "#4488FF" : "#FF9900";
    ctx.fillStyle = nameColor;
    ctx.font = "bold 15px Arial";
    ctx.textAlign = align;
    ctx.fillText(p.name, align === "left" ? x + 14 : x + 196, 30);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`${p.rings} / ${WIN_RINGS}`, align === "left" ? x + 14 : x + 196, 60);

    const barX = x + 12;
    const barW = 186;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(barX, 66, barW, 10);
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(barX, 66, Math.min(1, p.rings / WIN_RINGS) * barW, 10);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, 66, barW, 10);
    ctx.restore();
  };

  drawPanel(p1, 10, "left");
  drawPanel(p2, W - 220, "right");

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W / 2 - 90, 8, 180, 40, 10);
  else ctx.rect(W / 2 - 90, 8, 180, 40);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`★ First to ${WIN_RINGS} rings wins! ★`, W / 2, 33);

  if (gameState === "over") {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.textAlign = "center";
    const g = ctx.createLinearGradient(W/2 - 200, H/2 - 60, W/2 + 200, H/2 + 60);
    g.addColorStop(0, "#FFD700");
    g.addColorStop(0.5, "#FFFFFF");
    g.addColorStop(1, "#FFD700");
    ctx.font = "bold 68px Arial";
    ctx.fillStyle = g;
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 40;
    ctx.fillText("🏆 " + winner + " WINS! 🏆", W / 2, H / 2 - 10);
    ctx.shadowBlur = 0;
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Press ENTER or SPACE to play again", W / 2, H / 2 + 55);
    ctx.restore();
  }
}

function drawTitle(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();
  ctx.textAlign = "center";

  const g = ctx.createLinearGradient(W/2 - 260, H/2 - 120, W/2 + 260, H/2 - 40);
  g.addColorStop(0, "#4488FF");
  g.addColorStop(0.5, "#FFD700");
  g.addColorStop(1, "#4488FF");
  ctx.font = "bold 88px Arial";
  ctx.fillStyle = g;
  ctx.shadowColor = "#0050FF";
  ctx.shadowBlur = 20 + Math.sin(t * 0.05) * 8;
  ctx.fillText("SONIC DASH", W / 2, H / 2 - 60);

  ctx.shadowBlur = 0;
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#FFD700";
  ctx.fillText("2 PLAYER RING RUSH", W / 2, H / 2 - 10);

  ctx.font = "20px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("🦔  SONIC (P1):  A / D  to run   W  to jump", W / 2, H / 2 + 45);
  ctx.fillText("🦊  TAILS  (P2):  ← / →  to run   ↑  to jump", W / 2, H / 2 + 80);

  const pulse = Math.abs(Math.sin(t * 0.07));
  ctx.font = `bold ${22 + pulse * 5}px Arial`;
  ctx.fillStyle = `rgba(255,215,0,${0.7 + pulse * 0.3})`;
  ctx.fillText("★ Press SPACE or ENTER to START! ★", W / 2, H / 2 + 140);

  ctx.font = "18px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(`Collect ${WIN_RINGS} rings to win!`, W / 2, H / 2 + 178);

  ctx.restore();
}

function drawCollectEffects(ctx: CanvasRenderingContext2D, effects: {x:number;y:number;life:number}[]) {
  effects.forEach(e => {
    ctx.save();
    ctx.globalAlpha = e.life / 30;
    ctx.font = `bold ${16 + (30 - e.life) * 0.5}px Arial`;
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
    p1: makePlayer(120, true),
    p2: makePlayer(W - 170, false),
    platforms: makePlatforms(),
    rings: [] as Ring[],
    spikes: makeSpikes(),
    springs: makeSprings(),
    keys: {} as Record<string, boolean>,
    effects: [] as { x: number; y: number; life: number }[],
  });

  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.p1 = makePlayer(120, true);
    s.p2 = makePlayer(W - 170, false);
    s.rings = makeRings();
    s.spikes = makeSpikes();
    s.springs = makeSprings();
    s.effects = [];
    s.gameState = "playing";
    s.winner = "";
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    s.rings = makeRings();

    const onKeyDown = (e: KeyboardEvent) => {
      s.keys[e.code] = true;
      if (s.gameState !== "playing" && ["Space", "Enter"].includes(e.code)) {
        resetGame();
      }
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => { s.keys[e.code] = false; };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const updatePlayer = (p: Player, leftKey: string, rightKey: string, jumpKey: string) => {
      const s = stateRef.current;
      const left = s.keys[leftKey];
      const right = s.keys[rightKey];
      const jump = s.keys[jumpKey];

      if (left) { p.vx = -SPEED; p.facing = -1; p.running = true; }
      else if (right) { p.vx = SPEED; p.facing = 1; p.running = true; }
      else { p.vx *= 0.75; p.running = Math.abs(p.vx) > 0.5; }

      if (jump && p.onGround) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        p.spinning = true;
        p.spinTimer = 28;
      }

      if (p.spinTimer > 0) { p.spinTimer--; if (p.spinTimer === 0) p.spinning = false; }

      p.vy += GRAVITY;
      if (p.vy > 20) p.vy = 20;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = 0;
      if (p.x > W - PW) p.x = W - PW;

      p.onGround = false;
      for (const plat of s.platforms) {
        if (rectOverlap(p.x, p.y, PW, PH, plat.x, plat.y, plat.w, plat.h)) {
          const fromTop = p.y + PH - plat.y;
          const fromBottom = plat.y + plat.h - p.y;
          const fromLeft = p.x + PW - plat.x;
          const fromRight = plat.x + plat.w - p.x;
          const min = Math.min(fromTop, fromBottom, fromLeft, fromRight);
          if (min === fromTop && p.vy >= 0) {
            p.y = plat.y - PH; p.vy = 0; p.onGround = true; p.spinning = false;
          } else if (min === fromBottom && p.vy < 0) {
            p.y = plat.y + plat.h; p.vy = 0;
          } else if (min === fromLeft) {
            p.x = plat.x - PW; p.vx = 0;
          } else {
            p.x = plat.x + plat.w; p.vx = 0;
          }
        }
      }

      for (const spike of s.spikes) {
        if (p.invincible === 0 && rectOverlap(p.x + 6, p.y + 6, PW - 12, PH - 12, spike.x, spike.y, spike.w, spike.h)) {
          p.rings = Math.max(0, p.rings - 3);
          p.invincible = 90;
          p.vy = -9;
        }
      }

      for (const spring of s.springs) {
        if (rectOverlap(p.x + 4, p.y + 4, PW - 8, PH - 8, spring.x, spring.y + 8, 30, 8)) {
          p.vy = -24; p.onGround = false;
          spring.active = true; spring.timer = 20;
          p.spinning = true; p.spinTimer = 45;
        }
      }

      for (const r of s.rings) {
        if (!r.collected && rectOverlap(p.x + 8, p.y + 8, PW - 16, PH - 16, r.x - 12, r.y - 12, 24, 24)) {
          r.collected = true;
          p.rings++;
          s.effects.push({ x: r.x, y: r.y - 20, life: 30 });
        }
      }

      if (p.y > H + 100) { p.y = 80; p.vy = 0; }
      if (p.invincible > 0) p.invincible--;

      p.animTimer++;
      if (p.running && p.animTimer > 5) { p.animFrame = (p.animFrame + 1) % 4; p.animTimer = 0; }
    };

    const loop = () => {
      const s = stateRef.current;
      s.t++;

      if (s.gameState === "playing") {
        updatePlayer(s.p1, "KeyA", "KeyD", "KeyW");
        updatePlayer(s.p2, "ArrowLeft", "ArrowRight", "ArrowUp");

        for (const sp of s.springs) {
          if (sp.timer > 0) { sp.timer--; if (sp.timer === 0) sp.active = false; }
        }

        s.effects = s.effects
          .map(e => ({ ...e, y: e.y - 1.2, life: e.life - 1 }))
          .filter(e => e.life > 0);

        if (s.p1.rings >= WIN_RINGS) { s.gameState = "over"; s.winner = s.p1.name; }
        if (s.p2.rings >= WIN_RINGS) { s.gameState = "over"; s.winner = s.p2.name; }
      }

      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, s.t);

      if (s.gameState === "title") {
        drawTitle(ctx, s.t);
        raf = requestAnimationFrame(loop);
        return;
      }

      for (const plat of s.platforms) drawPlatform(ctx, plat);
      for (const spike of s.spikes) drawSpike(ctx, spike);
      for (const spring of s.springs) drawSpring(ctx, spring);
      for (const ring of s.rings) drawRing(ctx, ring, s.t);
      drawCollectEffects(ctx, s.effects);
      drawPlayer(ctx, s.p1, s.t);
      drawPlayer(ctx, s.p2, s.t);
      drawHUD(ctx, s.p1, s.p2, s.gameState, s.winner);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh", background: "#060c1a" }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 10, boxShadow: "0 0 80px rgba(0,80,255,0.4)" }}
      />
    </div>
  );
}

import { useEffect, useRef, useCallback } from "react";
import {
  W, H, PW, PH, WIN_RINGS,
  createGameState, tickGameState, startGame,
  type GameState, type Player, type Ring, type Platform,
  type Spike, type Spring, type Effect,
} from "./logic";

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function drawSonic(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + PW / 2;
  const cy = p.y + PH / 2;

  ctx.save();
  if (p.facing < 0) { ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.translate(-cx, -cy); }

  if (p.spinning) {
    const angle = (t * 0.5) % (Math.PI * 2);
    ctx.save();
    ctx.translate(cx, cy + 6);
    ctx.rotate(angle);
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = "#0050C8"; ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
      ctx.strokeStyle = "#003090"; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(-8, -8, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fill();
    ctx.restore(); ctx.restore();
    return;
  }

  const bob = p.running ? Math.sin(t * 0.35) * 2 : 0;
  const legSwing = p.running ? Math.sin(t * 0.35) * 15 : 0;
  const fy = cy + bob;

  // Quills
  const quills = [
    { sx: -2, sy: -18, ex: -28, ey: -8, mx: -16, my: -2 },
    { sx: 2,  sy: -22, ex: -20, ey: -14, mx: -10, my: -6 },
    { sx: 6,  sy: -24, ex: -8,  ey: -20, mx: -2,  my: -12 },
  ];
  quills.forEach(q => {
    ctx.beginPath();
    ctx.moveTo(cx + q.sx, fy + q.sy); ctx.lineTo(cx + q.ex, fy + q.ey);
    ctx.lineTo(cx + q.mx, fy + q.my); ctx.closePath();
    ctx.fillStyle = "#0050C8"; ctx.fill();
    ctx.strokeStyle = "#003090"; ctx.lineWidth = 1; ctx.stroke();
  });

  // Body
  ctx.beginPath(); ctx.ellipse(cx, fy + 6, 16, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0050C8"; ctx.fill();

  // Belly
  ctx.beginPath(); ctx.ellipse(cx + 4, fy + 10, 10, 13, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#FFDD99"; ctx.fill();

  // Head
  ctx.beginPath(); ctx.arc(cx + 4, fy - 12, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#0050C8"; ctx.fill();

  // Face cream
  ctx.beginPath(); ctx.ellipse(cx + 12, fy - 8, 11, 9, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#FFDD99"; ctx.fill();

  // Nose
  ctx.beginPath(); ctx.ellipse(cx + 22, fy - 10, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();

  // Eye white
  ctx.beginPath(); ctx.ellipse(cx + 14, fy - 17, 9, 8, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  // Green iris
  ctx.beginPath(); ctx.ellipse(cx + 16, fy - 17, 6, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#00AA00"; ctx.fill();
  // Pupil
  ctx.beginPath(); ctx.ellipse(cx + 17, fy - 17, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  // Shine
  ctx.beginPath(); ctx.arc(cx + 15, fy - 19, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();

  // Eyebrow
  ctx.beginPath(); ctx.moveTo(cx + 8, fy - 26); ctx.lineTo(cx + 22, fy - 22);
  ctx.strokeStyle = "#0050C8"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();

  // Ear
  ctx.beginPath(); ctx.moveTo(cx + 4, fy - 28); ctx.lineTo(cx - 2, fy - 38);
  ctx.lineTo(cx + 12, fy - 32); ctx.closePath();
  ctx.fillStyle = "#0050C8"; ctx.fill();

  // Arm + glove
  ctx.beginPath(); ctx.ellipse(cx - 12, fy + 2, 5, 8, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#0050C8"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 16, fy + 8, 7, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1; ctx.stroke();

  // Legs + shoes
  const leg1x = cx - 6 + Math.sin((legSwing * Math.PI) / 180) * 6;
  const leg2x = cx + 6 - Math.sin((legSwing * Math.PI) / 180) * 6;
  const legY = fy + 22;

  [leg1x, leg2x].forEach((lx, i) => {
    ctx.beginPath(); ctx.moveTo(lx, legY - 10); ctx.lineTo(lx + (i === 0 ? -2 : 2), legY);
    ctx.strokeStyle = "#0050C8"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.stroke();

    const sx = lx - (i === 0 ? 11 : 9);
    ctx.beginPath(); ctx.ellipse(sx + 2, legY + 3, 13, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#CC0000"; ctx.fill();
    ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - 8, legY + 2); ctx.lineTo(sx + 12, legY + 2);
    ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.rect(sx + 1, legY, 5, 4);
    ctx.fillStyle = "#FFD700"; ctx.fill();
  });

  ctx.restore();
}

function drawTails(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + PW / 2;
  const cy = p.y + PH / 2;

  ctx.save();
  if (p.facing < 0) { ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.translate(-cx, -cy); }

  if (p.spinning) {
    const angle = (t * 0.5) % (Math.PI * 2);
    ctx.save(); ctx.translate(cx, cy + 6); ctx.rotate(angle);
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = "#E87C00"; ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
      ctx.strokeStyle = "#B85C00"; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(-8, -8, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fill();
    ctx.restore(); ctx.restore();
    return;
  }

  const bob = p.running ? Math.sin(t * 0.35) * 2 : 0;
  const legSwing = p.running ? Math.sin(t * 0.35) * 15 : 0;
  const tw1 = Math.sin(t * 0.15) * 18;
  const tw2 = Math.sin(t * 0.15 + 0.5) * 15;
  const fy = cy + bob;

  // Two fox tails
  [[tw1, "#E87C00", 0], [tw2, "#F59C20", 2]].forEach(([wag, color, offset], idx) => {
    const w = wag as number;
    const ox = offset as number;
    ctx.beginPath();
    ctx.moveTo(cx - 4 + ox, fy + 8 + ox);
    ctx.bezierCurveTo(cx - 22 + ox, fy + 2 + w * 0.5, cx - 36 + ox, fy - 10 + w, cx - 30 + ox, fy - 22 + w);
    ctx.bezierCurveTo(cx - 24 + ox, fy - 30 + w, cx - 14 + ox, fy - 24 + w * 0.8, cx - 10 + ox, fy + 4 + ox);
    ctx.closePath(); ctx.fillStyle = color as string; ctx.fill();
    ctx.strokeStyle = "#B85C00"; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx - 30 + ox, fy - 22 + w, idx === 0 ? 10 : 9, idx === 0 ? 7 : 6, -0.5 + w * 0.02, 0, Math.PI * 2);
    ctx.fillStyle = "white"; ctx.fill();
  });

  // Body
  ctx.beginPath(); ctx.ellipse(cx, fy + 6, 15, 17, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#E87C00"; ctx.fill();

  // Belly
  ctx.beginPath(); ctx.ellipse(cx + 3, fy + 10, 9, 12, -0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF0CC"; ctx.fill();

  // Head
  ctx.beginPath(); ctx.arc(cx + 3, fy - 13, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#E87C00"; ctx.fill();

  // Face cream
  ctx.beginPath(); ctx.ellipse(cx + 10, fy - 8, 11, 9, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF0CC"; ctx.fill();

  // Nose
  ctx.beginPath(); ctx.ellipse(cx + 20, fy - 10, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();

  // Eye
  ctx.beginPath(); ctx.ellipse(cx + 13, fy - 17, 9, 8, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 15, fy - 17, 6, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0099CC"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 16, fy - 17, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 14, fy - 19, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();

  // Eyebrow
  ctx.beginPath(); ctx.moveTo(cx + 6, fy - 25); ctx.lineTo(cx + 20, fy - 23);
  ctx.strokeStyle = "#B85C00"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();

  // Ears
  [[cx - 2, cx - 8, cx + 6], [cx + 14, cx + 18, cx + 24]].forEach(([bx, tx, rx]) => {
    ctx.beginPath(); ctx.moveTo(bx, fy - 28); ctx.lineTo(tx, fy - 42); ctx.lineTo(rx, fy - 32);
    ctx.closePath(); ctx.fillStyle = "#E87C00"; ctx.fill();
    ctx.beginPath(); ctx.moveTo(bx + 1, fy - 29); ctx.lineTo(tx + 2, fy - 39); ctx.lineTo(rx - 2, fy - 33);
    ctx.closePath(); ctx.fillStyle = "#FFB0B0"; ctx.fill();
  });

  // Arm + glove
  ctx.beginPath(); ctx.ellipse(cx - 12, fy + 2, 5, 7, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#E87C00"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 15, fy + 8, 7, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1; ctx.stroke();

  // Legs + white shoes
  const leg1x = cx - 6 + Math.sin((legSwing * Math.PI) / 180) * 6;
  const leg2x = cx + 6 - Math.sin((legSwing * Math.PI) / 180) * 6;
  const legY = fy + 22;

  [leg1x, leg2x].forEach((lx, i) => {
    ctx.beginPath(); ctx.moveTo(lx, legY - 10); ctx.lineTo(lx + (i === 0 ? -2 : 2), legY);
    ctx.strokeStyle = "#E87C00"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.stroke();

    const sx = lx - (i === 0 ? 11 : 9);
    ctx.beginPath(); ctx.ellipse(sx + 2, legY + 3, 13, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "white"; ctx.fill();
    ctx.strokeStyle = "#ccc"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - 8, legY + 2); ctx.lineTo(sx + 12, legY + 2);
    ctx.strokeStyle = "#E87C00"; ctx.lineWidth = 3; ctx.stroke();
  });

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
  ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath(); ctx.arc(-3, -4, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fill();
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
    ctx.fillStyle = "#aaa"; ctx.fill();
    ctx.strokeStyle = "#888"; ctx.lineWidth = 1; ctx.stroke();
  }
}

function drawSpring(ctx: CanvasRenderingContext2D, s: Spring) {
  ctx.save(); ctx.translate(s.x, s.y);
  ctx.fillStyle = s.active ? "#ff4444" : "#e74c3c";
  ctx.fillRect(0, s.active ? 8 : 2, 30, s.active ? 6 : 12);
  ctx.fillStyle = "#f39c12"; ctx.fillRect(-2, 12, 34, 4);
  if (!s.active) { ctx.fillStyle = "#ff8888"; ctx.fillRect(4, 4, 22, 3); }
  ctx.restore();
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

function drawBackground(ctx: CanvasRenderingContext2D, t: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0d1b5e");
  grad.addColorStop(0.5, "#1a4080");
  grad.addColorStop(1, "#0a2040");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 70; i++) {
    const sx = ((i * 137 + t * (i % 4 < 2 ? 0.08 : 0.04)) % W + W) % W;
    const sy = (i * 97) % (H * 0.75);
    const alpha = 0.35 + (Math.sin(t * 0.04 + i) + 1) * 0.25;
    ctx.beginPath(); ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill();
  }

  for (let i = 0; i < 4; i++) {
    const cx2 = ((i * 300 + 80 + t * 0.15) % (W + 200)) - 100;
    const cy2 = 60 + i * 55;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(cx2, cy2, 50, 0, Math.PI * 2);
    ctx.arc(cx2 + 40, cy2 - 10, 35, 0, Math.PI * 2);
    ctx.arc(cx2 + 70, cy2, 40, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { p1, p2, gameState, winner } = state;

  const drawPanel = (p: Player, x: number, align: "left" | "right") => {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, 8, 210, 76, 12);
    else ctx.rect(x, 8, 210, 76);
    ctx.fill();
    ctx.fillStyle = p.isSonic ? "#4488FF" : "#FF9900";
    ctx.font = "bold 15px Arial"; ctx.textAlign = align;
    ctx.fillText(p.name, align === "left" ? x + 14 : x + 196, 30);
    ctx.fillStyle = "#FFD700"; ctx.font = "bold 24px Arial";
    ctx.fillText(`${p.rings} / ${WIN_RINGS}`, align === "left" ? x + 14 : x + 196, 60);
    const barX = x + 12;
    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(barX, 66, 186, 10);
    ctx.fillStyle = "#FFD700"; ctx.fillRect(barX, 66, Math.min(1, p.rings / WIN_RINGS) * 186, 10);
    ctx.restore();
  };

  drawPanel(p1, 10, "left");
  drawPanel(p2, W - 220, "right");

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W / 2 - 90, 8, 180, 40, 10);
  else ctx.rect(W / 2 - 90, 8, 180, 40);
  ctx.fill();
  ctx.fillStyle = "white"; ctx.font = "bold 14px Arial"; ctx.textAlign = "center";
  ctx.fillText(`★ First to ${WIN_RINGS} rings wins! ★`, W / 2, 33);

  if (gameState === "over") {
    ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.textAlign = "center";
    const g = ctx.createLinearGradient(W/2 - 200, H/2 - 60, W/2 + 200, H/2 + 60);
    g.addColorStop(0, "#FFD700"); g.addColorStop(0.5, "#FFFFFF"); g.addColorStop(1, "#FFD700");
    ctx.font = "bold 68px Arial"; ctx.fillStyle = g;
    ctx.shadowColor = "#FFD700"; ctx.shadowBlur = 40;
    ctx.fillText("🏆 " + winner + " WINS! 🏆", W / 2, H / 2 - 10);
    ctx.shadowBlur = 0; ctx.font = "bold 26px Arial"; ctx.fillStyle = "white";
    ctx.fillText("Press ENTER or SPACE to play again", W / 2, H / 2 + 55);
    ctx.restore();
  }
}

function drawTitle(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save(); ctx.textAlign = "center";
  const g = ctx.createLinearGradient(W/2 - 260, H/2 - 120, W/2 + 260, H/2 - 40);
  g.addColorStop(0, "#4488FF"); g.addColorStop(0.5, "#FFD700"); g.addColorStop(1, "#4488FF");
  ctx.font = "bold 88px Arial"; ctx.fillStyle = g;
  ctx.shadowColor = "#0050FF"; ctx.shadowBlur = 20 + Math.sin(t * 0.05) * 8;
  ctx.fillText("SONIC DASH", W / 2, H / 2 - 60);
  ctx.shadowBlur = 0; ctx.font = "bold 30px Arial"; ctx.fillStyle = "#FFD700";
  ctx.fillText("2 PLAYER RING RUSH", W / 2, H / 2 - 10);
  ctx.font = "20px Arial"; ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("🦔  SONIC (P1):  A / D  to run   W  to jump", W / 2, H / 2 + 45);
  ctx.fillText("🦊  TAILS  (P2):  ← / →  to run   ↑  to jump", W / 2, H / 2 + 80);
  const pulse = Math.abs(Math.sin(t * 0.07));
  ctx.font = `bold ${22 + pulse * 5}px Arial`; ctx.fillStyle = `rgba(255,215,0,${0.7 + pulse * 0.3})`;
  ctx.fillText("★ Press SPACE or ENTER to START! ★", W / 2, H / 2 + 140);
  ctx.font = "18px Arial"; ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(`Collect ${WIN_RINGS} rings to win!`, W / 2, H / 2 + 178);
  ctx.restore();
}

function drawEffects(ctx: CanvasRenderingContext2D, effects: Effect[]) {
  effects.forEach(e => {
    ctx.save(); ctx.globalAlpha = e.life / 30;
    ctx.font = `bold ${16 + (30 - e.life) * 0.5}px Arial`;
    ctx.fillStyle = "#FFD700"; ctx.textAlign = "center";
    ctx.fillText("+1", e.x, e.y); ctx.restore();
  });
}

// ─── Game component ───────────────────────────────────────────────────────────
export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<GameState>(createGameState());
  const keysRef   = useRef<Record<string, boolean>>({});

  const resetGame = useCallback(() => {
    stateRef.current = startGame(stateRef.current);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (stateRef.current.gameState !== "playing" && ["Space", "Enter"].includes(e.code)) {
        resetGame();
      }
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
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

    const loop = () => {
      const k = keysRef.current;
      stateRef.current = tickGameState(stateRef.current, {
        p1: { left: !!k["KeyA"], right: !!k["KeyD"], jump: !!k["KeyW"] },
        p2: { left: !!k["ArrowLeft"], right: !!k["ArrowRight"], jump: !!k["ArrowUp"] },
      });

      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, s.t);

      if (s.gameState === "title") {
        drawTitle(ctx, s.t);
      } else {
        for (const plat of s.platforms) drawPlatform(ctx, plat);
        for (const spike of s.spikes) drawSpike(ctx, spike);
        for (const spring of s.springs) drawSpring(ctx, spring);
        for (const ring of s.rings) drawRing(ctx, ring, s.t);
        drawEffects(ctx, s.effects);
        drawPlayer(ctx, s.p1, s.t);
        drawPlayer(ctx, s.p2, s.t);
        drawHUD(ctx, s);
      }

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
        data-testid="game-canvas"
        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 10, boxShadow: "0 0 80px rgba(0,80,255,0.4)" }}
      />
    </div>
  );
}

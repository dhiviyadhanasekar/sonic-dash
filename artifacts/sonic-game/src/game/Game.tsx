import { useEffect, useRef, useCallback, useState } from "react";
import {
  W, H, PW, PH, WIN_RINGS,
  createGameState, tickGameState, startGameWithCharacters,
  getCharacterName, needsDifferentiation,
  type GameState, type Player, type Ring, type Platform,
  type Spike, type Spring, type Effect, type CharacterType,
} from "./logic";
import CharacterSelect from "./CharacterSelect";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function spinBall(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, t: number,
  color: string, stripe: string,
) {
  const angle = (t * 0.5) % (Math.PI * 2);
  ctx.save();
  ctx.translate(cx, cy + 6);
  ctx.rotate(angle);
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 9, Math.sin(a) * 9);
    ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
    ctx.strokeStyle = stripe; ctx.lineWidth = 2.5; ctx.stroke();
  }
  ctx.restore();
}

// ─── Sonic ───────────────────────────────────────────────────────────────────
function drawSonic(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + PW / 2;
  const cy = p.y + PH / 2;
  ctx.save();
  if (p.facing < 0) { ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.translate(-cx, -cy); }

  if (p.spinning) { spinBall(ctx, cx, cy, t, "#0050C8", "#FFCC00"); ctx.restore(); return; }

  const bob = p.running ? Math.sin(t * 0.35) * 2 : 0;
  const ls = p.running ? Math.sin(t * 0.35) * 15 : 0;
  const fy = cy + bob;

  // Quills — 3 sharp sweeps pointing backward
  const quills = [
    [cx - 1, fy - 15, cx - 36, fy - 4, cx - 22, fy - 11],
    [cx + 2, fy - 22, cx - 28, fy - 16, cx - 12, fy - 18],
    [cx + 5, fy - 28, cx - 14, fy - 26, cx - 2, fy - 24],
  ];
  quills.forEach(([sx, sy, ex, ey, mx, my]) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(mx, my);
    ctx.closePath(); ctx.fillStyle = "#0050C8"; ctx.fill();
    ctx.strokeStyle = "#003490"; ctx.lineWidth = 0.8; ctx.stroke();
  });

  // Body (small, compact)
  ctx.beginPath(); ctx.ellipse(cx - 1, fy + 8, 12, 14, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#0050C8"; ctx.fill();
  // Belly
  ctx.beginPath(); ctx.ellipse(cx + 3, fy + 12, 7.5, 10, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#FFCC99"; ctx.fill();

  // Head — large round
  ctx.beginPath(); ctx.arc(cx + 5, fy - 14, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#0050C8"; ctx.fill();
  // Muzzle — prominent peach area
  ctx.beginPath(); ctx.ellipse(cx + 18, fy - 8, 12, 10, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#FFCC99"; ctx.fill();
  // Nose
  ctx.beginPath(); ctx.ellipse(cx + 29, fy - 10, 3.5, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();

  // Eye — large, D-shaped (Sonic's iconic look)
  ctx.beginPath(); ctx.ellipse(cx + 15, fy - 18, 12, 10, 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  // Green iris
  ctx.beginPath(); ctx.ellipse(cx + 18, fy - 18, 8, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#00BB00"; ctx.fill();
  // Pupil
  ctx.beginPath(); ctx.ellipse(cx + 19, fy - 18, 4.5, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  // Shine
  ctx.beginPath(); ctx.arc(cx + 15, fy - 21, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();

  // Eyebrow (angled)
  ctx.beginPath(); ctx.moveTo(cx + 5, fy - 29); ctx.lineTo(cx + 25, fy - 25);
  ctx.strokeStyle = "#003490"; ctx.lineWidth = 3.5; ctx.lineCap = "round"; ctx.stroke();

  // Ear
  ctx.beginPath(); ctx.moveTo(cx - 2, fy - 31); ctx.lineTo(cx - 9, fy - 45);
  ctx.lineTo(cx + 9, fy - 38); ctx.closePath();
  ctx.fillStyle = "#0050C8"; ctx.fill();

  // Arm + white glove
  ctx.beginPath(); ctx.ellipse(cx - 15, fy + 4, 5, 9, 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#0050C8"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 19, fy + 11, 8, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1; ctx.stroke();

  // Legs + shoes
  const l1x = cx - 7 + Math.sin((ls * Math.PI) / 180) * 7;
  const l2x = cx + 7 - Math.sin((ls * Math.PI) / 180) * 7;
  const ly = fy + 22;
  [l1x, l2x].forEach((lx, i) => {
    ctx.beginPath(); ctx.moveTo(lx, ly - 12); ctx.lineTo(lx + (i === 0 ? -3 : 3), ly + 2);
    ctx.strokeStyle = "#0050C8"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.stroke();
    // Shoe
    const sx = lx - (i === 0 ? 14 : 10);
    ctx.beginPath(); ctx.ellipse(sx + 4, ly + 7, 15, 8, -0.08, 0, Math.PI * 2);
    ctx.fillStyle = "#DD0000"; ctx.fill();
    ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - 9, ly + 6); ctx.lineTo(sx + 17, ly + 6);
    ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.rect(sx + 2, ly + 3, 6, 5);
    ctx.fillStyle = "#FFD700"; ctx.fill();
  });

  ctx.restore();
}

// ─── Shadow ───────────────────────────────────────────────────────────────────
function drawShadow(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + PW / 2;
  const cy = p.y + PH / 2;
  ctx.save();
  if (p.facing < 0) { ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.translate(-cx, -cy); }

  if (p.spinning) { spinBall(ctx, cx, cy, t, "#1C1C2E", "#CC0000"); ctx.restore(); return; }

  const bob = p.running ? Math.sin(t * 0.35) * 2 : 0;
  const ls = p.running ? Math.sin(t * 0.35) * 15 : 0;
  const fy = cy + bob;

  // Quills — same shape as Sonic but dark with red tips
  const quills = [
    [cx - 1, fy - 15, cx - 36, fy - 4, cx - 22, fy - 11],
    [cx + 2, fy - 22, cx - 28, fy - 16, cx - 12, fy - 18],
    [cx + 5, fy - 28, cx - 14, fy - 26, cx - 2, fy - 24],
  ];
  quills.forEach(([sx, sy, ex, ey, mx, my], qi) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(mx, my);
    ctx.closePath();
    // Gradient tip effect
    const grad = ctx.createLinearGradient(sx, sy, ex, ey);
    grad.addColorStop(0, qi === 0 ? "#CC0000" : "#1C1C2E");
    grad.addColorStop(1, "#1C1C2E");
    ctx.fillStyle = grad; ctx.fill();
  });

  // Red chest stripe (diagonal)
  ctx.beginPath();
  ctx.moveTo(cx - 4, fy - 2); ctx.lineTo(cx + 4, fy - 14);
  ctx.lineTo(cx + 9, fy - 12); ctx.lineTo(cx + 3, fy);
  ctx.closePath(); ctx.fillStyle = "#CC0000"; ctx.fill();

  // Body
  ctx.beginPath(); ctx.ellipse(cx - 1, fy + 8, 12, 14, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#1C1C2E"; ctx.fill();
  // White chest fur
  ctx.beginPath(); ctx.ellipse(cx + 3, fy + 12, 7.5, 10, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#F5F5F5"; ctx.fill();

  // Head
  ctx.beginPath(); ctx.arc(cx + 5, fy - 14, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#1C1C2E"; ctx.fill();
  // White muzzle
  ctx.beginPath(); ctx.ellipse(cx + 18, fy - 8, 12, 10, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#F0EDE8"; ctx.fill();
  // Nose
  ctx.beginPath(); ctx.ellipse(cx + 29, fy - 10, 3.5, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();

  // Eye — RED (Shadow's signature)
  ctx.beginPath(); ctx.ellipse(cx + 15, fy - 18, 12, 10, 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 18, fy - 18, 8, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#CC0000"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 19, fy - 18, 4.5, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 15, fy - 21, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fill();

  // Heavy eyebrow (angry)
  ctx.beginPath(); ctx.moveTo(cx + 3, fy - 30); ctx.lineTo(cx + 27, fy - 25);
  ctx.strokeStyle = "#CC0000"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();

  // Ear
  ctx.beginPath(); ctx.moveTo(cx - 2, fy - 31); ctx.lineTo(cx - 9, fy - 45);
  ctx.lineTo(cx + 9, fy - 38); ctx.closePath();
  ctx.fillStyle = "#1C1C2E"; ctx.fill();

  // Red wrist cuff + glove
  ctx.beginPath(); ctx.ellipse(cx - 15, fy + 4, 5, 9, 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#CC0000"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 19, fy + 11, 8, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();

  // Hover skates (elongated, pointed, red/black)
  const l1x = cx - 7 + Math.sin((ls * Math.PI) / 180) * 7;
  const l2x = cx + 7 - Math.sin((ls * Math.PI) / 180) * 7;
  const ly = fy + 22;
  [l1x, l2x].forEach((lx, i) => {
    ctx.beginPath(); ctx.moveTo(lx, ly - 12); ctx.lineTo(lx + (i === 0 ? -3 : 3), ly + 2);
    ctx.strokeStyle = "#1C1C2E"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.stroke();
    // Hover skate body (longer, sleeker)
    const sx = lx - (i === 0 ? 16 : 8);
    ctx.beginPath(); ctx.ellipse(sx + 4, ly + 7, 18, 6, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = "#1C1C2E"; ctx.fill();
    // Red stripe
    ctx.beginPath(); ctx.moveTo(sx - 10, ly + 7); ctx.lineTo(sx + 18, ly + 7);
    ctx.strokeStyle = "#CC0000"; ctx.lineWidth = 3; ctx.stroke();
    // Flame/boost from heel (hover effect)
    if (p.running) {
      const flame = Math.sin(t * 0.4 + i * 1.5) * 3;
      ctx.beginPath();
      ctx.moveTo(sx - 8, ly + 4); ctx.quadraticCurveTo(sx - 16 + flame, ly + 7, sx - 10, ly + 10);
      ctx.strokeStyle = `rgba(255,120,0,0.7)`; ctx.lineWidth = 4; ctx.stroke();
    }
  });

  ctx.restore();
}

// ─── Tails ────────────────────────────────────────────────────────────────────
function drawTails(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + PW / 2;
  const cy = p.y + PH / 2;
  ctx.save();
  if (p.facing < 0) { ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.translate(-cx, -cy); }

  if (p.spinning) { spinBall(ctx, cx, cy, t, "#E87C00", "#FFF0CC"); ctx.restore(); return; }

  const bob = p.running ? Math.sin(t * 0.35) * 2 : 0;
  const ls = p.running ? Math.sin(t * 0.35) * 15 : 0;
  const tw1 = Math.sin(t * 0.15) * 20;
  const tw2 = Math.sin(t * 0.15 + 0.7) * 16;
  const fy = cy + bob;

  // Two animated fox tails (behind body)
  [[tw1, "#E87C00", 0], [tw2, "#F59C20", 3]].forEach(([wag, color, offset], idx) => {
    const w = wag as number;
    const ox = offset as number;
    ctx.beginPath();
    ctx.moveTo(cx - 4 + ox, fy + 6 + ox);
    ctx.bezierCurveTo(cx - 24 + ox, fy + 2 + w * 0.4, cx - 38 + ox, fy - 8 + w, cx - 32 + ox, fy - 20 + w);
    ctx.bezierCurveTo(cx - 26 + ox, fy - 28 + w, cx - 14 + ox, fy - 22 + w * 0.7, cx - 10 + ox, fy + 4 + ox);
    ctx.closePath();
    ctx.fillStyle = color as string; ctx.fill();
    ctx.strokeStyle = "#B85C00"; ctx.lineWidth = 0.8; ctx.stroke();
    // White tail tip
    ctx.beginPath();
    ctx.ellipse(cx - 32 + ox, fy - 20 + w, idx === 0 ? 10 : 9, idx === 0 ? 7 : 6, -0.5 + w * 0.02, 0, Math.PI * 2);
    ctx.fillStyle = "white"; ctx.fill();
  });

  // Body
  ctx.beginPath(); ctx.ellipse(cx, fy + 8, 13, 15, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#E87C00"; ctx.fill();
  // Belly/chest
  ctx.beginPath(); ctx.ellipse(cx + 3, fy + 12, 8, 11, -0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF0CC"; ctx.fill();

  // Head — rounder, cuter than Sonic
  ctx.beginPath(); ctx.arc(cx + 3, fy - 14, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#E87C00"; ctx.fill();
  // Muzzle
  ctx.beginPath(); ctx.ellipse(cx + 13, fy - 8, 11, 9, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF0CC"; ctx.fill();
  // Nose
  ctx.beginPath(); ctx.ellipse(cx + 23, fy - 10, 3.2, 2.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();

  // Eye — blue (Tails has blue eyes)
  ctx.beginPath(); ctx.ellipse(cx + 12, fy - 17, 10, 9, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 14, fy - 17, 6.5, 7.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0099CC"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 15, fy - 17, 3.5, 4.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 12, fy - 19, 2, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();

  // Gentle eyebrow
  ctx.beginPath(); ctx.moveTo(cx + 4, fy - 26); ctx.lineTo(cx + 22, fy - 24);
  ctx.strokeStyle = "#B85C00"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();

  // Ears (two, with pink inner)
  [[cx - 2, cx - 9, cx + 7], [cx + 14, cx + 18, cx + 24]].forEach(([bx, tx, rx]) => {
    ctx.beginPath(); ctx.moveTo(bx, fy - 28); ctx.lineTo(tx, fy - 42); ctx.lineTo(rx, fy - 32);
    ctx.closePath(); ctx.fillStyle = "#E87C00"; ctx.fill();
    ctx.beginPath(); ctx.moveTo(bx + 1, fy - 29); ctx.lineTo(tx + 2, fy - 39); ctx.lineTo(rx - 2, fy - 33);
    ctx.closePath(); ctx.fillStyle = "#FFB0B0"; ctx.fill();
  });

  // Arm + glove
  ctx.beginPath(); ctx.ellipse(cx - 13, fy + 4, 5, 8, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#E87C00"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 17, fy + 10, 7.5, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1; ctx.stroke();

  // Legs + white shoes
  const l1x = cx - 6 + Math.sin((ls * Math.PI) / 180) * 6;
  const l2x = cx + 6 - Math.sin((ls * Math.PI) / 180) * 6;
  const ly = fy + 22;
  [l1x, l2x].forEach((lx, i) => {
    ctx.beginPath(); ctx.moveTo(lx, ly - 10); ctx.lineTo(lx + (i === 0 ? -2 : 2), ly + 2);
    ctx.strokeStyle = "#E87C00"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.stroke();
    const sx = lx - (i === 0 ? 12 : 9);
    ctx.beginPath(); ctx.ellipse(sx + 3, ly + 6, 13, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "white"; ctx.fill();
    ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - 7, ly + 5); ctx.lineTo(sx + 13, ly + 5);
    ctx.strokeStyle = "#E87C00"; ctx.lineWidth = 3; ctx.stroke();
  });

  ctx.restore();
}

// ─── Super Sonic ──────────────────────────────────────────────────────────────
function drawSuperSonic(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + PW / 2;
  const cy = p.y + PH / 2;
  ctx.save();
  if (p.facing < 0) { ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.translate(-cx, -cy); }

  // Golden aura / glow
  const auraAlpha = 0.3 + Math.sin(t * 0.12) * 0.15;
  ctx.beginPath(); ctx.arc(cx + 4, cy, 30, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 220, 0, ${auraAlpha})`; ctx.fill();

  if (p.spinning) { spinBall(ctx, cx, cy, t, "#FFD700", "#FFF176"); ctx.restore(); return; }

  const bob = p.running ? Math.sin(t * 0.35) * 2 : 0;
  const ls = p.running ? Math.sin(t * 0.35) * 15 : 0;
  const fy = cy + bob;

  // Upward-pointing quills (Super Sonic's key feature — hair standing on end)
  const superQuills = [
    // Far back, pointing upward-backward
    [cx - 5, fy - 18, cx - 20, fy - 46, cx - 8, fy - 40],
    [cx + 1, fy - 22, cx - 8, fy - 50, cx + 2, fy - 44],
    [cx + 6, fy - 24, cx + 6, fy - 52, cx + 10, fy - 44],
    [cx + 11, fy - 22, cx + 18, fy - 48, cx + 16, fy - 42],
    [cx + 14, fy - 16, cx + 28, fy - 40, cx + 22, fy - 32],
  ];
  superQuills.forEach(([sx, sy, ex, ey, mx, my]) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(mx, my);
    ctx.closePath();
    const g = ctx.createLinearGradient(sx, sy, ex, ey);
    g.addColorStop(0, "#FFD700"); g.addColorStop(1, "#FFF176");
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "#F9A825"; ctx.lineWidth = 0.8; ctx.stroke();
  });

  // Body
  ctx.beginPath(); ctx.ellipse(cx - 1, fy + 8, 12, 14, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700"; ctx.fill();
  // Belly (slightly lighter)
  ctx.beginPath(); ctx.ellipse(cx + 3, fy + 12, 7.5, 10, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF176"; ctx.fill();

  // Head — golden, large
  ctx.beginPath(); ctx.arc(cx + 5, fy - 14, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700"; ctx.fill();
  // Muzzle
  ctx.beginPath(); ctx.ellipse(cx + 18, fy - 8, 12, 10, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF176"; ctx.fill();
  // Nose
  ctx.beginPath(); ctx.ellipse(cx + 29, fy - 10, 3.5, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();

  // Eye — RED (transformation)
  ctx.beginPath(); ctx.ellipse(cx + 15, fy - 18, 12, 10, 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 18, fy - 18, 8, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#FF1100"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 19, fy - 18, 4.5, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 15, fy - 21, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();

  // Eyebrow (more aggressive)
  ctx.beginPath(); ctx.moveTo(cx + 3, fy - 30); ctx.lineTo(cx + 27, fy - 24);
  ctx.strokeStyle = "#F9A825"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();

  // Ear
  ctx.beginPath(); ctx.moveTo(cx - 2, fy - 31); ctx.lineTo(cx - 9, fy - 45);
  ctx.lineTo(cx + 9, fy - 38); ctx.closePath();
  ctx.fillStyle = "#FFD700"; ctx.fill();

  // Arm + glove
  ctx.beginPath(); ctx.ellipse(cx - 15, fy + 4, 5, 9, 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 19, fy + 11, 8, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();

  // Legs + shoes (red, same style as Sonic)
  const l1x = cx - 7 + Math.sin((ls * Math.PI) / 180) * 7;
  const l2x = cx + 7 - Math.sin((ls * Math.PI) / 180) * 7;
  const ly = fy + 22;
  [l1x, l2x].forEach((lx, i) => {
    ctx.beginPath(); ctx.moveTo(lx, ly - 12); ctx.lineTo(lx + (i === 0 ? -3 : 3), ly + 2);
    ctx.strokeStyle = "#FFD700"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.stroke();
    const sx = lx - (i === 0 ? 14 : 10);
    ctx.beginPath(); ctx.ellipse(sx + 4, ly + 7, 15, 8, -0.08, 0, Math.PI * 2);
    ctx.fillStyle = "#DD0000"; ctx.fill();
    ctx.strokeStyle = "#FFD700"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - 9, ly + 6); ctx.lineTo(sx + 17, ly + 6);
    ctx.strokeStyle = "#FFD700"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.rect(sx + 2, ly + 3, 6, 5);
    ctx.fillStyle = "#FFF176"; ctx.fill();
  });

  // Sparkle particles around Super Sonic
  for (let i = 0; i < 6; i++) {
    const angle = (t * 0.06 + (i * Math.PI * 2) / 6) % (Math.PI * 2);
    const r = 28 + Math.sin(t * 0.1 + i) * 6;
    const px = cx + 4 + Math.cos(angle) * r;
    const py = fy + Math.sin(angle) * r * 0.6;
    const size = 1.5 + Math.abs(Math.sin(t * 0.08 + i)) * 2;
    ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 240, 0, ${0.5 + Math.sin(t * 0.1 + i) * 0.4})`;
    ctx.fill();
  }

  ctx.restore();
}

// ─── Knuckles ─────────────────────────────────────────────────────────────────
function drawKnuckles(ctx: CanvasRenderingContext2D, p: Player, t: number) {
  const cx = p.x + PW / 2;
  const cy = p.y + PH / 2;
  ctx.save();
  if (p.facing < 0) { ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.translate(-cx, -cy); }

  if (p.spinning) { spinBall(ctx, cx, cy, t, "#CC0000", "#FFAAAA"); ctx.restore(); return; }

  const bob = p.running ? Math.sin(t * 0.35) * 2 : 0;
  const ls = p.running ? Math.sin(t * 0.35) * 15 : 0;
  const fy = cy + bob;

  // Dreadlocks (4 thick quills hanging DOWN — Knuckles' most distinctive feature)
  // Left side (2 dreadlocks)
  [[cx - 8, fy - 28, cx - 22, fy - 8], [cx - 14, fy - 24, cx - 30, fy - 10]].forEach(([sx, sy, ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx - 4, sy + 8, ex - 4, ey - 8, ex, ey);
    ctx.bezierCurveTo(ex + 6, ey, sx + 2, sy + 4, sx, sy);
    ctx.closePath(); ctx.fillStyle = "#990000"; ctx.fill();
    ctx.strokeStyle = "#660000"; ctx.lineWidth = 0.8; ctx.stroke();
  });
  // Right side
  [[cx + 16, fy - 28, cx + 24, fy - 8], [cx + 10, fy - 24, cx + 16, fy - 4]].forEach(([sx, sy, ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + 4, sy + 8, ex + 4, ey - 8, ex, ey);
    ctx.bezierCurveTo(ex - 6, ey, sx - 2, sy + 4, sx, sy);
    ctx.closePath(); ctx.fillStyle = "#990000"; ctx.fill();
    ctx.strokeStyle = "#660000"; ctx.lineWidth = 0.8; ctx.stroke();
  });

  // Body — stockier than Sonic
  ctx.beginPath(); ctx.ellipse(cx, fy + 7, 15, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#CC0000"; ctx.fill();
  // White crescent / chevron on chest
  ctx.beginPath();
  ctx.moveTo(cx - 8, fy + 2); ctx.quadraticCurveTo(cx, fy - 4, cx + 8, fy + 2);
  ctx.quadraticCurveTo(cx, fy + 8, cx - 8, fy + 2);
  ctx.fillStyle = "white"; ctx.fill();

  // Head — round like Sonic but red
  ctx.beginPath(); ctx.arc(cx + 3, fy - 14, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#CC0000"; ctx.fill();
  // Muzzle
  ctx.beginPath(); ctx.ellipse(cx + 14, fy - 8, 11, 9, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#FFCC99"; ctx.fill();
  // Nose
  ctx.beginPath(); ctx.ellipse(cx + 24, fy - 10, 3.2, 2.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#111"; ctx.fill();

  // Eye — purple
  ctx.beginPath(); ctx.ellipse(cx + 12, fy - 17, 10, 9, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 14, fy - 17, 6.5, 7.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#6A0DAD"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 15, fy - 17, 3.5, 4.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 12, fy - 19, 2, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();

  // Eyebrow (stern)
  ctx.beginPath(); ctx.moveTo(cx + 4, fy - 27); ctx.lineTo(cx + 22, fy - 24);
  ctx.strokeStyle = "#880000"; ctx.lineWidth = 3.5; ctx.lineCap = "round"; ctx.stroke();

  // Spike glove (LEFT fist — Knuckles' most iconic feature)
  ctx.beginPath(); ctx.arc(cx - 19, fy + 8, 9, 0, Math.PI * 2);
  ctx.fillStyle = "white"; ctx.fill();
  ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1; ctx.stroke();
  // Arm
  ctx.beginPath(); ctx.ellipse(cx - 14, fy + 2, 5, 9, 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#CC0000"; ctx.fill();
  // 2 spikes on knuckle glove
  [[cx - 24, fy + 4, cx - 27, fy - 2], [cx - 19, fy + 2, cx - 20, fy - 5]].forEach(([bx, by, tx, ty]) => {
    ctx.beginPath();
    ctx.moveTo(bx - 3, by + 3); ctx.lineTo(tx, ty); ctx.lineTo(bx + 3, by + 3);
    ctx.closePath(); ctx.fillStyle = "#888"; ctx.fill();
    ctx.strokeStyle = "#555"; ctx.lineWidth = 0.8; ctx.stroke();
  });

  // Legs + red shoes (pointed, with yellow strap)
  const l1x = cx - 7 + Math.sin((ls * Math.PI) / 180) * 7;
  const l2x = cx + 7 - Math.sin((ls * Math.PI) / 180) * 7;
  const ly = fy + 22;
  [l1x, l2x].forEach((lx, i) => {
    ctx.beginPath(); ctx.moveTo(lx, ly - 12); ctx.lineTo(lx + (i === 0 ? -3 : 3), ly + 2);
    ctx.strokeStyle = "#CC0000"; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.stroke();
    // Shoe
    const sx = lx - (i === 0 ? 14 : 10);
    ctx.beginPath(); ctx.ellipse(sx + 4, ly + 6, 15, 8, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#CC0000"; ctx.fill();
    ctx.strokeStyle = "#880000"; ctx.lineWidth = 1.5; ctx.stroke();
    // Gold strap
    ctx.beginPath(); ctx.rect(sx - 2, ly + 3, 16, 4);
    ctx.fillStyle = "#FFD700"; ctx.fill();
    // Pointed toe
    ctx.beginPath();
    ctx.moveTo(sx + 17, ly + 6); ctx.lineTo(sx + 24, ly + 3); ctx.lineTo(sx + 17, ly + 10);
    ctx.fillStyle = "#CC0000"; ctx.fill();
  });

  ctx.restore();
}

// ─── Player dispatcher ────────────────────────────────────────────────────────
function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: Player,
  t: number,
  playerLabel: "P1" | "P2",
  isDuplicate: boolean,
) {
  const blink = p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0;
  if (blink) return;

  switch (p.characterType) {
    case "sonic":      drawSonic(ctx, p, t); break;
    case "shadow":     drawShadow(ctx, p, t); break;
    case "tails":      drawTails(ctx, p, t); break;
    case "superSonic": drawSuperSonic(ctx, p, t); break;
    case "knuckles":   drawKnuckles(ctx, p, t); break;
  }

  // When same character is chosen, show coloured name tag above the player
  if (isDuplicate) {
    const isP1 = playerLabel === "P1";
    const tagColor = isP1 ? "#4488FF" : "#FF6600";
    const tagBg = isP1 ? "rgba(0,30,100,0.75)" : "rgba(100,30,0,0.75)";
    const hx = p.x + PW / 2;
    const hy = p.y - 10;

    ctx.save();
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    const tw = ctx.measureText(playerLabel).width + 10;
    // Background pill
    ctx.fillStyle = tagBg;
    if (ctx.roundRect) ctx.roundRect(hx - tw / 2, hy - 14, tw, 16, 4);
    else ctx.rect(hx - tw / 2, hy - 14, tw, 16);
    ctx.fill();
    // Label text
    ctx.fillStyle = tagColor;
    ctx.fillText(playerLabel, hx, hy);
    // Small downward arrow
    ctx.beginPath();
    ctx.moveTo(hx - 4, hy + 3); ctx.lineTo(hx + 4, hy + 3); ctx.lineTo(hx, hy + 8);
    ctx.closePath(); ctx.fillStyle = tagColor; ctx.fill();
    ctx.restore();
  }
}

// ─── Rings / Spikes / Springs / Platforms / Background ───────────────────────
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
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { p1, p2, gameState, winner } = state;

  const P1_COLOR = "#4488FF";
  const P2_COLOR = "#FF9900";

  const drawPanel = (p: Player, x: number, align: "left" | "right", accent: string) => {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, 8, 220, 78, 12);
    else ctx.rect(x, 8, 220, 78);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.font = "bold 15px Arial"; ctx.textAlign = align;
    ctx.fillText(p.name, align === "left" ? x + 14 : x + 206, 30);
    ctx.fillStyle = "#FFD700"; ctx.font = "bold 24px Arial";
    ctx.fillText(`${p.rings} / ${WIN_RINGS}`, align === "left" ? x + 14 : x + 206, 60);
    const barX = x + 12;
    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(barX, 67, 196, 10);
    const barFill = Math.min(1, p.rings / WIN_RINGS) * 196;
    const barGrad = ctx.createLinearGradient(barX, 0, barX + 196, 0);
    barGrad.addColorStop(0, accent);
    barGrad.addColorStop(1, "#FFD700");
    ctx.fillStyle = barGrad; ctx.fillRect(barX, 67, barFill, 10);
    ctx.restore();
  };

  drawPanel(p1, 10, "left", P1_COLOR);
  drawPanel(p2, W - 230, "right", P2_COLOR);

  // Centre "first to N wins" badge
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W / 2 - 95, 8, 190, 40, 10);
  else ctx.rect(W / 2 - 95, 8, 190, 40);
  ctx.fill();
  ctx.fillStyle = "white"; ctx.font = "bold 14px Arial"; ctx.textAlign = "center";
  ctx.fillText(`★ First to ${WIN_RINGS} rings wins! ★`, W / 2, 33);

  if (gameState === "over") {
    ctx.fillStyle = "rgba(0,0,0,0.72)"; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.textAlign = "center";
    const g = ctx.createLinearGradient(W / 2 - 200, H / 2 - 60, W / 2 + 200, H / 2 + 60);
    g.addColorStop(0, "#FFD700"); g.addColorStop(0.5, "#FFFFFF"); g.addColorStop(1, "#FFD700");
    ctx.font = "bold 68px Arial"; ctx.fillStyle = g;
    ctx.shadowColor = "#FFD700"; ctx.shadowBlur = 40;
    ctx.fillText("\uD83C\uDFC6 " + winner + " WINS! \uD83C\uDFC6", W / 2, H / 2 - 10);
    ctx.shadowBlur = 0; ctx.font = "bold 26px Arial"; ctx.fillStyle = "white";
    ctx.fillText("Press SPACE or ENTER to choose again", W / 2, H / 2 + 55);
    ctx.restore();
  }
}

function drawTitle(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save(); ctx.textAlign = "center";
  const g = ctx.createLinearGradient(W / 2 - 260, H / 2 - 120, W / 2 + 260, H / 2 - 40);
  g.addColorStop(0, "#4488FF"); g.addColorStop(0.5, "#FFD700"); g.addColorStop(1, "#4488FF");
  ctx.font = "bold 88px Arial"; ctx.fillStyle = g;
  ctx.shadowColor = "#0050FF"; ctx.shadowBlur = 20 + Math.sin(t * 0.05) * 8;
  ctx.fillText("SONIC DASH", W / 2, H / 2 - 60);
  ctx.shadowBlur = 0; ctx.font = "bold 30px Arial"; ctx.fillStyle = "#FFD700";
  ctx.fillText("2 PLAYER RING RUSH", W / 2, H / 2 - 10);
  ctx.font = "20px Arial"; ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("P1: A / D  to run   W  to jump", W / 2, H / 2 + 45);
  ctx.fillText("P2: \u2190 / \u2192  to run   \u2191  to jump", W / 2, H / 2 + 80);
  const pulse = Math.abs(Math.sin(t * 0.07));
  ctx.font = `bold ${22 + pulse * 5}px Arial`;
  ctx.fillStyle = `rgba(255,215,0,${0.7 + pulse * 0.3})`;
  ctx.fillText("\u2605 Press SPACE or ENTER to choose characters! \u2605", W / 2, H / 2 + 140);
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

// ─── Game keys (only prevent default for game-relevant keys) ──────────────────
const GAME_KEYS = new Set([
  "KeyA", "KeyD", "KeyW", "KeyS",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "Space", "Enter",
]);

// ─── Game component ───────────────────────────────────────────────────────────
export default function Game() {
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const stateRef         = useRef<GameState>(createGameState());
  const keysRef          = useRef<Record<string, boolean>>({});
  const showCharSelectRef = useRef(false);
  const prevPhaseRef     = useRef<GameState["gameState"]>("title");

  const [showCharSelect, setShowCharSelect] = useState(false);
  const [announcement, setAnnouncement]     = useState("Sonic Two-Player Ring Rush. Use keyboard to play.");

  const handleCharacterStart = useCallback(
    (p1Char: CharacterType, p2Char: CharacterType) => {
      stateRef.current = startGameWithCharacters(stateRef.current, p1Char, p2Char);
      showCharSelectRef.current = false;
      setShowCharSelect(false);
      const same = p1Char === p2Char;
      const msg = same
        ? `Game started! Both players chose ${getCharacterName(p1Char)}.`
        : `Game started! ${getCharacterName(p1Char)} versus ${getCharacterName(p2Char)}.`;
      setAnnouncement(`${msg} Collect ${WIN_RINGS} rings to win!`);
    },
    [],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Let CharacterSelect capture-phase handler deal with keys during selection
      if (showCharSelectRef.current) return;

      keysRef.current[e.code] = true;

      // Only block browser defaults for game-relevant keys (OWASP: don't blanket-preventDefault)
      if (GAME_KEYS.has(e.code)) e.preventDefault();

      const gs = stateRef.current.gameState;
      if ((gs === "title" || gs === "over") && (e.code === "Space" || e.code === "Enter")) {
        stateRef.current = { ...stateRef.current, gameState: "selecting" };
        showCharSelectRef.current = true;
        setShowCharSelect(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []); // refs keep this stable — no deps needed

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    const loop = () => {
      const k = keysRef.current;
      stateRef.current = tickGameState(stateRef.current, {
        p1: { left: !!k["KeyA"], right: !!k["KeyD"], jump: !!k["KeyW"] },
        p2: { left: !!k["ArrowLeft"], right: !!k["ArrowRight"], jump: !!k["ArrowUp"] },
      });

      const s = stateRef.current;

      // Detect transitions for accessibility announcements
      if (s.gameState !== prevPhaseRef.current) {
        prevPhaseRef.current = s.gameState;
        if (s.gameState === "over") {
          setAnnouncement(`${s.winner} wins! Press Space or Enter to choose characters again.`);
        }
      }

      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, s.t);

      if (s.gameState === "title") {
        drawTitle(ctx, s.t);
      } else if (s.gameState !== "selecting") {
        const isDupe = needsDifferentiation(s.p1, s.p2);
        for (const plat of s.platforms) drawPlatform(ctx, plat);
        for (const spike of s.spikes) drawSpike(ctx, spike);
        for (const spring of s.springs) drawSpring(ctx, spring);
        for (const ring of s.rings) drawRing(ctx, ring, s.t);
        drawEffects(ctx, s.effects);
        drawPlayer(ctx, s.p1, s.t, "P1", isDupe);
        drawPlayer(ctx, s.p2, s.t, "P2", isDupe);
        drawHUD(ctx, s);
      }
      // "selecting" state: animated background shows through the CharacterSelect HTML overlay

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "100vw", height: "100vh", background: "#060c1a",
      }}
    >
      {/* Screen-reader live region — announces game events */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1, height: 1,
          padding: 0, margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {announcement}
      </div>

      <div style={{ position: "relative", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          data-testid="game-canvas"
          role="application"
          aria-label={`Sonic Two-Player Ring Rush game. Collect ${WIN_RINGS} rings to win. Player 1 uses A and D to run, W to jump. Player 2 uses arrow keys.`}
          tabIndex={0}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: 10,
            boxShadow: "0 0 80px rgba(0,80,255,0.4)",
            display: "block",
          }}
        />
        {showCharSelect && (
          <CharacterSelect onStart={handleCharacterStart} />
        )}
      </div>
    </main>
  );
}

import type { GameConfig, GameState, Layout, Point } from './types';

export function computeLayout(canvasWidth: number, canvasHeight: number, config: GameConfig): Layout {
  const padding = Math.round(Math.min(canvasWidth, canvasHeight) * 0.06);
  const availW = canvasWidth - padding * 2;
  const availH = canvasHeight - padding * 2;
  const cellSize = Math.floor(Math.min(availW / config.columns, availH / config.rows));
  const boardWidthPx = cellSize * config.columns;
  const boardHeightPx = cellSize * config.rows;
  const originX = Math.floor((canvasWidth - boardWidthPx) / 2);
  const originY = Math.floor((canvasHeight - boardHeightPx) / 2);
  return { cellSize, boardWidthPx, boardHeightPx, originX, originY };
}

export function render(ctx: CanvasRenderingContext2D, state: GameState, config: GameConfig, layout: Layout): void {
  const { cellSize, boardWidthPx, boardHeightPx, originX, originY } = layout;
  const canvas = ctx.canvas;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#0b1224');
  bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Board with 3D-like frame
  const frameRadius = Math.max(16, Math.floor(cellSize * 0.6));
  const framePath = roundedRectPath(originX - 16, originY - 16, boardWidthPx + 32, boardHeightPx + 32, frameRadius);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#0a1020';
  ctx.fill(framePath);
  ctx.restore();

  // Inner board surface
  const boardPath = roundedRectPath(originX, originY, boardWidthPx, boardHeightPx, Math.max(12, Math.floor(cellSize * 0.3)));
  const surface = ctx.createLinearGradient(originX, originY, originX, originY + boardHeightPx);
  surface.addColorStop(0, '#0f1a33');
  surface.addColorStop(1, '#0b1530');
  ctx.fillStyle = surface;
  ctx.fill(boardPath);

  // Board inner highlight
  ctx.save();
  ctx.clip(boardPath);
  const glare = ctx.createLinearGradient(originX, originY, originX + boardWidthPx, originY + boardHeightPx);
  glare.addColorStop(0, 'rgba(255,255,255,0.05)');
  glare.addColorStop(1, 'rgba(255,255,255,0.00)');
  ctx.fillStyle = glare;
  ctx.fillRect(originX, originY, boardWidthPx, boardHeightPx);

  // Subtle grid
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let c = 1; c < config.columns; c++) {
    const x = originX + c * cellSize + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, originY);
    ctx.lineTo(x, originY + boardHeightPx);
    ctx.stroke();
  }
  for (let r = 1; r < config.rows; r++) {
    const y = originY + r * cellSize + 0.5;
    ctx.beginPath();
    ctx.moveTo(originX, y);
    ctx.lineTo(originX + boardWidthPx, y);
    ctx.stroke();
  }

  // Apple
  drawApple(ctx, state.apple, cellSize, originX, originY);

  // Snake
  drawSnake(ctx, state.snake, cellSize, originX, originY);

  ctx.restore();

  // HUD
  drawHUD(ctx, state, originX, originY, boardWidthPx);
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): Path2D {
  const p = new Path2D();
  const rr = Math.min(r, Math.floor(Math.min(w, h) / 2));
  p.moveTo(x + rr, y);
  p.lineTo(x + w - rr, y);
  p.quadraticCurveTo(x + w, y, x + w, y + rr);
  p.lineTo(x + w, y + h - rr);
  p.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  p.lineTo(x + rr, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - rr);
  p.lineTo(x, y + rr);
  p.quadraticCurveTo(x, y, x + rr, y);
  p.closePath();
  return p;
}

function drawApple(ctx: CanvasRenderingContext2D, apple: Point, cell: number, ox: number, oy: number) {
  const cx = ox + apple.x * cell + cell / 2;
  const cy = oy + apple.y * cell + cell / 2;
  const r = cell * 0.35;
  const grad = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.2, cx, cy, r);
  grad.addColorStop(0, '#34d399');
  grad.addColorStop(1, '#16a34a');
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3, cy - r * 0.35, r * 0.35, r * 0.22, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // leaf
  ctx.fillStyle = '#065f46';
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.1, cy - r * 0.8, r * 0.22, r * 0.12, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSnake(ctx: CanvasRenderingContext2D, snake: Point[], cell: number, ox: number, oy: number) {
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i];
    const px = ox + seg.x * cell;
    const py = oy + seg.y * cell;
    const radius = Math.floor(cell * 0.35);
    const rectPath = roundedRectPath(px + cell * 0.1, py + cell * 0.1, cell * 0.8, cell * 0.8, radius);
    const grad = ctx.createLinearGradient(px, py, px + cell, py + cell);
    const base = i === snake.length - 1 ? '#22c55e' : '#16a34a';
    grad.addColorStop(0, lighten(base, 0.25));
    grad.addColorStop(1, darken(base, 0.25));
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = grad;
    ctx.fill(rectPath);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.stroke(rectPath);

    // highlight
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(px + cell * 0.45, py + cell * 0.35, cell * 0.28, cell * 0.14, -0.6, 0, Math.PI * 2);
    ctx.fill();

    // eyes on head
    if (i === snake.length - 1) {
      const eyeR = Math.max(2, Math.floor(cell * 0.08));
      const ex1 = px + cell * 0.4;
      const ex2 = px + cell * 0.6;
      const ey = py + cell * 0.45;
      ctx.fillStyle = '#0b1224';
      ctx.beginPath(); ctx.arc(ex1, ey, eyeR, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex2, ey, eyeR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(ex1 - eyeR * 0.3, ey - eyeR * 0.3, eyeR * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex2 - eyeR * 0.3, ey - eyeR * 0.3, eyeR * 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.min(255, Math.floor(c + (255 - c) * amount));
  return rgbToHex(mix(r), mix(g), mix(b));
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.max(0, Math.floor(c * (1 - amount)));
  return rgbToHex(mix(r), mix(g), mix(b));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}


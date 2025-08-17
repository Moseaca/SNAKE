// Simple Snake Game - Mobile First
export interface GameState {
  snake: Array<{x: number, y: number}>;
  food: {x: number, y: number};
  direction: 'up' | 'down' | 'left' | 'right';
  nextDirection: 'up' | 'down' | 'left' | 'right';
  gameOver: boolean;
  score: number;
  running: boolean;
}

const GRID_SIZE = 20;
const CELL_SIZE = 24; // base cell size for pixel look
const INITIAL_SPEED = 180;

// Retro palette
const COL = {
  bg: '#244d3f',
  frame: '#1c3f33',
  screenOuter: '#254a3c',
  screenInner: '#4f7a52',
  gridLine: 'rgba(0,0,0,0.18)',
  snake: '#1b3a30',
  snakeHead: '#163127',
  apple: '#c84434',
  score: '#efe993'
};

export function createGame(canvas: HTMLCanvasElement): GameState {
  const state: GameState = {
    snake: [
      {x: 10, y: 10},
      {x: 9, y: 10},
      {x: 8, y: 10}
    ],
    food: {x: 15, y: 10},
    direction: 'right',
    nextDirection: 'right',
    gameOver: false,
    score: 0,
    running: false
  };

  // Set canvas size
  canvas.width = GRID_SIZE * CELL_SIZE;
  canvas.height = GRID_SIZE * CELL_SIZE;
  canvas.style.maxWidth = '100%';
  canvas.style.height = 'auto';

  return state;
}

export function moveSnake(state: GameState): void {
  if (state.gameOver || !state.running) return;

  // Update direction
  state.direction = state.nextDirection;

  // Calculate new head position
  const head = {...state.snake[0]};
  
  switch (state.direction) {
    case 'up': head.y--; break;
    case 'down': head.y++; break;
    case 'left': head.x--; break;
    case 'right': head.x++; break;
  }

  // Check wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    state.gameOver = true;
    state.running = false;
    return;
  }

  // Check self collision
  for (const segment of state.snake) {
    if (head.x === segment.x && head.y === segment.y) {
      state.gameOver = true;
      state.running = false;
      return;
    }
  }

  // Add new head
  state.snake.unshift(head);

  // Check food collision
  if (head.x === state.food.x && head.y === state.food.y) {
    state.score++;
    // Generate new food
    do {
      state.food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (state.snake.some(s => s.x === state.food.x && s.y === state.food.y));
  } else {
    // Remove tail if no food eaten
    state.snake.pop();
  }
}

export function changeDirection(state: GameState, newDir: 'up' | 'down' | 'left' | 'right'): void {
  // Prevent reverse direction
  const opposites = {
    'up': 'down',
    'down': 'up',
    'left': 'right',
    'right': 'left'
  };
  
  if (opposites[newDir] !== state.direction) {
    state.nextDirection = newDir;
  }
}

export function draw(canvas: HTMLCanvasElement, state: GameState): void {
  const ctx = canvas.getContext('2d')!;

  // Size and areas
  const W = GRID_SIZE * CELL_SIZE;
  const H = GRID_SIZE * CELL_SIZE;
  const margin = Math.floor(CELL_SIZE * 0.6);
  const headerH = Math.floor(CELL_SIZE * 1.6);
  const screenX = margin;
  const screenY = margin + headerH;
  const screenW = W - margin * 2;
  const screenH = H - margin * 2 - headerH;

  // Background
  ctx.fillStyle = COL.bg;
  ctx.fillRect(0, 0, W, H);

  // Frame
  ctx.fillStyle = COL.frame;
  roundRect(ctx, margin * 0.4, margin * 0.4, W - margin * 0.8, H - margin * 0.8, 14, true);

  // Header
  ctx.fillStyle = COL.screenOuter;
  roundRect(ctx, margin, margin, screenW, headerH, 10, true);
  ctx.fillStyle = COL.score;
  ctx.font = '18px "Press Start 2P", system-ui, monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(String(state.score), margin + 16, margin + headerH / 2);
  ctx.textAlign = 'right';
  ctx.fillText('SCORE', W - margin - 16, margin + headerH / 2);

  // Screen
  ctx.fillStyle = COL.screenOuter;
  roundRect(ctx, screenX, screenY, screenW, screenH, 14, true);
  ctx.fillStyle = COL.screenInner;
  roundRect(ctx, screenX + 10, screenY + 10, screenW - 20, screenH - 20, 10, true);

  // Grid
  const innerX = screenX + 10;
  const innerY = screenY + 10;
  const innerW = screenW - 20;
  const innerH = screenH - 20;
  const cell = Math.min(Math.floor(innerW / GRID_SIZE), Math.floor(innerH / GRID_SIZE));
  const offsetX = innerX + Math.floor((innerW - cell * GRID_SIZE) / 2);
  const offsetY = innerY + Math.floor((innerH - cell * GRID_SIZE) / 2);

  // Subtle cells shading
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#5b875e' : '#577f5a';
      ctx.fillRect(offsetX + x * cell, offsetY + y * cell, cell, cell);
    }
  }

  // Grid lines
  ctx.strokeStyle = COL.gridLine;
  ctx.lineWidth = 2;
  for (let i = 0; i <= GRID_SIZE; i++) {
    const gx = offsetX + i * cell + 0.5;
    const gy = offsetY + i * cell + 0.5;
    ctx.beginPath(); ctx.moveTo(gx, offsetY); ctx.lineTo(gx, offsetY + cell * GRID_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(offsetX, gy); ctx.lineTo(offsetX + cell * GRID_SIZE, gy); ctx.stroke();
  }

  // Apple (red square)
  ctx.fillStyle = COL.apple;
  ctx.fillRect(
    offsetX + state.food.x * cell + Math.floor(cell * 0.12),
    offsetY + state.food.y * cell + Math.floor(cell * 0.12),
    Math.floor(cell * 0.76),
    Math.floor(cell * 0.76)
  );

  // Snake
  state.snake.forEach((seg, idx) => {
    ctx.fillStyle = idx === 0 ? COL.snakeHead : COL.snake;
    ctx.fillRect(
      offsetX + seg.x * cell + 1,
      offsetY + seg.y * cell + 1,
      cell - 2,
      cell - 2
    );
    // eye on head
    if (idx === 0) {
      ctx.fillStyle = '#0c1e17';
      const eye = Math.max(2, Math.floor(cell * 0.12));
      ctx.fillRect(offsetX + seg.x * cell + cell - eye - 4, offsetY + seg.y * cell + cell - eye - 4, eye, eye);
    }
  });

  // Game over overlay
  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, screenX, screenY, screenW, screenH, 14, true);
    ctx.fillStyle = COL.score;
    ctx.font = '16px "Press Start 2P", system-ui, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', W / 2, screenY + screenH / 2 - 12);
    ctx.font = '12px "Press Start 2P", system-ui, monospace';
    ctx.fillText(`SCORE ${state.score}`, W / 2, screenY + screenH / 2 + 16);
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: boolean) {
  const rr = Math.min(r, Math.floor(Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
  if (fill) ctx.fill();
}

export function reset(state: GameState): void {
  state.snake = [
    {x: 10, y: 10},
    {x: 9, y: 10},
    {x: 8, y: 10}
  ];
  state.food = {x: 15, y: 10};
  state.direction = 'right';
  state.nextDirection = 'right';
  state.gameOver = false;
  state.score = 0;
  state.running = false;
}

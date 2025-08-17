import type { Direction, GameConfig, GameState, Point } from './types';

export function createConfig(viewportWidth: number, viewportHeight: number): GameConfig {
  const portrait = viewportHeight >= viewportWidth;
  const columns = portrait ? 20 : 28;
  const rows = portrait ? 28 : 20;
  return {
    columns,
    rows,
    initialSnakeLength: 4,
    baseSpeedMs: 140,
    minSpeedMs: 70,
    speedupEvery: 5
  };
}

export function createInitialState(config: GameConfig, bestScore: number): GameState {
  const startX = Math.floor(config.columns / 3);
  const startY = Math.floor(config.rows / 2);
  const snake: Point[] = [];
  for (let i = 0; i < config.initialSnakeLength; i++) {
    snake.unshift({ x: startX + i, y: startY });
  }
  return {
    snake,
    direction: 'right',
    pendingDirections: [],
    apple: spawnApple(snake, config),
    isRunning: false,
    isGameOver: false,
    score: 0,
    bestScore: bestScore || 0
  };
}

export function resetGame(state: GameState, config: GameConfig): void {
  const startX = Math.floor(config.columns / 3);
  const startY = Math.floor(config.rows / 2);
  state.snake = [];
  for (let i = 0; i < config.initialSnakeLength; i++) {
    state.snake.unshift({ x: startX + i, y: startY });
  }
  state.direction = 'right';
  state.pendingDirections = [];
  state.apple = spawnApple(state.snake, config);
  state.isRunning = false;
  state.isGameOver = false;
  state.score = 0;
}

export function enqueueDirection(state: GameState, dir: Direction): void {
  const lastDir = state.pendingDirections.length > 0 ? state.pendingDirections[state.pendingDirections.length - 1] : state.direction;
  if (isOpposite(lastDir, dir)) return;
  // collapse duplicate enqueues
  const prev = state.pendingDirections[state.pendingDirections.length - 1];
  if (prev && prev === dir) return;
  state.pendingDirections.push(dir);
}

function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
}

export function step(state: GameState, config: GameConfig): void {
  if (state.isGameOver || !state.isRunning) return;
  if (state.pendingDirections.length > 0) {
    const next = state.pendingDirections.shift()!;
    if (!isOpposite(state.direction, next)) state.direction = next;
  }

  const head = state.snake[state.snake.length - 1];
  let newHead: Point = { x: head.x, y: head.y };
  if (state.direction === 'up') newHead.y -= 1;
  else if (state.direction === 'down') newHead.y += 1;
  else if (state.direction === 'left') newHead.x -= 1;
  else if (state.direction === 'right') newHead.x += 1;

  // wall collision
  if (newHead.x < 0 || newHead.x >= config.columns || newHead.y < 0 || newHead.y >= config.rows) {
    state.isGameOver = true;
    state.isRunning = false;
    updateBestScore(state);
    return;
  }

  // self collision
  if (state.snake.some(p => p.x === newHead.x && p.y === newHead.y)) {
    state.isGameOver = true;
    state.isRunning = false;
    updateBestScore(state);
    return;
  }

  state.snake.push(newHead);

  // apple eat
  if (newHead.x === state.apple.x && newHead.y === state.apple.y) {
    state.score += 1;
    state.apple = spawnApple(state.snake, config);
  } else {
    state.snake.shift();
  }
}

function updateBestScore(state: GameState) {
  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    try { localStorage.setItem('snake_best', String(state.bestScore)); } catch {}
  }
}

export function loadBestScore(): number {
  try {
    const stored = localStorage.getItem('snake_best');
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function spawnApple(occupied: Point[], config: GameConfig): Point {
  const taken = new Set(occupied.map(p => `${p.x},${p.y}`));
  let spot: Point = { x: 0, y: 0 };
  let tries = 0;
  do {
    spot.x = Math.floor(Math.random() * config.columns);
    spot.y = Math.floor(Math.random() * config.rows);
    tries++;
  } while (taken.has(`${spot.x},${spot.y}`) && tries < 1000);
  return spot;
}

export function speedForScore(config: GameConfig, score: number): number {
  const steps = Math.floor(score / config.speedupEvery);
  const ms = Math.max(config.minSpeedMs, config.baseSpeedMs - steps * 6);
  return ms;
}


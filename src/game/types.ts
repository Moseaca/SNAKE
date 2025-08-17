export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Point {
  x: number;
  y: number;
}

export interface GameConfig {
  columns: number;
  rows: number;
  initialSnakeLength: number;
  baseSpeedMs: number;
  minSpeedMs: number;
  speedupEvery: number; // speed up every N points
}

export interface GameState {
  snake: Point[];
  direction: Direction;
  pendingDirections: Direction[];
  apple: Point;
  isRunning: boolean;
  isGameOver: boolean;
  score: number;
  bestScore: number;
}

export interface Layout {
  cellSize: number;
  boardWidthPx: number;
  boardHeightPx: number;
  originX: number;
  originY: number;
}


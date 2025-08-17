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
const CELL_SIZE = 20;
const INITIAL_SPEED = 200;

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
  
  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines (subtle)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(canvas.width, i * CELL_SIZE);
    ctx.stroke();
  }

  // Draw snake
  state.snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
    ctx.fillRect(
      segment.x * CELL_SIZE + 2,
      segment.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );
  });

  // Draw food
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(
    state.food.x * CELL_SIZE + CELL_SIZE / 2,
    state.food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw game over
  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '16px sans-serif';
    ctx.fillText(`Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 20);
  }
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

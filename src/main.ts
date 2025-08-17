import './index.css';
import { createGame, moveSnake, changeDirection, draw, reset } from './simple-snake';

// Initialize game
const app = document.getElementById('app') as HTMLDivElement;
app.innerHTML = `
  <div class="game-container">
    <h1>Snake</h1>
    <div class="score">Score: <span id="score">0</span></div>
    <canvas id="game-canvas"></canvas>
    <div class="controls">
      <button id="start-btn" class="btn">Start</button>
      <button id="reset-btn" class="btn">Reset</button>
    </div>
    <div class="instructions">
      <p>Desktop: Use arrow keys</p>
      <p>Mobile: Swipe to move</p>
    </div>
  </div>
`;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const scoreEl = document.getElementById('score') as HTMLSpanElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

const state = createGame(canvas);
let gameLoop: number;

// Game loop
function tick() {
  moveSnake(state);
  draw(canvas, state);
  scoreEl.textContent = state.score.toString();
  
  if (state.gameOver) {
    clearInterval(gameLoop);
    startBtn.textContent = 'Start';
  }
}

// Start/Pause game
function toggleGame() {
  if (state.gameOver) {
    reset(state);
    draw(canvas, state);
  }
  
  if (state.running) {
    state.running = false;
    clearInterval(gameLoop);
    startBtn.textContent = 'Start';
  } else {
    state.running = true;
    gameLoop = setInterval(tick, 150);
    startBtn.textContent = 'Pause';
  }
}

// Reset game
function resetGame() {
  clearInterval(gameLoop);
  reset(state);
  draw(canvas, state);
  scoreEl.textContent = '0';
  startBtn.textContent = 'Start';
}

// Controls
startBtn.addEventListener('click', toggleGame);
resetBtn.addEventListener('click', resetGame);

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (!state.running || state.gameOver) return;
  
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      e.preventDefault();
      changeDirection(state, 'up');
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      e.preventDefault();
      changeDirection(state, 'down');
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      e.preventDefault();
      changeDirection(state, 'left');
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      e.preventDefault();
      changeDirection(state, 'right');
      break;
  }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (!state.running || state.gameOver) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  
  // Minimum swipe distance
  const minSwipe = 30;
  
  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal swipe
    if (Math.abs(diffX) > minSwipe) {
      if (diffX > 0) {
        changeDirection(state, 'right');
      } else {
        changeDirection(state, 'left');
      }
    }
  } else {
    // Vertical swipe
    if (Math.abs(diffY) > minSwipe) {
      if (diffY > 0) {
        changeDirection(state, 'down');
      } else {
        changeDirection(state, 'up');
      }
    }
  }
}, { passive: true });

// Initial draw
draw(canvas, state);
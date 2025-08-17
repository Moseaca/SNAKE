import './index.css';
import { createConfig, createInitialState, enqueueDirection, loadBestScore, resetGame, speedForScore, step } from './game/core';
import { computeLayout, render } from './game/render';
import type { Direction, GameConfig, GameState, Layout } from './game/types';

const appRoot = document.getElementById('app') as HTMLDivElement;

appRoot.innerHTML = `
  <div class="container">
    <header class="header">
      <h1>Snake</h1>
      <div style="opacity:.85; font-weight:600; margin-top:4px">
        <span>Score: <span id="score">0</span></span>
        <span style="margin-left:12px">Best: <span id="best">0</span></span>
      </div>
    </header>
    <main class="main">
      <div>
        <canvas id="board" width="360" height="540" aria-label="Snake game board" role="img"></canvas>
        <div class="controls" style="display:flex; gap:8px; justify-content:center; margin-top:12px;">
          <button id="play" type="button">Gioca</button>
          <button id="pause" type="button">Pausa</button>
          <button id="restart" type="button">Restart</button>
        </div>
        <div id="msg" style="text-align:center; margin-top:8px; min-height:20px; color:#94a3b8"></div>
      </div>
    </main>
    <footer class="footer">
      <small>PWA pronta per l'installazione • Offline support</small>
    </footer>
  </div>
`;

const canvas = document.getElementById('board') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const scoreEl = document.getElementById('score')!;
const bestEl = document.getElementById('best')!;
const msgEl = document.getElementById('msg')!;

let config: GameConfig = createConfig(window.innerWidth, window.innerHeight);
let state: GameState = createInitialState(config, loadBestScore());
let layout: Layout = computeLayout(canvas.width, canvas.height, config);
bestEl.textContent = String(state.bestScore);

let running = false;
let rafId = 0;
let lastTick = performance.now();
let tickEveryMs = speedForScore(config, state.score);

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const container = document.querySelector('.main > div') as HTMLElement;
  const header = document.querySelector('.header') as HTMLElement;
  const footer = document.querySelector('.footer') as HTMLElement;
  const containerWidth = Math.min(container?.clientWidth || window.innerWidth, 640);
  const headerH = header?.getBoundingClientRect().height || 0;
  const footerH = footer?.getBoundingClientRect().height || 0;
  const verticalPadding = 48; // space around canvas and controls
  const availH = Math.max(320, Math.min(window.innerHeight - headerH - footerH - verticalPadding, 900));

  // Decide grid based on current viewport orientation
  config = createConfig(window.innerWidth, window.innerHeight);
  const ratio = config.rows / config.columns;

  let cssWidth = containerWidth;
  let cssHeight = Math.floor(cssWidth * ratio);
  if (cssHeight > availH) {
    cssHeight = Math.floor(availH);
    cssWidth = Math.floor(cssHeight / ratio);
  }

  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  layout = computeLayout(canvas.width, canvas.height, config);
  render(ctx, state, config, layout);
}

window.addEventListener('resize', resize);
resize();

function start() {
  if (state.isGameOver) {
    resetGame(state, config);
    scoreEl.textContent = '0';
    msgEl.textContent = '';
  }
  if (running) return;
  state.isRunning = true;
  running = true;
  tickEveryMs = speedForScore(config, state.score);
  lastTick = performance.now();
  loop();
}

function pause() {
  state.isRunning = false;
  running = false;
  cancelAnimationFrame(rafId);
  msgEl.textContent = 'In pausa';
}

function loop() {
  rafId = requestAnimationFrame(loop);
  const now = performance.now();
  if (now - lastTick >= tickEveryMs) {
    step(state, config);
    tickEveryMs = speedForScore(config, state.score);
    lastTick = now;

    scoreEl.textContent = String(state.score);
    bestEl.textContent = String(state.bestScore);

    render(ctx, state, config, layout);

    if (state.isGameOver) {
      cancelAnimationFrame(rafId);
      running = false;
      msgEl.textContent = 'Game Over! Premi Gioca per ripartire.';
    }
  }
}

// Input: keyboard
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  let dir: Direction | null = null;
  if (key === 'arrowup' || key === 'w') dir = 'up';
  if (key === 'arrowdown' || key === 's') dir = 'down';
  if (key === 'arrowleft' || key === 'a') dir = 'left';
  if (key === 'arrowright' || key === 'd') dir = 'right';
  if (dir) enqueueDirection(state, dir);
});

// Input: touch/swipe
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  if (!touchStartX && !touchStartY) return;
  const t = e.touches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  const threshold = 18;
  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    enqueueDirection(state, dx > 0 ? 'right' : 'left');
  } else {
    enqueueDirection(state, dy > 0 ? 'down' : 'up');
  }
  // reset to prevent multiple enqueues from a single swipe
  touchStartX = 0; touchStartY = 0;
}, { passive: true });

canvas.addEventListener('touchend', () => {
  touchStartX = 0; touchStartY = 0;
}, { passive: true });

// Canvas tap to start/pause (mobile friendly)
canvas.addEventListener('click', () => {
  if (!running) { start(); msgEl.textContent = 'Vai!'; } else { pause(); }
});
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (!running) { start(); msgEl.textContent = 'Vai!'; } else { pause(); }
}, { passive: false });

// Buttons
const playBtn = document.getElementById('play') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause') as HTMLButtonElement;
const restartBtn = document.getElementById('restart') as HTMLButtonElement;

function onPress(el: HTMLElement, handler: () => void) {
  el.addEventListener('click', handler);
  el.addEventListener('touchstart', (ev) => { ev.preventDefault(); handler(); }, { passive: false });
}

onPress(playBtn, () => { start(); msgEl.textContent = 'Vai!'; });
onPress(pauseBtn, () => pause());
onPress(restartBtn, () => {
  resetGame(state, config);
  scoreEl.textContent = '0';
  bestEl.textContent = String(state.bestScore);
  msgEl.textContent = '';
  render(ctx, state, config, layout);
  start();
});

// Initial render
render(ctx, state, config, layout);



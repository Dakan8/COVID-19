const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;

let snake, dir, nextDir, food, score, highScore, gameLoop, running;

highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
highScoreEl.textContent = highScore;

function init() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = 0;
  running = true;
  placeFood();
}

function placeFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function update() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    endGame();
    return;
  }

  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      localStorage.setItem('snakeHighScore', highScore);
    }
    placeFood();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid lines (subtle)
  ctx.strokeStyle = '#1e2d4a';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= canvas.width; x += CELL) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += CELL) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Food
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  const fx = food.x * CELL + CELL / 2;
  const fy = food.y * CELL + CELL / 2;
  ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Snake
  snake.forEach((seg, i) => {
    const t = i / snake.length;
    ctx.fillStyle = i === 0 ? '#4ecca3' : `hsl(${160 - t * 40}, 60%, ${50 - t * 10}%)`;
    ctx.beginPath();
    ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
    ctx.fill();

    // Eyes on head
    if (i === 0) {
      ctx.fillStyle = '#1a1a2e';
      const eyeOffset = 4;
      const ex1 = seg.x * CELL + (dir.x === 0 ? eyeOffset : dir.x > 0 ? CELL - 5 : 3);
      const ey1 = seg.y * CELL + (dir.y === 0 ? eyeOffset : dir.y > 0 ? CELL - 5 : 3);
      const ex2 = seg.x * CELL + (dir.x === 0 ? CELL - eyeOffset - 2 : dir.x > 0 ? CELL - 5 : 3);
      const ey2 = seg.y * CELL + (dir.y === 0 ? eyeOffset : dir.y > 0 ? CELL - 5 : 3) + (dir.x !== 0 ? 8 : 0);
      ctx.beginPath(); ctx.arc(ex1, ey1 + (dir.y !== 0 ? 0 : 3), 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex2, ey2 + (dir.y !== 0 ? 0 : 3), 2, 0, Math.PI * 2); ctx.fill();
    }
  });
}

function drawOverlay(message) {
  ctx.fillStyle = 'rgba(22, 33, 62, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#4ecca3';
  ctx.font = 'bold 2rem Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillStyle = '#aaa';
  ctx.font = '1rem Segoe UI, sans-serif';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

function endGame() {
  running = false;
  clearInterval(gameLoop);
  drawOverlay('Game Over');
  startBtn.style.display = 'none';
  restartBtn.style.display = 'inline-block';
}

function startGame() {
  init();
  startBtn.style.display = 'none';
  restartBtn.style.display = 'inline-block';
  clearInterval(gameLoop);
  gameLoop = setInterval(() => {
    update();
    if (running) draw();
  }, 130);
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

document.addEventListener('keydown', e => {
  if (!running) return;
  const keys = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
  };
  const newDir = keys[e.key];
  if (!newDir) return;
  // Prevent reversing
  if (newDir.x === -dir.x && newDir.y === -dir.y) return;
  nextDir = newDir;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
});

// Draw initial state
ctx.fillStyle = '#16213e';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawOverlay('Press Start');

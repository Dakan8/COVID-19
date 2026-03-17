const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const messageEl = document.getElementById('message');
const messageTextEl = document.getElementById('message-text');
const restartBtn = document.getElementById('restart-btn');

const GRID_SIZE = 20;
const CELL_COUNT = canvas.width / GRID_SIZE;
const TICK_INTERVAL = 120; // ms per frame

const COLORS = {
    snakeHead: '#4ecca3',
    snakeBody: '#3ab08a',
    food: '#e94560',
    grid: '#1a2a4a',
};

let snake, direction, nextDirection, food, score, highScore, gameLoop, gameRunning;

highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
highScoreEl.textContent = highScore;

function init() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = 0;
    gameRunning = true;
    messageEl.classList.add('hidden');
    placeFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(tick, TICK_INTERVAL);
}

function placeFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * CELL_COUNT),
            y: Math.floor(Math.random() * CELL_COUNT),
        };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
}

function tick() {
    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y,
    };

    // Wall collision
    if (head.x < 0 || head.x >= CELL_COUNT || head.y < 0 || head.y >= CELL_COUNT) {
        return endGame();
    }

    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        return endGame();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
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

    draw();
}

function draw() {
    // Background
    ctx.fillStyle = COLORS.grid;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#1e2d50';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CELL_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Food
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    const fx = food.x * GRID_SIZE + GRID_SIZE / 2;
    const fy = food.y * GRID_SIZE + GRID_SIZE / 2;
    ctx.arc(fx, fy, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake body
    snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snakeBody;
        const padding = i === 0 ? 1 : 2;
        ctx.beginPath();
        ctx.roundRect(
            seg.x * GRID_SIZE + padding,
            seg.y * GRID_SIZE + padding,
            GRID_SIZE - padding * 2,
            GRID_SIZE - padding * 2,
            i === 0 ? 4 : 3
        );
        ctx.fill();

        // Eyes on head
        if (i === 0) {
            ctx.fillStyle = '#1a1a2e';
            const eyeOffset = 4;
            const eyeSize = 3;
            let e1, e2;
            if (direction.x === 1) {
                e1 = { x: seg.x * GRID_SIZE + 13, y: seg.y * GRID_SIZE + 5 };
                e2 = { x: seg.x * GRID_SIZE + 13, y: seg.y * GRID_SIZE + 12 };
            } else if (direction.x === -1) {
                e1 = { x: seg.x * GRID_SIZE + 4, y: seg.y * GRID_SIZE + 5 };
                e2 = { x: seg.x * GRID_SIZE + 4, y: seg.y * GRID_SIZE + 12 };
            } else if (direction.y === -1) {
                e1 = { x: seg.x * GRID_SIZE + 5, y: seg.y * GRID_SIZE + 4 };
                e2 = { x: seg.x * GRID_SIZE + 12, y: seg.y * GRID_SIZE + 4 };
            } else {
                e1 = { x: seg.x * GRID_SIZE + 5, y: seg.y * GRID_SIZE + 13 };
                e2 = { x: seg.x * GRID_SIZE + 12, y: seg.y * GRID_SIZE + 13 };
            }
            ctx.beginPath(); ctx.arc(e1.x, e1.y, eyeSize / 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(e2.x, e2.y, eyeSize / 2, 0, Math.PI * 2); ctx.fill();
        }
    });
}

function endGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    messageTextEl.textContent = `Game Over! Score: ${score}`;
    messageEl.classList.remove('hidden');
}

document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 }; break;
        case 'ArrowDown':  case 's': case 'S':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 }; break;
        case 'ArrowLeft':  case 'a': case 'A':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': case 'D':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 }; break;
    }
});

restartBtn.addEventListener('click', init);

// Draw initial state before game starts
init();

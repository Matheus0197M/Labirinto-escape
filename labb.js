//Aqui temos desde a criação real do labirinto
//até como funciona a geração das paredes, 
//das posições dos assassinos e da saída.
//Tudo envolve um complexo sistema matemático
//que decide aleatoriamente como tudo vai 
//acontecer, por isso, que as vezes temos 
//partes impossíveis do jogador passar.
//E falando do jogador, aqui também está 
//como ele se movimenta no labirinto,
//que, dividido por quadrados, se move de 
//quadrado em quadrado para conseguir escapar.


const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cols = 20, rows = 20, cellSize = 25;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

class Cell {
    constructor(x, y) { this.x = x; this.y = y; this.walls = [true, true, true, true]; this.visited = false; }
    draw() {
        const x = this.x * cellSize, y = this.y * cellSize;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        if (this.walls[0]) ctx.beginPath(), ctx.moveTo(x, y), ctx.lineTo(x + cellSize, y), ctx.stroke();
        if (this.walls[1]) ctx.beginPath(), ctx.moveTo(x + cellSize, y), ctx.lineTo(x + cellSize, y + cellSize), ctx.stroke();
        if (this.walls[2]) ctx.beginPath(), ctx.moveTo(x + cellSize, y + cellSize), ctx.lineTo(x, y + cellSize), ctx.stroke();
        if (this.walls[3]) ctx.beginPath(), ctx.moveTo(x, y + cellSize), ctx.lineTo(x, y), ctx.stroke();
    }
}

let grid = [], current, stack = [];
for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) grid.push(new Cell(i, j));
function idx(x, y) { return x < 0 || y < 0 || x >= cols || y >= rows ? -1 : x + y * cols; }
function removeWalls(a, b) { const dx = a.x - b.x, dy = a.y - b.y; if (dx === 1) { a.walls[3] = false; b.walls[1] = false; } else if (dx === -1) { a.walls[1] = false; b.walls[3] = false; } if (dy === 1) { a.walls[0] = false; b.walls[2] = false; } else if (dy === -1) { a.walls[2] = false; b.walls[0] = false; } }

current = grid[0];
function generate() {
    current.visited = true;
    const neighbors = [];
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => { const n = grid[idx(current.x + dx, current.y + dy)]; if (n && !n.visited) neighbors.push(n); });
    if (neighbors.length) { const next = neighbors[Math.floor(Math.random() * neighbors.length)]; stack.push(current); removeWalls(current, next); current = next; }
    else if (stack.length) current = stack.pop();
    else { drawMaze(); initGame(); return; }
    generate();
}

function drawMaze() { ctx.clearRect(0, 0, canvas.width, canvas.height); grid.forEach(c => c.draw()); }

let player = { x: 0, y: 0 };
const exit = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
let monsters = [];

function initGame() {
    player = { x: 0, y: 0 };
    monsters = [];
    for (let i = 0; i < 5; i++) {
        let cell;
        do { cell = grid[Math.floor(Math.random() * grid.length)]; } while ((cell.x === player.x && cell.y === player.y) || (cell.x === exit.x && cell.y === exit.y));
        monsters.push({ x: cell.x, y: cell.y });
    }
    drawAll();
    setInterval(moveMonsters, 800);
}

function drawPlayer() {
    const px = player.x * cellSize + 4;
    const py = player.y * cellSize + 4;
    const size = cellSize - 8;
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(px + 5, py);
    ctx.lineTo(px + size - 5, py);
    ctx.quadraticCurveTo(px + size, py, px + size, py + 5);
    ctx.lineTo(px + size, py + size - 5);
    ctx.quadraticCurveTo(px + size, py + size, px + size - 5, py + size);
    ctx.lineTo(px + 5, py + size);
    ctx.quadraticCurveTo(px, py + size, px, py + size - 5);
    ctx.lineTo(px, py + 5);
    ctx.quadraticCurveTo(px, py, px + 5, py);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', px + size / 2, py + size / 2);
}

function drawExit() {
    const ex = exit.x * cellSize + 4;
    const ey = exit.y * cellSize + 4;
    const size = cellSize - 8;
    ctx.fillStyle = 'green';
    ctx.fillRect(ex, ey, size, size);
}

function drawMonsters() {
    const size = cellSize - 8;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    monsters.forEach(m => {
        const mx = m.x * cellSize + 4;
        const my = m.y * cellSize + 4;
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(mx + 5, my);
        ctx.lineTo(mx + size - 5, my);
        ctx.quadraticCurveTo(mx + size, my, mx + size, my + 5);
        ctx.lineTo(mx + size, my + size - 5);
        ctx.quadraticCurveTo(mx + size, my + size, mx + size - 5, my + size);
        ctx.lineTo(mx + 5, my + size);
        ctx.quadraticCurveTo(mx, my + size, mx, my + size - 5);
        ctx.lineTo(mx, my + 5);
        ctx.quadraticCurveTo(mx, my, mx + 5, my);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText('☠', mx + size / 2, my + size / 2);
    });
}

function drawAll() { drawMaze(); drawExit(); drawPlayer(); drawMonsters(); }

function moveMonsters() {
    monsters.forEach(m => {
        const cellIndex = idx(m.x, m.y);
        if (cellIndex === -1) return;
        const cell = grid[cellIndex];
        const dirs = [];
        if (!cell.walls[0]) dirs.push([0, -1]);
        if (!cell.walls[1]) dirs.push([1, 0]);
        if (!cell.walls[2]) dirs.push([0, 1]);
        if (!cell.walls[3]) dirs.push([-1, 0]);
        if (dirs.length) {
            dirs.sort(() => Math.random() - 0.5);
            for (let [dx, dy] of dirs) {
                const nx = m.x + dx, ny = m.y + dy;
                if (idx(nx, ny) !== -1 && (nx !== player.x || ny !== player.y)) {
                    m.x = nx; m.y = ny; break;
                }
            }
        }
    });
    checkCollision(); drawAll();
}

function checkCollision() {
    monsters.forEach(m => {
        if (m.x === player.x && m.y === player.y) setTimeout(() => alert('Você foi pego! Reiniciando...'), 50), initGame();
    });
}

window.addEventListener('keydown', e => {
    const cellIndex = idx(player.x, player.y);
    if (cellIndex === -1) return;
    const cell = grid[cellIndex];
    if (e.key === 'ArrowUp' && !cell.walls[0]) player.y--;
    if (e.key === 'ArrowRight' && !cell.walls[1]) player.x++;
    if (e.key === 'ArrowDown' && !cell.walls[2]) player.y++;
    if (e.key === 'ArrowLeft' && !cell.walls[3]) player.x--;
    checkCollision(); drawAll();
    if (player.x === exit.x && player.y === exit.y) setTimeout(() => alert('Você escapou!'), 50), initGame();
});

generate();

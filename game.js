const PHRASE_BANK = {
    healing: [
        "岁月静好",
        "温柔以待",
        "心向暖阳",
        "花开有期",
        "万物可爱",
        "人间值得",
        "未来可期",
        "向阳而生",
        "星光不负",
        "一路生花",
        "云淡风轻",
        "安之若素",
        "静水流深",
        "春风十里",
        "浮生若梦"
    ],
    ancient: [
        "明月几时有",
        "春风又绿江南岸",
        "悠然见南山",
        "床前明月光",
        "春眠不觉晓",
        "白日依山尽",
        "独在异乡为异客",
        "天涯共此时",
        "大漠孤烟直",
        "长河落日圆",
        "会当凌绝顶",
        "一览众山小",
        "海内存知己",
        "千里共婵娟",
        "落花人独立"
    ],
    gentle: [
        "晚风很温柔",
        "夜色多温柔",
        "愿你被世界温柔以待",
        "生活明朗万物可爱",
        "慢慢即漫漫",
        "爱意随风起",
        "日落尤其温柔",
        "人间皆是浪漫",
        "温柔半两从容一生",
        "万事胜意",
        "喜乐长安",
        "岁岁平安",
        "平安喜乐",
        "顺遂无忧",
        "满眼是星辰"
    ]
};

const CATEGORY_NAMES = {
    healing: "治愈短句",
    ancient: "古风诗句",
    gentle: "温柔文案"
};

const DECORATION_CHARS = "风花雪月山水云树雨雾露霜霞虹天地人和情意心念梦影光影声香色味韵";

class MazeGame {
    constructor() {
        this.currentCategory = 'healing';
        this.currentDifficulty = 'small';
        this.maze = [];
        this.mazeWidth = 0;
        this.mazeHeight = 0;
        this.playerPos = { x: 0, y: 0 };
        this.startPos = { x: 0, y: 0 };
        this.exitPos = { x: 0, y: 0 };
        this.currentPhrase = "";
        this.keywords = [];
        this.collectedChars = [];
        this.timerInterval = null;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isPlaying = false;
        this.currentLevel = 0;
        this.playedPhrases = new Set();

        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.screens = {
            menu: document.getElementById('menu-screen'),
            game: document.getElementById('game-screen'),
            records: document.getElementById('records-screen')
        };
        this.winModal = document.getElementById('win-modal');
        this.mazeGrid = document.getElementById('maze-grid');
        this.timerEl = document.getElementById('timer');
        this.levelInfo = document.getElementById('level-info');
        this.targetDisplay = document.getElementById('target-display');
        this.collectedDisplay = document.getElementById('collected-display');
        this.winPhrase = document.getElementById('win-phrase');
        this.winTime = document.getElementById('win-time');
        this.recordsList = document.getElementById('records-list');
    }

    bindEvents() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
            });
        });

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDifficulty = btn.dataset.difficulty;
            });
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            this.currentLevel = 1;
            this.playedPhrases.clear();
            this.startGame();
        });

        document.getElementById('records-btn').addEventListener('click', () => {
            this.showScreen('records');
            this.renderRecords();
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            this.stopTimer();
            this.isPlaying = false;
            this.showScreen('menu');
        });

        document.getElementById('records-back-btn').addEventListener('click', () => {
            this.showScreen('menu');
        });

        document.getElementById('clear-records-btn').addEventListener('click', () => {
            if (confirm('确定要清空所有通关记录吗？')) {
                localStorage.removeItem('hanzi_maze_records');
                this.renderRecords();
            }
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.winModal.classList.remove('active');
            this.currentLevel++;
            this.startGame();
        });

        document.getElementById('win-back-btn').addEventListener('click', () => {
            this.winModal.classList.remove('active');
            this.showScreen('menu');
        });

        document.querySelectorAll('.dpad-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.movePlayer(btn.dataset.dir);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying) return;
            const keyMap = {
                'ArrowUp': 'up', 'w': 'up', 'W': 'up',
                'ArrowDown': 'down', 's': 'down', 'S': 'down',
                'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
                'ArrowRight': 'right', 'd': 'right', 'D': 'right'
            };
            if (keyMap[e.key]) {
                e.preventDefault();
                this.movePlayer(keyMap[e.key]);
            }
        });

        this.initSwipeControls();
    }

    initSwipeControls() {
        let startX = 0, startY = 0;
        const threshold = 30;

        const mazeContainer = document.getElementById('maze-container');
        
        mazeContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        mazeContainer.addEventListener('touchend', (e) => {
            if (!this.isPlaying) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > threshold) {
                    this.movePlayer(diffX > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(diffY) > threshold) {
                    this.movePlayer(diffY > 0 ? 'down' : 'up');
                }
            }
        }, { passive: true });
    }

    showScreen(screen) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[screen].classList.add('active');
    }

    startGame() {
        this.selectPhrase();
        this.generateMaze();
        this.collectedChars = [];
        this.isPlaying = true;
        this.showScreen('game');
        this.renderMaze();
        this.updateTargetDisplay();
        this.updateCollectedDisplay();
        this.levelInfo.textContent = `第 ${this.currentLevel} 关`;
        this.startTimer();
    }

    selectPhrase() {
        const phrases = PHRASE_BANK[this.currentCategory];
        const available = phrases.filter(p => !this.playedPhrases.has(p));
        let pool = available.length > 0 ? available : phrases;
        
        this.currentPhrase = pool[Math.floor(Math.random() * pool.length)];
        this.playedPhrases.add(this.currentPhrase);
        this.keywords = this.currentPhrase.split('').filter(c => c.trim() !== '');
    }

    generateMaze() {
        const config = this.currentDifficulty === 'small'
            ? { width: 11, height: 11 }
            : { width: 17, height: 17 };

        this.mazeWidth = config.width;
        this.mazeHeight = config.height;
        this.maze = [];

        for (let y = 0; y < this.mazeHeight; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.mazeWidth; x++) {
                this.maze[y][x] = {
                    type: 'wall',
                    char: '',
                    isKeyword: false,
                    collected: false
                };
            }
        }

        this.generateMazePath(1, 1);

        this.maze[1][1].type = 'start';
        this.startPos = { x: 1, y: 1 };
        this.playerPos = { x: 1, y: 1 };

        const farPoint = this.findFarthestPoint(this.startPos);
        this.exitPos = farPoint;
        this.maze[farPoint.y][farPoint.x].type = 'exit';

        const pathCells = this.getPathBetween(this.startPos, this.exitPos);
        this.placeKeywords(pathCells);
        this.placeDecorations();
    }

    generateMazePath(x, y) {
        const directions = [
            [0, -2], [0, 2], [-2, 0], [2, 0]
        ].sort(() => Math.random() - 0.5);

        this.maze[y][x].type = 'empty';

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx > 0 && nx < this.mazeWidth - 1 &&
                ny > 0 && ny < this.mazeHeight - 1 &&
                this.maze[ny][nx].type === 'wall') {
                this.maze[y + dy / 2][x + dx / 2].type = 'empty';
                this.generateMazePath(nx, ny);
            }
        }
    }

    findFarthestPoint(start) {
        const visited = new Set();
        const queue = [{ ...start, dist: 0 }];
        visited.add(`${start.x},${start.y}`);
        let farthest = { ...start, dist: 0 };

        while (queue.length > 0) {
            const current = queue.shift();
            if (current.dist > farthest.dist) {
                farthest = current;
            }

            const neighbors = [
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 },
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y }
            ];

            for (const n of neighbors) {
                const key = `${n.x},${n.y}`;
                if (!visited.has(key) &&
                    n.x >= 0 && n.x < this.mazeWidth &&
                    n.y >= 0 && n.y < this.mazeHeight &&
                    this.maze[n.y][n.x].type !== 'wall') {
                    visited.add(key);
                    queue.push({ ...n, dist: current.dist + 1 });
                }
            }
        }
        return { x: farthest.x, y: farthest.y };
    }

    getPathBetween(start, end) {
        const queue = [{ pos: start, path: [start] }];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        while (queue.length > 0) {
            const { pos, path } = queue.shift();
            if (pos.x === end.x && pos.y === end.y) {
                return path;
            }

            const neighbors = [
                { x: pos.x, y: pos.y - 1 },
                { x: pos.x, y: pos.y + 1 },
                { x: pos.x - 1, y: pos.y },
                { x: pos.x + 1, y: pos.y }
            ];

            for (const n of neighbors) {
                const key = `${n.x},${n.y}`;
                if (!visited.has(key) &&
                    n.x >= 0 && n.x < this.mazeWidth &&
                    n.y >= 0 && n.y < this.mazeHeight &&
                    this.maze[n.y][n.x].type !== 'wall') {
                    visited.add(key);
                    queue.push({ pos: n, path: [...path, n] });
                }
            }
        }
        return [];
    }

    placeKeywords(pathCells) {
        const keywordChars = [...this.keywords];
        const usableCells = pathCells.filter(cell =>
            !(cell.x === this.startPos.x && cell.y === this.startPos.y) &&
            !(cell.x === this.exitPos.x && cell.y === this.exitPos.y)
        );

        if (keywordChars.length >= usableCells.length) {
            const step = Math.floor(usableCells.length / keywordChars.length);
            keywordChars.forEach((char, i) => {
                const cellIndex = Math.min(i * step + Math.floor(Math.random() * Math.max(1, step)), usableCells.length - 1);
                const cell = usableCells[cellIndex];
                this.maze[cell.y][cell.x].char = char;
                this.maze[cell.y][cell.x].isKeyword = true;
            });
        } else {
            const indices = [];
            while (indices.length < keywordChars.length) {
                const idx = Math.floor(Math.random() * usableCells.length);
                if (!indices.includes(idx)) {
                    indices.push(idx);
                }
            }
            indices.sort((a, b) => a - b);
            indices.forEach((cellIndex, i) => {
                const cell = usableCells[cellIndex];
                this.maze[cell.y][cell.x].char = keywordChars[i];
                this.maze[cell.y][cell.x].isKeyword = true;
            });
        }
    }

    placeDecorations() {
        for (let y = 0; y < this.mazeHeight; y++) {
            for (let x = 0; x < this.mazeWidth; x++) {
                const cell = this.maze[y][x];
                if (cell.type === 'empty' && !cell.isKeyword && cell.char === '') {
                    if (Math.random() < 0.35) {
                        cell.char = DECORATION_CHARS[Math.floor(Math.random() * DECORATION_CHARS.length)];
                        cell.type = 'decoration';
                    }
                }
            }
        }
    }

    renderMaze() {
        const cellSize = this.currentDifficulty === 'small' ? 32 : 26;
        this.mazeGrid.style.gridTemplateColumns = `repeat(${this.mazeWidth}, ${cellSize}px)`;
        this.mazeGrid.innerHTML = '';

        for (let y = 0; y < this.mazeHeight; y++) {
            for (let x = 0; x < this.mazeWidth; x++) {
                const cell = this.maze[y][x];
                const div = document.createElement('div');
                div.className = 'maze-cell';
                div.style.width = `${cellSize}px`;
                div.style.height = `${cellSize}px`;
                div.dataset.x = x;
                div.dataset.y = y;

                if (cell.type === 'wall') {
                    div.classList.add('wall');
                } else if (cell.type === 'start') {
                    div.classList.add('start');
                } else if (cell.type === 'exit') {
                    div.classList.add('exit');
                    div.textContent = '终';
                    if (this.isExitUnlocked()) {
                        div.classList.add('unlocked');
                    }
                } else if (cell.isKeyword) {
                    div.classList.add('keyword');
                    if (cell.collected) {
                        div.classList.add('collected');
                    }
                    div.textContent = cell.char;
                } else if (cell.type === 'decoration') {
                    div.classList.add('decoration');
                    div.textContent = cell.char;
                } else {
                    div.classList.add('empty');
                }

                if (x === this.playerPos.x && y === this.playerPos.y) {
                    div.classList.add('player');
                }

                this.mazeGrid.appendChild(div);
            }
        }
    }

    movePlayer(direction) {
        if (!this.isPlaying) return;

        const dirMap = {
            up: { dx: 0, dy: -1 },
            down: { dx: 0, dy: 1 },
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 }
        };

        const { dx, dy } = dirMap[direction];
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;

        if (newX < 0 || newX >= this.mazeWidth || newY < 0 || newY >= this.mazeHeight) {
            return;
        }

        if (this.maze[newY][newX].type === 'wall') {
            return;
        }

        this.playerPos = { x: newX, y: newY };
        const cell = this.maze[newY][newX];

        if (cell.isKeyword && !cell.collected) {
            const expectedNext = this.keywords[this.collectedChars.length];
            if (cell.char === expectedNext) {
                cell.collected = true;
                this.collectedChars.push(cell.char);
                this.updateCollectedDisplay();
                this.updateTargetDisplay();
                if (this.isExitUnlocked()) {
                    this.renderMaze();
                }
            }
        }

        if (cell.type === 'exit') {
            if (this.isExitUnlocked()) {
                this.handleWin();
                return;
            }
        }

        this.renderMaze();
    }

    isExitUnlocked() {
        return this.collectedChars.length === this.keywords.length;
    }

    updateTargetDisplay() {
        let html = '';
        this.keywords.forEach((char, i) => {
            const isCollected = i < this.collectedChars.length;
            html += `<span class="target-char ${isCollected ? 'collected' : ''}">${char}</span>`;
        });
        this.targetDisplay.innerHTML = html;
    }

    updateCollectedDisplay() {
        this.collectedDisplay.innerHTML = this.collectedChars
            .map(c => `<span class="collected-char">${c}</span>`)
            .join('');
    }

    showHint() {
        if (!this.isPlaying) return;
        let nextHintIndex = this.collectedChars.length;
        if (nextHintIndex >= this.keywords.length) return;

        for (let y = 0; y < this.mazeHeight; y++) {
            for (let x = 0; x < this.mazeWidth; x++) {
                const cell = this.maze[y][x];
                if (cell.isKeyword && !cell.collected && cell.char === this.keywords[nextHintIndex]) {
                    const cellEl = this.mazeGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                    if (cellEl) {
                        cellEl.style.transition = 'all 0.3s ease';
                        cellEl.style.background = 'rgba(232, 168, 124, 0.3)';
                        cellEl.style.transform = 'scale(1.2)';
                        setTimeout(() => {
                            cellEl.style.background = '';
                            cellEl.style.transform = '';
                        }, 1500);
                    }
                    return;
                }
            }
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.timerEl.textContent = this.formatTime(this.elapsedTime);
        }, 1000);
        this.timerEl.textContent = '00:00';
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    handleWin() {
        this.isPlaying = false;
        this.stopTimer();

        this.winPhrase.textContent = this.currentPhrase;
        this.winTime.textContent = `用时：${this.formatTime(this.elapsedTime)}`;

        this.saveRecord();
        this.winModal.classList.add('active');
    }

    saveRecord() {
        const records = JSON.parse(localStorage.getItem('hanzi_maze_records') || '[]');
        records.unshift({
            category: this.currentCategory,
            categoryName: CATEGORY_NAMES[this.currentCategory],
            phrase: this.currentPhrase,
            time: this.elapsedTime,
            difficulty: this.currentDifficulty,
            level: this.currentLevel,
            timestamp: Date.now()
        });
        if (records.length > 100) {
            records.length = 100;
        }
        localStorage.setItem('hanzi_maze_records', JSON.stringify(records));
    }

    renderRecords() {
        const records = JSON.parse(localStorage.getItem('hanzi_maze_records') || '[]');

        if (records.length === 0) {
            this.recordsList.innerHTML = '<div class="empty-records">暂无通关记录<br>开始游戏，留下你的足迹</div>';
            return;
        }

        this.recordsList.innerHTML = records.map(r => `
            <div class="record-item">
                <div class="record-category">${r.categoryName} · ${r.difficulty === 'small' ? '小型' : '大型'} · 第${r.level}关</div>
                <div class="record-phrase">${r.phrase}</div>
                <div class="record-meta">
                    <span>用时 ${this.formatTime(r.time)}</span>
                    <span>${new Date(r.timestamp).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MazeGame();
});

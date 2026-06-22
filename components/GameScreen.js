window.HanziMaze = window.HanziMaze || {};

window.HanziMaze.GameScreen = (function() {
    const Timer = window.HanziMaze.Timer;
    const MazeGenerator = window.HanziMaze.MazeGenerator;
    const PHRASE_BANK = window.HanziMaze.PHRASE_BANK;

    let maze = [];
    let mazeWidth = 0;
    let mazeHeight = 0;
    let playerPos = { x: 0, y: 0 };
    let startPos = { x: 0, y: 0 };
    let exitPos = { x: 0, y: 0 };
    let currentPhrase = "";
    let keywords = [];
    let collectedChars = [];
    let isPlaying = false;
    let currentLevel = 0;
    let playedPhrases = new Set();
    let currentCategory = 'healing';
    let currentDifficulty = 'small';

    let onBack = null;
    let onWin = null;
    let onHint = null;

    let mazeGridEl = null;
    let timerEl = null;
    let levelInfoEl = null;
    let targetDisplayEl = null;
    let collectedDisplayEl = null;

    function render(container) {
        container.innerHTML = `
            <div class="game-header">
                <button id="back-btn" class="icon-btn">← 返回</button>
                <div class="game-info">
                    <span class="timer" id="timer">00:00</span>
                    <span class="level-info" id="level-info">第 1 关</span>
                </div>
                <button id="hint-btn" class="icon-btn">💡</button>
            </div>

            <div class="target-phrase">
                <span class="target-label">目标：</span>
                <span id="target-display" class="target-text"></span>
            </div>

            <div class="collected-section">
                <span class="collected-label">已收集：</span>
                <div id="collected-display" class="collected-chars"></div>
            </div>

            <div id="maze-container" class="maze-container">
                <div id="maze-grid" class="maze-grid"></div>
            </div>

            <div class="mobile-controls">
                <div class="dpad">
                    <button class="dpad-btn dpad-up" data-dir="up">↑</button>
                    <button class="dpad-btn dpad-left" data-dir="left">←</button>
                    <button class="dpad-btn dpad-right" data-dir="right">→</button>
                    <button class="dpad-btn dpad-down" data-dir="down">↓</button>
                </div>
            </div>
        `;
        initElements();
        bindEvents();
    }

    function initElements() {
        mazeGridEl = document.getElementById('maze-grid');
        timerEl = document.getElementById('timer');
        levelInfoEl = document.getElementById('level-info');
        targetDisplayEl = document.getElementById('target-display');
        collectedDisplayEl = document.getElementById('collected-display');
    }

    function bindEvents() {
        document.getElementById('back-btn').addEventListener('click', () => {
            Timer.stop();
            isPlaying = false;
            if (onBack) {
                onBack();
            }
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            showHint();
        });

        document.querySelectorAll('.dpad-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                movePlayer(btn.dataset.dir);
            });
        });

        document.addEventListener('keydown', handleKeydown);
        initSwipeControls();
    }

    function handleKeydown(e) {
        if (!isPlaying) return;
        const keyMap = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right'
        };
        if (keyMap[e.key]) {
            e.preventDefault();
            movePlayer(keyMap[e.key]);
        }
    }

    function initSwipeControls() {
        let startX = 0, startY = 0;
        const threshold = 30;
        const mazeContainer = document.getElementById('maze-container');
        
        mazeContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        mazeContainer.addEventListener('touchend', (e) => {
            if (!isPlaying) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > threshold) {
                    movePlayer(diffX > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(diffY) > threshold) {
                    movePlayer(diffY > 0 ? 'down' : 'up');
                }
            }
        }, { passive: true });
    }

    function setHandlers(handlers) {
        onBack = handlers.onBack;
        onWin = handlers.onWin;
    }

    function startGame(category, difficulty, level = 1, played = new Set()) {
        currentCategory = category;
        currentDifficulty = difficulty;
        currentLevel = level;
        playedPhrases = played;

        selectPhrase();
        const mazeData = MazeGenerator.generate(currentDifficulty, keywords);
        maze = mazeData.maze;
        mazeWidth = mazeData.width;
        mazeHeight = mazeData.height;
        startPos = mazeData.startPos;
        exitPos = mazeData.exitPos;
        playerPos = mazeData.playerPos;

        collectedChars = [];
        isPlaying = true;

        renderMaze();
        updateTargetDisplay();
        updateCollectedDisplay();
        levelInfoEl.textContent = `第 ${currentLevel} 关`;

        Timer.start((formatted) => {
            timerEl.textContent = formatted;
        });
    }

    function selectPhrase() {
        const phrases = PHRASE_BANK[currentCategory];
        const available = phrases.filter(p => !playedPhrases.has(p));
        let pool = available.length > 0 ? available : phrases;
        
        currentPhrase = pool[Math.floor(Math.random() * pool.length)];
        playedPhrases.add(currentPhrase);
        keywords = currentPhrase.split('').filter(c => c.trim() !== '');
    }

    function renderMaze() {
        const cellSize = currentDifficulty === 'small' ? 32 : 26;
        mazeGridEl.style.gridTemplateColumns = `repeat(${mazeWidth}, ${cellSize}px)`;
        mazeGridEl.innerHTML = '';

        for (let y = 0; y < mazeHeight; y++) {
            for (let x = 0; x < mazeWidth; x++) {
                const cell = maze[y][x];
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
                    if (isExitUnlocked()) {
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

                if (x === playerPos.x && y === playerPos.y) {
                    div.classList.add('player');
                }

                mazeGridEl.appendChild(div);
            }
        }
    }

    function movePlayer(direction) {
        if (!isPlaying) return;

        const dirMap = {
            up: { dx: 0, dy: -1 },
            down: { dx: 0, dy: 1 },
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 }
        };

        const { dx, dy } = dirMap[direction];
        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        if (newX < 0 || newX >= mazeWidth || newY < 0 || newY >= mazeHeight) {
            return;
        }

        if (maze[newY][newX].type === 'wall') {
            return;
        }

        playerPos = { x: newX, y: newY };
        const cell = maze[newY][newX];

        if (cell.isKeyword && !cell.collected) {
            const expectedNext = keywords[collectedChars.length];
            if (cell.char === expectedNext) {
                cell.collected = true;
                collectedChars.push(cell.char);
                updateCollectedDisplay();
                updateTargetDisplay();
                if (isExitUnlocked()) {
                    renderMaze();
                }
            }
        }

        if (cell.type === 'exit') {
            if (isExitUnlocked()) {
                handleWin();
                return;
            }
        }

        renderMaze();
    }

    function isExitUnlocked() {
        return collectedChars.length === keywords.length;
    }

    function updateTargetDisplay() {
        let html = '';
        keywords.forEach((char, i) => {
            const isCollected = i < collectedChars.length;
            html += `<span class="target-char ${isCollected ? 'collected' : ''}">${char}</span>`;
        });
        targetDisplayEl.innerHTML = html;
    }

    function updateCollectedDisplay() {
        collectedDisplayEl.innerHTML = collectedChars
            .map(c => `<span class="collected-char">${c}</span>`)
            .join('');
    }

    function showHint() {
        if (!isPlaying) return;
        let nextHintIndex = collectedChars.length;
        if (nextHintIndex >= keywords.length) return;

        for (let y = 0; y < mazeHeight; y++) {
            for (let x = 0; x < mazeWidth; x++) {
                const cell = maze[y][x];
                if (cell.isKeyword && !cell.collected && cell.char === keywords[nextHintIndex]) {
                    const cellEl = mazeGridEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
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

    function handleWin() {
        isPlaying = false;
        Timer.stop();

        if (onWin) {
            onWin({
                phrase: currentPhrase,
                time: Timer.getElapsed(),
                timeFormatted: Timer.getElapsedFormatted(),
                category: currentCategory,
                difficulty: currentDifficulty,
                level: currentLevel,
                playedPhrases: playedPhrases
            });
        }
    }

    function cleanup() {
        document.removeEventListener('keydown', handleKeydown);
        Timer.stop();
    }

    return {
        render,
        setHandlers,
        startGame,
        cleanup
    };
})();

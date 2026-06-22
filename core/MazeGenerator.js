window.HanziMaze = window.HanziMaze || {};

window.HanziMaze.MazeGenerator = (function() {
    const DECORATION_CHARS = window.HanziMaze.DECORATION_CHARS;

    function createMaze(width, height) {
        const maze = [];
        for (let y = 0; y < height; y++) {
            maze[y] = [];
            for (let x = 0; x < width; x++) {
                maze[y][x] = {
                    type: 'wall',
                    char: '',
                    isKeyword: false,
                    collected: false
                };
            }
        }
        return maze;
    }

    function generateMazePath(maze, x, y, width, height) {
        const directions = [
            [0, -2], [0, 2], [-2, 0], [2, 0]
        ].sort(() => Math.random() - 0.5);

        maze[y][x].type = 'empty';

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx > 0 && nx < width - 1 &&
                ny > 0 && ny < height - 1 &&
                maze[ny][nx].type === 'wall') {
                maze[y + dy / 2][x + dx / 2].type = 'empty';
                generateMazePath(maze, nx, ny, width, height);
            }
        }
    }

    function findFarthestPoint(maze, start, width, height) {
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
                    n.x >= 0 && n.x < width &&
                    n.y >= 0 && n.y < height &&
                    maze[n.y][n.x].type !== 'wall') {
                    visited.add(key);
                    queue.push({ ...n, dist: current.dist + 1 });
                }
            }
        }
        return { x: farthest.x, y: farthest.y };
    }

    function getPathBetween(maze, start, end, width, height) {
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
                    n.x >= 0 && n.x < width &&
                    n.y >= 0 && n.y < height &&
                    maze[n.y][n.x].type !== 'wall') {
                    visited.add(key);
                    queue.push({ pos: n, path: [...path, n] });
                }
            }
        }
        return [];
    }

    function placeKeywords(maze, pathCells, keywords, startPos, exitPos) {
        const keywordChars = [...keywords];
        const usableCells = pathCells.filter(cell =>
            !(cell.x === startPos.x && cell.y === startPos.y) &&
            !(cell.x === exitPos.x && cell.y === exitPos.y)
        );

        if (keywordChars.length >= usableCells.length) {
            const step = Math.floor(usableCells.length / keywordChars.length);
            keywordChars.forEach((char, i) => {
                const cellIndex = Math.min(i * step + Math.floor(Math.random() * Math.max(1, step)), usableCells.length - 1);
                const cell = usableCells[cellIndex];
                maze[cell.y][cell.x].char = char;
                maze[cell.y][cell.x].isKeyword = true;
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
                maze[cell.y][cell.x].char = keywordChars[i];
                maze[cell.y][cell.x].isKeyword = true;
            });
        }
    }

    function placeDecorations(maze, width, height) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = maze[y][x];
                if (cell.type === 'empty' && !cell.isKeyword && cell.char === '') {
                    if (Math.random() < 0.35) {
                        cell.char = DECORATION_CHARS[Math.floor(Math.random() * DECORATION_CHARS.length)];
                        cell.type = 'decoration';
                    }
                }
            }
        }
    }

    function generate(difficulty, keywords) {
        const config = difficulty === 'small'
            ? { width: 11, height: 11 }
            : { width: 17, height: 17 };

        const width = config.width;
        const height = config.height;
        const maze = createMaze(width, height);

        generateMazePath(maze, 1, 1, width, height);

        const startPos = { x: 1, y: 1 };
        maze[1][1].type = 'start';

        const exitPos = findFarthestPoint(maze, startPos, width, height);
        maze[exitPos.y][exitPos.x].type = 'exit';

        const pathCells = getPathBetween(maze, startPos, exitPos, width, height);
        placeKeywords(maze, pathCells, keywords, startPos, exitPos);
        placeDecorations(maze, width, height);

        return {
            maze,
            width,
            height,
            startPos,
            exitPos,
            playerPos: { ...startPos }
        };
    }

    return {
        generate,
        findFarthestPoint,
        getPathBetween
    };
})();

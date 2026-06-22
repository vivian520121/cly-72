window.HanziMaze = window.HanziMaze || {};

window.HanziMaze.HomeScreen = (function() {
    const PHRASE_BANK = window.HanziMaze.PHRASE_BANK;
    const CATEGORY_NAMES = window.HanziMaze.CATEGORY_NAMES;

    let currentCategory = 'healing';
    let currentDifficulty = 'small';
    let onStartGame = null;
    let onShowRecords = null;

    function render(container) {
        container.innerHTML = `
            <h1 class="game-title">汉字迷宫</h1>
            <p class="subtitle">在文字中漫步，拼凑心灵的回响</p>
            
            <div class="menu-section">
                <h3 class="section-title">选择类别</h3>
                <div class="category-buttons">
                    <button class="category-btn active" data-category="healing">治愈短句</button>
                    <button class="category-btn" data-category="ancient">古风诗句</button>
                    <button class="category-btn" data-category="gentle">温柔文案</button>
                </div>
            </div>

            <div class="menu-section">
                <h3 class="section-title">选择难度</h3>
                <div class="difficulty-buttons">
                    <button class="difficulty-btn active" data-difficulty="small">小型迷宫</button>
                    <button class="difficulty-btn" data-difficulty="large">大型迷宫</button>
                </div>
            </div>

            <button id="start-btn" class="primary-btn">开始游戏</button>
            <button id="records-btn" class="secondary-btn">通关记录</button>
        `;
        bindEvents();
    }

    function bindEvents() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
            });
        });

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDifficulty = btn.dataset.difficulty;
            });
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            if (onStartGame) {
                onStartGame(currentCategory, currentDifficulty);
            }
        });

        document.getElementById('records-btn').addEventListener('click', () => {
            if (onShowRecords) {
                onShowRecords();
            }
        });
    }

    function setHandlers(handlers) {
        onStartGame = handlers.onStartGame;
        onShowRecords = handlers.onShowRecords;
    }

    function getConfig() {
        return {
            category: currentCategory,
            difficulty: currentDifficulty
        };
    }

    return {
        render,
        setHandlers,
        getConfig
    };
})();

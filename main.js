window.HanziMaze = window.HanziMaze || {};

window.HanziMaze.App = (function() {
    const HomeScreen = window.HanziMaze.HomeScreen;
    const GameScreen = window.HanziMaze.GameScreen;
    const RecordsScreen = window.HanziMaze.RecordsScreen;
    const WinModal = window.HanziMaze.WinModal;
    const Storage = window.HanziMaze.Storage;
    const CATEGORY_NAMES = window.HanziMaze.CATEGORY_NAMES;

    let screens = {};
    let currentScreen = 'menu';
    let lastWinData = null;

    function init() {
        initScreens();
        initComponents();
        bindComponentHandlers();
        showScreen('menu');
    }

    function initScreens() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div id="menu-screen" class="screen"></div>
            <div id="game-screen" class="screen"></div>
            <div id="records-screen" class="screen"></div>
        `;
        screens = {
            menu: document.getElementById('menu-screen'),
            game: document.getElementById('game-screen'),
            records: document.getElementById('records-screen')
        };
    }

    function initComponents() {
        HomeScreen.render(screens.menu);
        GameScreen.render(screens.game);
        RecordsScreen.render(screens.records);
        WinModal.render(document.getElementById('app'));
    }

    function bindComponentHandlers() {
        HomeScreen.setHandlers({
            onStartGame: (category, difficulty) => {
                GameScreen.startGame(category, difficulty, 1, new Set());
                showScreen('game');
            },
            onShowRecords: () => {
                RecordsScreen.renderRecords();
                showScreen('records');
            }
        });

        GameScreen.setHandlers({
            onBack: () => {
                GameScreen.cleanup();
                showScreen('menu');
            },
            onWin: (winData) => {
                lastWinData = winData;
                Storage.saveRecord({
                    category: winData.category,
                    categoryName: CATEGORY_NAMES[winData.category],
                    phrase: winData.phrase,
                    time: winData.time,
                    difficulty: winData.difficulty,
                    level: winData.level,
                    timestamp: Date.now()
                });
                WinModal.show(winData);
            }
        });

        RecordsScreen.setHandlers({
            onBack: () => {
                showScreen('menu');
            }
        });

        WinModal.setHandlers({
            onNextLevel: () => {
                if (lastWinData) {
                    GameScreen.startGame(
                        lastWinData.category,
                        lastWinData.difficulty,
                        lastWinData.level + 1,
                        lastWinData.playedPhrases
                    );
                    showScreen('game');
                }
            },
            onBackToMenu: () => {
                GameScreen.cleanup();
                showScreen('menu');
            }
        });
    }

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenName].classList.add('active');
        currentScreen = screenName;
    }

    return {
        init
    };
})();

(function bootstrap() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.HanziMaze.App.init();
        });
    } else {
        window.HanziMaze.App.init();
    }
})();

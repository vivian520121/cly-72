window.HanziMaze = window.HanziMaze || {};

window.HanziMaze.WinModal = (function() {
    let modalEl = null;
    let winPhraseEl = null;
    let winTimeEl = null;
    let onNextLevel = null;
    let onBackToMenu = null;

    function render(container) {
        const modalHtml = `
            <div id="win-modal" class="modal">
                <div class="modal-content">
                    <h2 class="modal-title">🎉 通关成功！</h2>
                    <p class="modal-phrase" id="win-phrase"></p>
                    <p class="modal-time" id="win-time"></p>
                    <div class="modal-buttons">
                        <button id="next-level-btn" class="primary-btn">下一关</button>
                        <button id="win-back-btn" class="secondary-btn">返回菜单</button>
                    </div>
                </div>
            </div>
        `;
        const temp = document.createElement('div');
        temp.innerHTML = modalHtml.trim();
        const modalEl = temp.firstChild;
        container.appendChild(modalEl);
        initElements();
        bindEvents();
    }

    function initElements() {
        modalEl = document.getElementById('win-modal');
        winPhraseEl = document.getElementById('win-phrase');
        winTimeEl = document.getElementById('win-time');
    }

    function bindEvents() {
        document.getElementById('next-level-btn').addEventListener('click', () => {
            hide();
            if (onNextLevel) {
                onNextLevel();
            }
        });

        document.getElementById('win-back-btn').addEventListener('click', () => {
            hide();
            if (onBackToMenu) {
                onBackToMenu();
            }
        });
    }

    function setHandlers(handlers) {
        onNextLevel = handlers.onNextLevel;
        onBackToMenu = handlers.onBackToMenu;
    }

    function show(data) {
        winPhraseEl.textContent = data.phrase;
        winTimeEl.textContent = `用时：${data.timeFormatted}`;
        modalEl.classList.add('active');
    }

    function hide() {
        modalEl.classList.remove('active');
    }

    return {
        render,
        setHandlers,
        show,
        hide
    };
})();

window.HanziMaze = window.HanziMaze || {};

window.HanziMaze.RecordsScreen = (function() {
    const Storage = window.HanziMaze.Storage;
    const Timer = window.HanziMaze.Timer;

    let onBack = null;
    let recordsListEl = null;

    function render(container) {
        container.innerHTML = `
            <div class="game-header">
                <button id="records-back-btn" class="icon-btn">← 返回</button>
                <h2 class="screen-title">通关记录</h2>
                <span class="placeholder"></span>
            </div>
            <div id="records-list" class="records-list"></div>
            <button id="clear-records-btn" class="secondary-btn">清空记录</button>
        `;
        initElements();
        bindEvents();
        renderRecords();
    }

    function initElements() {
        recordsListEl = document.getElementById('records-list');
    }

    function bindEvents() {
        document.getElementById('records-back-btn').addEventListener('click', () => {
            if (onBack) {
                onBack();
            }
        });

        document.getElementById('clear-records-btn').addEventListener('click', () => {
            if (confirm('确定要清空所有通关记录吗？')) {
                Storage.clearRecords();
                renderRecords();
            }
        });
    }

    function setHandlers(handlers) {
        onBack = handlers.onBack;
    }

    function renderRecords() {
        const records = Storage.getRecords();

        if (records.length === 0) {
            recordsListEl.innerHTML = '<div class="empty-records">暂无通关记录<br>开始游戏，留下你的足迹</div>';
            return;
        }

        recordsListEl.innerHTML = records.map(r => `
            <div class="record-item">
                <div class="record-category">${r.categoryName} · ${r.difficulty === 'small' ? '小型' : '大型'} · 第${r.level}关</div>
                <div class="record-phrase">${r.phrase}</div>
                <div class="record-meta">
                    <span>用时 ${Timer.formatTime(r.time)}</span>
                    <span>${new Date(r.timestamp).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    return {
        render,
        setHandlers,
        renderRecords
    };
})();

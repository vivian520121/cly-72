window.HanziMaze = window.HanziMaze || {};

window.HanziMaze.Timer = (function() {
    let interval = null;
    let startTime = 0;
    let elapsedTime = 0;
    let onTick = null;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function start(callback) {
        stop();
        onTick = callback;
        startTime = Date.now();
        elapsedTime = 0;
        interval = setInterval(() => {
            elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            if (onTick) {
                onTick(formatTime(elapsedTime), elapsedTime);
            }
        }, 1000);
        if (onTick) {
            onTick('00:00', 0);
        }
    }

    function stop() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    function getElapsed() {
        return elapsedTime;
    }

    function getElapsedFormatted() {
        return formatTime(elapsedTime);
    }

    return {
        start,
        stop,
        getElapsed,
        getElapsedFormatted,
        formatTime
    };
})();

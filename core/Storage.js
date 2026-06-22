window.HanziMaze = window.HanziMaze || {};

window.HanziMaze.Storage = (function() {
    const STORAGE_KEY = 'hanzi_maze_records';
    const MAX_RECORDS = 100;

    function getRecords() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }

    function saveRecord(record) {
        const records = getRecords();
        records.unshift(record);
        if (records.length > MAX_RECORDS) {
            records.length = MAX_RECORDS;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return records;
    }

    function clearRecords() {
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }

    return {
        getRecords,
        saveRecord,
        clearRecords
    };
})();

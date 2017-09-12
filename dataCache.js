const EventEmitter = require("events").EventEmitter;

class DataCache extends EventEmitter {
    constructor(limit) {
        super();
        this.limit = limit;
        this.cache = new Array(this.limit);
    }

    add(data) {
        this.cache.push(data);
        let diff = this.cache.length - this.limit;
        for (let i = 0; i < diff; i++) {
            this.cache.shift();
        }

        this.emit("data", data);
    }

    timeRange(start, end) {
        return this.cache.filter(data => data.timestamp >= start && data.timestamp < end);
    }
}

module.exports = DataCache;
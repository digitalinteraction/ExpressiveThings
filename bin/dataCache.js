"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class DataCache extends events_1.EventEmitter {
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
exports.DataCache = DataCache;
//# sourceMappingURL=dataCache.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class Recognizer extends events_1.EventEmitter {
    constructor(dataCache) {
        super();
        this.dataCache = dataCache;
    }
}
exports.Recognizer = Recognizer;
//# sourceMappingURL=recognizer.js.map
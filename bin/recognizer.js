const EventEmitter = require("events").EventEmitter;
class Recognizer extends EventEmitter {
    constructor(dataCache) {
        super();
        this.dataCache = dataCache;
    }
}
module.exports = Recognizer;
//# sourceMappingURL=recognizer.js.map
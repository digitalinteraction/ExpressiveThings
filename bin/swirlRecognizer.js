"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recognizer_1 = require("./recognizer");
class SwirlRecognizer extends recognizer_1.Recognizer {
    constructor(dataCache, poseRecogniser, window) {
        super(dataCache);
        this.window = window;
        this.pose = 1;
        this.dataCache.on("data", this.update.bind(this));
        poseRecogniser.on("stateChanged", ((state) => this.pose = state).bind(this));
    }
    update(data) {
        let now = new Date();
        let dataRange = this.dataCache.timeRange(new Date(now.getDate() - this.window), now);
        let force = 0.0;
        for (let d of dataRange) {
            force += d.acc.mag();
        }
        if (this.pose == 0 && force > 3) {
            this.emit("twirl");
        }
    }
}
exports.SwirlRecognizer = SwirlRecognizer;
//# sourceMappingURL=swirlRecognizer.js.map
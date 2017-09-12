const Recognizer = require("./recognizer.js");

class SwirlRecognizer extends Recognizer {
    constructor(dataCache, poseRecogniser, window) {
        super(dataCache);
        this.window = window;
        this.pose = 1;
        this.dataCache.on("data", this.update.bind(this));
        poseRecogniser.on("stateChanged", ((state) => this.pose = state).bind(this));
    }

    update(data) {
        let now = new Date();
        let dataRange = this.dataCache.timeRange(new Date(now - this.window), now);
        
        let force = 0.0;

        for (let d of dataRange) {
            force += d.acc.mag();
        }

        if (this.pose == 0 && force > 3) {
            this.emit("twirl");
        }
    }
}

module.exports = SwirlRecognizer;
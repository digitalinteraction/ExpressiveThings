const Recognizer = require("./recognizer.js");

class PoseRecognizer extends Recognizer {
    constructor(dataCache) {
        super(dataCache);
        this.state = StateEnum.MIDDLE;
        this.dataCache.on("data", this.update.bind(this));
    }

    update(data) {
        let newState;

        if (data.grav.z < -0.67) {
            newState = StateEnum.UP
        } else if (data.grav.z > 0.67) {
            newState = StateEnum.DOWN;
        } else {
            newState = StateEnum.MIDDLE;
        }

        if (newState != this.state) {
            this.state = newState;
            this.emit("stateChanged", this.state);
        }
    }
}

StateEnum = {
    UP: 0,
    MIDDLE: 1,
    DOWN: 2
}

module.exports = PoseRecognizer;
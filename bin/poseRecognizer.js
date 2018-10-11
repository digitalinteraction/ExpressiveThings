"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recognizer_1 = require("./recognizer");
class PoseRecognizer extends recognizer_1.Recognizer {
    constructor(dataCache) {
        super(dataCache);
        this.upPoseLowerThreshold = -0.67;
        this.middlePoseUpperThreshold = -0.67;
        this.middlePoseLowerThreshold = 0.67;
        this.downPoseUpperThreshold = 0.67;
        this.state = PoseEnum.MIDDLE;
        this.dataCache.on("data", this.update.bind(this));
    }
    update(data) {
        let newState;
        switch (this.state) {
            case PoseEnum.UP:
                if (data.grav.z >= this.upPoseLowerThreshold && data.grav.z < this.middlePoseLowerThreshold) {
                    newState = PoseEnum.MIDDLE;
                }
                else if (data.grav.z >= this.middlePoseLowerThreshold) {
                    newState = PoseEnum.DOWN;
                }
                break;
            case PoseEnum.MIDDLE:
                if (data.grav.z <= this.middlePoseUpperThreshold) {
                    newState = PoseEnum.UP;
                }
                else if (data.grav.z > this.middlePoseLowerThreshold) {
                    newState = PoseEnum.DOWN;
                }
            case PoseEnum.DOWN:
                if (data.grav.z <= this.downPoseUpperThreshold && data.grav.z > this.middlePoseUpperThreshold) {
                    newState = PoseEnum.MIDDLE;
                }
                else if (data.grav.z <= this.middlePoseUpperThreshold) {
                    newState = PoseEnum.UP;
                }
        }
        if (newState != this.state) {
            this.state = newState;
            this.emit("stateChanged", this.state);
        }
    }
}
exports.PoseRecognizer = PoseRecognizer;
var PoseEnum;
(function (PoseEnum) {
    PoseEnum[PoseEnum["UP"] = 0] = "UP";
    PoseEnum[PoseEnum["MIDDLE"] = 1] = "MIDDLE";
    PoseEnum[PoseEnum["DOWN"] = 2] = "DOWN";
})(PoseEnum = exports.PoseEnum || (exports.PoseEnum = {}));
//# sourceMappingURL=poseRecognizer.js.map
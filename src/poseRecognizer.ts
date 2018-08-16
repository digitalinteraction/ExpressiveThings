import { Recognizer } from "./recognizer";
import { DataCache } from "./dataCache";
import { Wax9Data } from "./wax9Data";

export class PoseRecognizer extends Recognizer<Wax9Data> {
    state: PoseEnum;
    
    upPoseLowerThreshold = -0.67;
	middlePoseUpperThreshold = -0.67;
	middlePoseLowerThreshold = 0.67;
	downPoseUpperThreshold = 0.67;

    constructor(dataCache: DataCache<Wax9Data>) {
        super(dataCache);
        this.state = PoseEnum.MIDDLE;
        this.dataCache.on("data", this.update.bind(this));
    }

    update(data: Wax9Data) {
        let newState;

        switch (this.state) {
            case PoseEnum.UP:
            if (data.grav.z >= this.upPoseLowerThreshold && data.grav.z < this.middlePoseLowerThreshold) {
                newState = PoseEnum.MIDDLE;
            } else if (data.grav.z >= this.middlePoseLowerThreshold) {
                newState = PoseEnum.DOWN;
            }
            break;
            case PoseEnum.MIDDLE:
            if (data.grav.z <= this.middlePoseUpperThreshold) {
                newState = PoseEnum.UP;
            } else if (data.grav.z > this.middlePoseLowerThreshold) {
                newState = PoseEnum.DOWN;
            }
            case PoseEnum.DOWN:
            if (data.grav.z <= this.downPoseUpperThreshold && data.grav.z > this.middlePoseUpperThreshold) {
                newState = PoseEnum.MIDDLE;
            } else if (data.grav.z <= this.middlePoseUpperThreshold) {
                newState = PoseEnum.UP;
            }
        }
        
        if (newState != this.state) {
            this.state = newState;
            this.emit("stateChanged", this.state);
        }
    }
}

export enum PoseEnum {
    UP = 0,
    MIDDLE = 1,
    DOWN = 2
}
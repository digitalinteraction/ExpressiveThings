import { Recognizer } from "./recognizer";
import { DataCache } from "./dataCache";
import { Wax9Data } from "./wax9Data";
import { PoseRecognizer, PoseEnum } from "./poseRecognizer";

export class SwirlRecognizer extends Recognizer<Wax9Data> {
    window: number;
    pose: PoseEnum;

    constructor(dataCache: DataCache<Wax9Data>, poseRecogniser: PoseRecognizer, window: number) {
        super(dataCache);
        this.window = window;
        this.pose = 1;
        this.dataCache.on("data", this.update.bind(this));
        poseRecogniser.on("stateChanged", ((state: PoseEnum) => this.pose = state).bind(this));
    }

    update(data: Wax9Data) {
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
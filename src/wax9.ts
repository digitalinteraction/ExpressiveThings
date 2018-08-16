import { SwirlRecognizer } from "./swirlRecognizer";
import { Wax9Processor } from "./Wax9Processor";
import { Peripheral, Characteristic } from "noble";
import { DataCache } from "./dataCache";
import { EventEmitter } from "events";
import { Wax9Data } from "./wax9Data";
import { PoseRecognizer, PoseEnum } from "./poseRecognizer";

export class Wax9 extends EventEmitter {    
    peripheral: Peripheral;
    dataCache: DataCache<Wax9Data>;
    processor: Wax9Processor;
    poseRecognizer: PoseRecognizer;
    swirlRecognizer: SwirlRecognizer;

    sampleRate = 10;

    currentPose: PoseEnum;
    lastSwirl: Date;

    sampleRateCharacUuid = "0000000a0008a8bae311f48c90364d99";
    streamCharacUuid = "000000010008a8bae311f48c90364d99";
    notifyCharacUuid = "000000020008a8bae311f48c90364d99";

    constructor(peripheral: Peripheral) {
        super();
        this.peripheral = peripheral;
        this.dataCache = new DataCache(100);
        this.processor = new Wax9Processor(this.sampleRate);

        this.poseRecognizer = new PoseRecognizer(this.dataCache);
        this.swirlRecognizer = new SwirlRecognizer(this.dataCache, this.poseRecognizer, 100);

        this.currentPose = PoseEnum.MIDDLE;
        this.lastSwirl = new Date(0);

        this.poseRecognizer.on("stateChanged", (pose: PoseEnum) => {
            this.currentPose = pose;
            this.emit("poseChanged", pose);
        });

        this.swirlRecognizer.on("swirl", () => {
            this.lastSwirl = new Date();
            this.emit("swirl");
        });
    }

    async connect() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.peripheral.connect((error) => {
                if (error) {
                    reject(`NOBLE: Failed to connect to device -- ${error}`);
                    return;
                }
                this.peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
                    if (error) {
                        reject(`NOBLE: Failed to discover characteristics -- ${error}`);
                        return;
                    }
                    this._setupWaxStream(characteristics);
                    resolve();
                });
            });
        });
    }

    _setupWaxStream(characteristics: Characteristic[]) {
        let sampleRateCharac = characteristics.find((charac) =>  { return charac.uuid === this.sampleRateCharacUuid });
        let notifyCharac = characteristics.find((charac) => { return charac.uuid === this.notifyCharacUuid });
        let streamCharac = characteristics.find((charac) => { return charac.uuid === this.streamCharacUuid });
    
        sampleRateCharac.write(Buffer.from([this.sampleRate]), false);
        notifyCharac.subscribe();
        streamCharac.write(Buffer.from([1]), false, null);
    
        notifyCharac.on("data", (data: Buffer) => {
            let pd = this.processor.updateFromBytes(data);
            this.dataCache.add(pd);

            this.emit("data", pd);
        });
    }
}
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const swirlRecognizer_1 = require("./swirlRecognizer");
const Wax9Processor_1 = require("./Wax9Processor");
const dataCache_1 = require("./dataCache");
const events_1 = require("events");
const poseRecognizer_1 = require("./poseRecognizer");
class Wax9 extends events_1.EventEmitter {
    constructor(peripheral) {
        super();
        this.sampleRate = 10;
        this.sampleRateCharacUuid = "0000000a0008a8bae311f48c90364d99";
        this.streamCharacUuid = "000000010008a8bae311f48c90364d99";
        this.notifyCharacUuid = "000000020008a8bae311f48c90364d99";
        this.peripheral = peripheral;
        this.dataCache = new dataCache_1.DataCache(100);
        this.processor = new Wax9Processor_1.Wax9Processor(this.sampleRate);
        this.poseRecognizer = new poseRecognizer_1.PoseRecognizer(this.dataCache);
        this.swirlRecognizer = new swirlRecognizer_1.SwirlRecognizer(this.dataCache, this.poseRecognizer, 100);
        this.currentPose = poseRecognizer_1.PoseEnum.MIDDLE;
        this.lastSwirl = new Date(0);
        this.poseRecognizer.on("stateChanged", (pose) => {
            this.currentPose = pose;
            this.emit("poseChanged", pose);
        });
        this.swirlRecognizer.on("swirl", () => {
            this.lastSwirl = new Date();
            this.emit("swirl");
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
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
        });
    }
    _setupWaxStream(characteristics) {
        let sampleRateCharac = characteristics.find((charac) => { return charac.uuid === this.sampleRateCharacUuid; });
        let notifyCharac = characteristics.find((charac) => { return charac.uuid === this.notifyCharacUuid; });
        let streamCharac = characteristics.find((charac) => { return charac.uuid === this.streamCharacUuid; });
        sampleRateCharac.write(Buffer.from([this.sampleRate]), false);
        notifyCharac.subscribe();
        streamCharac.write(Buffer.from([1]), false, null);
        notifyCharac.on("data", (data) => {
            let pd = this.processor.updateFromBytes(data);
            this.dataCache.add(pd);
            this.emit("data", pd);
        });
    }
}
exports.Wax9 = Wax9;
//# sourceMappingURL=wax9.js.map
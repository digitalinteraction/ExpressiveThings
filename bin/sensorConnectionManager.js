"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const noble_1 = __importDefault(require("noble"));
const wax9_1 = require("./wax9");
class SensorConnectionManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.SampleRateCharacUuid = "0000000a0008a8bae311f48c90364d99";
        this.StreamCharacUuid = "000000010008a8bae311f48c90364d99";
        this.NotifyCharacUuid = "000000020008a8bae311f48c90364d99";
        noble_1.default.on("stateChange", (state) => {
            if (state === "poweredOn") {
                this.emit("ready");
            }
        });
        noble_1.default.on("discover", (peripheral) => this._discoveredDevice(peripheral));
    }
    startScan() {
        noble_1.default.startScanning([], true, (error) => { console.log(`Error -- ${error}`); });
    }
    stopScan() {
        noble_1.default.stopScanning();
    }
    _discoveredDevice(peripheral) {
        if (!peripheral || !peripheral.advertisement)
            return;
        let name = peripheral.advertisement.localName;
        console.log(name);
        if (name.substr(0, 5) == "WAX9-") {
            peripheral.connect((error) => {
                peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
                    this.emit("discovered", new wax9_1.Wax9(peripheral));
                });
            });
        }
    }
}
exports.SensorConnectionManager = SensorConnectionManager;
//# sourceMappingURL=sensorConnectionManager.js.map
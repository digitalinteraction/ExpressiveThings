import { EventEmitter } from "events";
import noble, { Peripheral } from "noble";
import { Wax9 } from "./wax9";

export class SensorConnectionManager extends EventEmitter {
    SampleRateCharacUuid = "0000000a0008a8bae311f48c90364d99";
    StreamCharacUuid = "000000010008a8bae311f48c90364d99";
    NotifyCharacUuid = "000000020008a8bae311f48c90364d99";

    constructor() {
        super();
        noble.on("stateChange", (state: string) => {
            if (state === "poweredOn") {
                this.emit("ready");
            }
        });
        
        noble.on("discover", (peripheral: Peripheral) => this._discoveredDevice(peripheral));
    }

    startScan() {
        noble.startScanning();
    }

    stopScan() {
        noble.stopScanning();
    }

    _discoveredDevice(peripheral: noble.Peripheral) {
        if (!peripheral || !peripheral.advertisement) return; 
        let name = peripheral.advertisement.localName;
        console.log(name);
        if (name.substr(0, 5) == "WAX9-") {
            peripheral.connect((error) => {
                peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
                    this.emit("discovered", new Wax9(peripheral));
                });
            });
        }
    }
}
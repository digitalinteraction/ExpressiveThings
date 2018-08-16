import { EventEmitter } from "events";
import { Peripheral } from "noble";
import { Wax9 } from "./wax9";

export class SensorConnectionManager extends EventEmitter {
    SampleRateCharacUuid = "0000000a0008a8bae311f48c90364d99";
    StreamCharacUuid = "000000010008a8bae311f48c90364d99";
    NotifyCharacUuid = "000000020008a8bae311f48c90364d99";

    constructor() {
        super();
        noble.on("stateChange", (state: string) => {
            console.log(`NOBLE: State - ${state}`);
            if (state === "poweredOn") {
                console.log("NOBLE: Started scanning...");
                this.emit("ready");
            }
        });
        
        noble.on("discover", this._discoveredDevice);
    }

    startScan() {
        noble.startScanning();
    }

    stopScan() {
        noble.stopScan();
    }

    _discoveredDevice(peripheral: Peripheral) {
        if (!peripheral || !peripheral.advertisement) return; 
        let name = peripheral.advertisement.localName;
        console.log(`NOBLE: Found - ${name}.`);
        if (name.substr(0, 5) == "WAX9-") {
            console.log(`NOBLE: Connecting to ${name}...`);
            peripheral.connect((error) => {
                console.log(`NOBLE: Connected - ${name}.`);
                console.log(`NOBLE: Discovering Characteristics - ${name}.`);
                peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
                    console.log(`NOBLE: ${name}, Services: ${services.length}, Characteristics: ${characteristics.length}.`);
                    this.emit("discovered", new Wax9(peripheral, 10));
                });
            });
        }
    }
}
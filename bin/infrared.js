"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const broadlinkjs_1 = require("broadlinkjs");
const events_1 = require("events");
class InfraRed extends events_1.EventEmitter {
    constructor() {
        this.ready = false;
        this.powerOn = 0x00;
        this.powerOff = 0x00;
        this.volumeUp = 0x00;
        this.volumeDown = 0x01;
        let b = new broadlinkjs_1.Broadlink();
        b.on("deviceReady", (dev) => {
            this.broadlink = dev;
            dev.on("rawData", this._processData);
            this.emit("ready");
        });
        b.discover();
    }
    startListening() {
        this.broadlink.enterLearning();
        this.timer = setInterval(() => this.broadlink.checkData(), 1000);
    }
    stopListenting() {
        clearInterval(this.timer);
    }
    sendVolumeUp() {
        this._sendData(this.volumeUp);
    }
    sendVolumeDown() {
        this._sendData(this.volumeDown);
    }
    sendPowerOn() {
        this._sendData(this.powerOn);
    }
    sendPowerOff() {
        this._sendData(this.powerOff);
    }
    _sendData(data) {
        this.broadlink.sendData(data);
    }
    _processData(data) {
        console.log(`IR RECEIVED -- ${data}`);
        switch (data) {
            case this.volumeUp:
                this.emit("volumeUp");
                break;
            case this.volumeDown:
                this.emit("volumeDown");
                break;
            case this.powerOn:
                this.emit("powerOn");
                break;
            case this.powerOff:
                this.emit("powerOff");
                break;
        }
    }
}
exports.InfraRed = InfraRed;
//# sourceMappingURL=infrared.js.map
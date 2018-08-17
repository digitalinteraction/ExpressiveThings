import Broadlink from "broadlinkjs";
import { EventEmitter } from "events";

export class InfraRed extends EventEmitter {
    broadlink:Broadlink.RM2;
    timer: NodeJS.Timer;

    powerOn = 0x00;
    powerOff = 0x00;
    volumeUp = 0x00;
    volumeDown = 0x01;

    constructor() {
        super();
        let b = new Broadlink();

        b.on("deviceReady", (dev: Broadlink.RM2) => 
        {
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
        this._sendData(Buffer.from([this.volumeUp]));
    }
    
    sendVolumeDown() {
        this._sendData(Buffer.from([this.volumeDown]));
    }

    sendPowerOn() {
        this._sendData(Buffer.from([this.powerOn]));
    }

    sendPowerOff() {
        this._sendData(Buffer.from([this.powerOff]));
    }

    _sendData(data: Buffer) {
        this.broadlink.sendData(data);
    }

    _processData(data: Buffer) {
        console.log(`IR RECEIVED -- ${data}`);
        switch (data[0]) {
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
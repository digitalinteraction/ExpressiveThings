import Broadlink from "broadlinkjs";
import { EventEmitter } from "events";

export class InfraRed extends EventEmitter {
    broadlink:Broadlink.RM2;
    timer: NodeJS.Timer;

    powerOn = 0x26008c009693143514361336141114111312131213121336133713361411131213121312131114111337131213111411131213121312133613121337133613371336143613371300060195931336143613371312131114111312131213361436133614111411131213121312131114361312131213111411131213121336141113371336143613361436143613000d05000000000000000000000000;
    powerOff = 0x26008c009693143514361336141114111312131213121336133713361411131213121312131114111337131213111411131213121312133613121337133613371336143613371300060195931336143613371312131114111312131213361436133614111411131213121312131114361312131213111411131213121336141113371336143613361436143613000d05000000000000000000000000;
    volumeUp = 0x2600d200949412371337113912131213111312131114113911381238111412131014111411141139113812381114111311141114111411141113111411391138123811391138110006039396113812381138111411141114111411131139113911381114111411141113111411391138123812131114111311141114111412131113113912381138113911381100060393961138113912351314111412131114111311391139113811141114121311131213123812371139111411141113111411141114111410141139113911381238113811000d05000000000000;
    volumeDown = 0x26008c009593133713361436131213121311141113121337133613371312131114111312131213361436131213361411131213121312131114111337131213361337133614361300060195931337133614361312131213111411131213371336133713121311141113121312133614361312133614111312131213121311141113371312133613371336143613000d05000000000000000000000000;

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
        console.log(this.broadlink);
        this.broadlink.sendData(data);
        console.log(`IR RECEIVED -- ${data.toString("hex")}`);
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
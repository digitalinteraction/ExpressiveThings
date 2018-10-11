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
const poseRecognizer_1 = require("./poseRecognizer");
class ExpressiveThings {
    constructor(wax9, ir, lightManager, alexa) {
        this.swirlThreshold = 15000;
        this.wax9 = wax9;
        this.ir = ir;
        this.lightManager = lightManager;
        this.alexa = alexa;
        this.swirlReady = false;
        this.focussedLights = [];
        this.irFocussed = false;
        this._setupLights();
        this._setupAlexaListeners();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.lightManager.startMonitoring();
        });
    }
    _setupLights() {
        this.lightManager.on("reachable", (light) => {
            if (this.swirlReady && (new Date().getTime() - this.wax9.lastSwirl.getTime()) < this.swirlThreshold) {
                this.swirlReady = false;
                this.lightManager.turnOnGroupForLight(light);
                this.ir.sendPowerOn();
            }
            else if (!this.irFocussed && this.focussedLights.length == 0) {
                this.focussedLights.push(light);
            }
        });
        this.lightManager.on("unreachable", (light) => {
            if (this.swirlReady && (new Date().getTime() - this.wax9.lastSwirl.getTime()) < this.swirlThreshold) {
                this.swirlReady = false;
                this.lightManager.turnOffGroupForLight(light);
                this.ir.sendPowerOff();
            }
        });
    }
    _setupWax9Listeners() {
        this.wax9.on("swirl", () => this.swirlReady = true);
        this.wax9.on("poseChanged", (pose) => {
            if (pose == poseRecognizer_1.PoseEnum.DOWN) {
                this.focussedLights = [];
                this.irFocussed = false;
            }
        });
        this.wax9.on("data", (data) => {
            if (this.focussedLights.length > 0) {
                if (this.wax9.currentPose == poseRecognizer_1.PoseEnum.MIDDLE) {
                    this.focussedLights.forEach((light) => {
                        let currentBrightness = light.brightness;
                        currentBrightness += data.gyro.x / 10.0;
                        currentBrightness = Math.min(Math.max(currentBrightness, 0), 100);
                        light.changeBrightness(currentBrightness);
                    });
                }
            }
            else if (this.irFocussed) {
                if (this.wax9.currentPose == poseRecognizer_1.PoseEnum.MIDDLE) {
                    if (data.gyro.x > 10) {
                        this.ir.sendVolumeUp();
                        this._setTimeout(5000, () => {
                            this.irFocussed = false;
                        });
                    }
                    else if (data.gyro.x < -10) {
                        this.ir.sendVolumeDown();
                        this._setTimeout(5000, () => {
                            this.irFocussed = false;
                        });
                    }
                }
            }
        });
    }
    _setupAlexaListeners() {
        this.alexa.on("lightBrightness", (room) => __awaiter(this, void 0, void 0, function* () {
            let group = this.lightManager.groups.find(g => g.name.toLowerCase() == room.toLowerCase());
            let lights = yield this.lightManager.getLights();
            this.focussedLights = lights.filter(l => group.lights.findIndex(gl => gl == l.id) != -1);
        }));
        this.alexa.on("tvVolume", () => {
            this.irFocussed = true;
            this._setTimeout(5000, () => {
                this.irFocussed = false;
            });
        });
    }
    _setTimeout(duration, callback) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(callback, duration);
    }
}
exports.ExpressiveThings = ExpressiveThings;
//# sourceMappingURL=expressiveThings.js.map
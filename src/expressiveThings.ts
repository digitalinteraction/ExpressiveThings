import { Wax9 } from "./wax9";
import { InfraRed } from "./infrared";
import { ILightManager, ILight } from "./interfaces";
import { PoseEnum } from "./poseRecognizer";
import { Wax9Data } from "./wax9Data";
import { Alexa } from "./alexa";

export class ExpressiveThings {
    wax9: Wax9;
    ir: InfraRed;
    lightManager: ILightManager;
    alexa: Alexa;

    swirlThreshold = 15000;
    swirlReady: boolean;

    focussedLights: ILight[];

    irFocussed: boolean;

    timeout: NodeJS.Timer;

    constructor(wax9: Wax9, ir: InfraRed, lightManager: ILightManager, alexa: Alexa) {
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

    async start() {
        await this.lightManager.startMonitoring();
    }

    _setupLights() {
        this.lightManager.on("reachable", (light: ILight) => {
            if (this.swirlReady && (new Date().getTime() - this.wax9.lastSwirl.getTime()) < this.swirlThreshold) {
                this.swirlReady = false;
                this.lightManager.turnOnGroupForLight(light);
                this.ir.sendPowerOn();
            } else if (!this.irFocussed && this.focussedLights.length == 0) {
                this.focussedLights.push(light);
            }
        });

        this.lightManager.on("unreachable", (light: ILight) => {
            if (this.swirlReady && (new Date().getTime() - this.wax9.lastSwirl.getTime()) < this.swirlThreshold) {
                this.swirlReady = false;
                this.lightManager.turnOffGroupForLight(light);
                this.ir.sendPowerOff();
            }
        });
    }

    _setupWax9Listeners() {
        this.wax9.on("swirl", () => this.swirlReady = true);

        this.wax9.on("poseChanged", (pose:PoseEnum) => {
            if (pose == PoseEnum.DOWN) {
                this.focussedLights = [];
                this.irFocussed = false;
            }
        });

        this.wax9.on("data", (data:Wax9Data) => {
            if (this.focussedLights.length > 0) {
                if (this.wax9.currentPose == PoseEnum.MIDDLE) {
                    this.focussedLights.forEach((light) => {
                        let currentBrightness = light.brightness;
                        currentBrightness += data.gyro.x / 10.0;
                        currentBrightness = Math.min(Math.max(currentBrightness,0),100);
                        light.changeBrightness(currentBrightness);
                    });
                }
            } else if (this.irFocussed) {
                if (this.wax9.currentPose == PoseEnum.MIDDLE) {
                    if (data.gyro.x > 10) {
                        this.ir.sendVolumeUp();
                        this._setTimeout(5000, () => {
                            this.irFocussed = false;
                        });
                    } else if (data.gyro.x < -10) {
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
        this.alexa.on("lightBrightness", async (room: string) => {
            let group = this.lightManager.groups.find(g => g.name.toLowerCase() == room.toLowerCase());
            let lights = await this.lightManager.getLights();
            this.focussedLights = lights.filter(l => group.lights.findIndex(gl => gl == l.id) != -1);
        });

        this.alexa.on("tvVolume", () => {
            this.irFocussed = true;
            this._setTimeout(5000, () => {
                this.irFocussed = false;
            });
        });
    }

    _setTimeout(duration: number, callback: () => void) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(callback, duration);
    }
}
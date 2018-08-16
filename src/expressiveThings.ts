import { Wax9 } from "./wax9";
import { InfraRed } from "./infrared";
import { ILightManager, ILight } from "./interfaces";
import { PoseEnum } from "./poseRecognizer";
import { Wax9Data } from "./wax9Data";

export class ExpressiveThings {
    wax9: Wax9;
    ir: InfraRed;
    lightManager: ILightManager;

    swirlThreshold = 15000;
    swirlReady: boolean;

    focussedLight: ILight;

    irFocussed: boolean;

    constructor(wax9: Wax9, ir: InfraRed, lightManager: ILightManager) {
        this.wax9 = wax9;
        this.ir = ir;
        this.lightManager = lightManager;

        this.swirlReady = false;
        this.focussedLight = undefined;
        this.irFocussed = false;

        this._setupLights();
        this._setupIRListeners();
    }

    async start() {
        await this.lightManager.startMonitoring();
        await this.ir.startListening();
    }

    _setupLights() {
        this.lightManager.on("reachable", light => {
            if (this.swirlReady && (new Date().getTime() - this.wax9.lastSwirl.getTime()) < this.swirlThreshold) {
                this.swirlReady = false;
                this.lightManager.turnOnGroupForLight(light);
                this.ir.sendPowerOn();
            } else if (!this.irFocussed && !this.focussedLight) {
                this.focussedLight = light;
            }
        });

        this.lightManager.on("unreachable", light => {
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
                this.focussedLight = undefined;
                this.irFocussed = false;
            }
        });

        this.wax9.on("data", (data:Wax9Data) => {
            if (this.focussedLight) {
                if (this.wax9.currentPose == PoseEnum.MIDDLE) {
                    let currentBrightness = this.focussedLight.brightness;
                    currentBrightness += data.gyro.x / 10.0;
                    currentBrightness = Math.min(Math.max(currentBrightness,0),100);
                    this.focussedLight.changeBrightness(currentBrightness);
                }
            } else if (this.irFocussed) {
                if (this.wax9.currentPose == PoseEnum.MIDDLE) {
                    if (data.gyro.x > 10) {
                        this.ir.sendVolumeUp();
                    } else if (data.gyro.x < -10) {
                        this.ir.sendVolumeDown();
                    }
                }
            }
        });
    }

    _setupIRListeners() {
        
    }
}
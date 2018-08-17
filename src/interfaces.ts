import { EventEmitter } from "events";

export interface ILightManager extends EventEmitter {
    groups: ILightGroup[];
    
    startMonitoring() : void;
    stopMonitoring() :void;

    getLights() : Promise<ILight[]>;
    turnOnGroupForLight(light: ILight) : Promise<void>;
    turnOffGroupForLight(light: ILight) : Promise<void>;
}

export interface ILightGroup {
    id: string;
    name: string;
    lights: string[];
}

export interface ILight {
    id: string;
    reachable: boolean;
    brightness: number;
    colorTemperature: number;

    changeBrightness(brightness: number) : Promise<void>;
    changeColorTemperature(ct: number) : Promise<void>;
}

export interface ITimedData {
    timestamp: Date;
} 
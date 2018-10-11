import { EventEmitter } from "events";
import { HueApi, ILight, lightState, ILightGroup, nupnpSearch } from "node-hue-api";
import { ILightManager, ILight as IGenericLight, ILightGroup as IGenericLightGroup } from "./interfaces";

const hueUsername = "Tgveo90GWykzOptr3HaPfkbE0tMRr762aXVjLzxP";

export class HueManager extends EventEmitter implements ILightManager {
    client: HueApi;
    lightTimer: NodeJS.Timer;

    groups: IGenericLightGroup[];
    lastLights: HueLight[];

    lightStatusInterval = 500;

    constructor() {
        super();
        this.client = new HueApi("10.0.0.254", hueUsername);

        this.getGroups().then((groups) => {
            this.groups = groups;
        });
    }

    async getLights() : Promise<HueLight[]> {
        let lights = await this.client.getLights();
        return lights.lights.map((light) => new HueLight(this.client, light));
    }

    async getGroups() : Promise<HueLightGroup[]> {
        let groups = await this.client.getAllGroups();
        return groups.map(g => new HueLightGroup(g));
    }

    startMonitoring() {
        this.stopMonitoring();
        this.lightTimer = setInterval(this._checkLightStatus, this.lightStatusInterval);
    }

    stopMonitoring() {
        clearInterval(this.lightTimer);
    }

    async turnOnGroupForLight(light: HueLight) {
        let group = this.groups.find(g => g.lights.findIndex(l => l == light.id) != -1);
        await this.client.setGroupLightState(group.id, lightState.create().on());
    }

    async turnOffGroupForLight(light: HueLight) {
        let group = this.groups.find(g => g.lights.findIndex(l => l == light.id) != -1);
        await this.client.setGroupLightState(group.id, lightState.create().off());
    }

    async _checkLightStatus() {
        let newLights = await this.getLights();

        newLights.forEach(l => {
            let current = this.lastLights.find((ll) => { return ll.id == l.id });

            if (current.reachable != l.reachable && l.reachable) {
                this.emit("reachable", l);
            } else if (current.reachable != l.reachable && !l.reachable) {
                this.emit("unreachable", l);
            }
        });

        this.lastLights = newLights;
        this.groups = await this.getGroups();
    }
}

export class HueLightGroup implements IGenericLightGroup {
    id: string;
    name: string;
    lights: string[];

    constructor(group: ILightGroup) {
        this.id = group.id;
        this.name = group.name;
        this.lights = group.lights;
    }
}
 
export class HueLight implements IGenericLight {
    client: HueApi;
    light: ILight;

    id: string;
    reachable: boolean;
    brightness: number;
    colorTemperature: number;

    constructor(client: HueApi, light: ILight) {
        this.client = client;
        this.light = light;

        this.id = light.uniqueid;
        this.reachable = light.state.reachable;
        this.brightness = light.state.bri;
    }

    async changeBrightness(brightness: number) {
        let state = lightState.create().brightness(brightness);
        await this.client.setLightState(this.id, state);
        this.brightness = brightness;
    }

    async changeColorTemperature(ct: number) {
        let r = 500 - 155;
	    let value = Math.round(ct / 100.0 * r) + 155;
        await this.client.setLightState(this.id, lightState.create().colorTemperature(value));
        this.colorTemperature = value;
    }
}
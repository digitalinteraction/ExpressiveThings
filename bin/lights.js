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
const events_1 = require("events");
const node_hue_api_1 = require("node-hue-api");
const hueUsername = "Tgveo90GWykzOptr3HaPfkbE0tMRr762aXVjLzxP";
class HueManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.lightStatusInterval = 500;
        this.client = new node_hue_api_1.HueApi("10.0.0.254", hueUsername);
        this.getGroups().then((groups) => {
            this.groups = groups;
        });
    }
    getLights() {
        return __awaiter(this, void 0, void 0, function* () {
            let lights = yield this.client.getLights();
            return lights.lights.map((light) => new HueLight(this.client, light));
        });
    }
    getGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            let groups = yield this.client.getAllGroups();
            return groups.map(g => new HueLightGroup(g));
        });
    }
    startMonitoring() {
        this.stopMonitoring();
        this.lightTimer = setInterval(this._checkLightStatus, this.lightStatusInterval);
    }
    stopMonitoring() {
        clearInterval(this.lightTimer);
    }
    turnOnGroupForLight(light) {
        return __awaiter(this, void 0, void 0, function* () {
            let group = this.groups.find(g => g.lights.findIndex(l => l == light.id) != -1);
            yield this.client.setGroupLightState(group.id, node_hue_api_1.lightState.create().on());
        });
    }
    turnOffGroupForLight(light) {
        return __awaiter(this, void 0, void 0, function* () {
            let group = this.groups.find(g => g.lights.findIndex(l => l == light.id) != -1);
            yield this.client.setGroupLightState(group.id, node_hue_api_1.lightState.create().off());
        });
    }
    _checkLightStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let newLights = yield this.getLights();
            newLights.forEach(l => {
                let current = this.lastLights.find((ll) => { return ll.id == l.id; });
                if (current.reachable != l.reachable && l.reachable) {
                    this.emit("reachable", l);
                }
                else if (current.reachable != l.reachable && !l.reachable) {
                    this.emit("unreachable", l);
                }
            });
            this.lastLights = newLights;
            this.groups = yield this.getGroups();
        });
    }
}
exports.HueManager = HueManager;
class HueLightGroup {
    constructor(group) {
        this.id = group.id;
        this.name = group.name;
        this.lights = group.lights;
    }
}
exports.HueLightGroup = HueLightGroup;
class HueLight {
    constructor(client, light) {
        this.client = client;
        this.light = light;
        this.id = light.uniqueid;
        this.reachable = light.state.reachable;
        this.brightness = light.state.bri;
    }
    changeBrightness(brightness) {
        return __awaiter(this, void 0, void 0, function* () {
            let state = node_hue_api_1.lightState.create().brightness(brightness);
            yield this.client.setLightState(this.id, state);
            this.brightness = brightness;
        });
    }
    changeColorTemperature(ct) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = 500 - 155;
            let value = Math.round(ct / 100.0 * r) + 155;
            yield this.client.setLightState(this.id, node_hue_api_1.lightState.create().colorTemperature(value));
            this.colorTemperature = value;
        });
    }
}
exports.HueLight = HueLight;
//# sourceMappingURL=lights.js.map
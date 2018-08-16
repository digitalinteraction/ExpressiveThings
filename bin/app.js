var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const noble = require("noble");
const lifx = require("node-lifx");
const huejay = require("huejay");
const alexa = require("alexa-sdk");
const fs = require("fs");
const DataCache = require("./dataCache.js");
const Wax9Processor = require("./wax9Processor.js");
const Wax9 = require("./wax9.js");
const PoseRecognizer = require("./poseRecognizer.js");
const SwirlReognizer = require("./swirlRecognizer.js");
const SampleRateCharacUuid = "0000000a0008a8bae311f48c90364d99";
const StreamCharacUuid = "000000010008a8bae311f48c90364d99";
const NotifyCharacUuid = "000000020008a8bae311f48c90364d99";
const Config = {
    lightStateInterval: 500,
    upModeLowerThreshold: 0.3,
    neutralModeUpperThreshold: 0.1,
    neutralModeLowerThreshold: -0.4,
    downModeUpperThreshold: -0.6
};
let hueUsername = "9h6bo-KJwgCZ59Huwidt2LDp2S0zGDaFvfxj4YAr";
let currentHueClient;
let focussedLight;
let lastTwirl;
let lightUpdate = (brightness) => { };
noble.on("stateChange", (state) => {
    console.log(`NOBLE: State - ${state}`);
    if (state === "poweredOn") {
        console.log("NOBLE: Started scanning...");
        noble.startScanning();
    }
});
noble.on("discover", (peripheral) => {
    if (!peripheral || !peripheral.advertisement)
        return;
    let name = peripheral.advertisement.localName;
    console.log(`NOBLE: Found - ${name}.`);
    if (name == "WAX9-0A27") {
        console.log(`NOBLE: Connecting to ${name}...`);
        peripheral.connect((error) => {
            console.log(`NOBLE: Connected - ${name}.`);
            console.log(`NOBLE: Discovering Characteristics - ${name}.`);
            peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
                console.log(`NOBLE: ${name}, Services: ${services.length}, Characteristics: ${characteristics.length}.`);
                setupWaxStream(peripheral, services, characteristics);
            });
        });
    }
});
function setupWaxStream(peripheral, services, characteristics) {
    let sampleRateCharac = characteristics.find((charac) => { return charac.uuid === SampleRateCharacUuid; });
    let notifyCharac = characteristics.find((charac) => { return charac.uuid === NotifyCharacUuid; });
    let streamCharac = characteristics.find((charac) => { return charac.uuid === StreamCharacUuid; });
    sampleRateCharac.write(Buffer.from([10]), false);
    notifyCharac.subscribe();
    streamCharac.write(Buffer.from([1]));
    let dataCache = new DataCache(100);
    let processor = new Wax9Processor(10);
    let poseRecognizer = new PoseRecognizer(dataCache);
    let swirlRecognizer = new SwirlReognizer(dataCache, poseRecognizer, 100);
    let pose = 1;
    poseRecognizer.on("stateChanged", ((state) => {
        pose = state;
        if (state == 2) {
            focussedLight = undefined;
        }
    }).bind(this));
    swirlRecognizer.on("twirl", (() => {
        console.log("ET: TWIRL");
        lastTwirl = new Date();
    }).bind(this));
    let currentBrightness = 50;
    let currentColorTemp = 50;
    notifyCharac.on("data", (data) => {
        let pd = processor.updateFromBytes(data);
        dataCache.add(pd);
        if (focussedLight) {
            if (pose == 1) {
                currentBrightness += pd.gyro.x / 10.0;
                currentBrightness = Math.min(Math.max(currentBrightness, 0), 100);
                updateHueBrightness(currentHueClient, focussedLight, currentBrightness);
            }
        }
    });
    console.log(`NOBLE: ${peripheral.advertisement.localName} - Connected and Streaming!!`);
}
function startLifx() {
    const lifxClient = new LifxClient();
    lightUpdate = (brightness) => {
        focussedLight.color();
    };
    lifxClient.on("light-new", (light) => {
        console.log("LIFX: New light seen.");
        lights.push(light);
    });
    lifxClient.on("light-online", (light) => {
        console.log("LIFX: Light switched on, now focussed.");
        light.getState((error, data) => {
            currentAngle = data.color.brightness;
            focussedLight = light;
        });
    });
    console.log("LIFX: Starting client...");
    lifxClient.init();
}
function updateLifxBrightness(light, brightness) {
    light.color(180, 50, brightness, 2500);
}
function startHue() {
    return __awaiter(this, void 0, void 0, function* () {
        // Finding Bridges
        console.log("HUE: Starting client...");
        console.log("HUE: Discovering bridges...");
        let bridges = yield huejay.discover();
        console.log(`HUE: Discovered ${bridges.length} bridges.`);
        // Auth with all bridges
        for (let b of bridges) {
            console.log(`HUE: Connecting to: ${b}`);
            let client = new huejay.Client({
                host: b.ip
            });
            if (hueUsername === undefined) {
                let user = new client.users.User;
                user.deviceType = "expressy";
                console.log(`HUE: Auth with: ${b}`);
                user = yield client.users.create(user);
                console.log(`HUE: USERNAME '${user.username}' (SAVE FOR LATER)`);
                hueUsername = user.username;
            }
            client.username = hueUsername;
            let lights = yield client.lights.getAll();
            // Get all lights
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                let newLights = yield client.lights.getAll();
                for (l of newLights) {
                    let current = lights.find((element) => { return element.uniqueId == l.uniqueId; });
                    if (current.reachable != l.reachable && l.reachable) {
                        console.log("NEW REACHABLE");
                        console.log((new Date() - lastTwirl));
                        if (lastTwirl && (new Date() - lastTwirl) < 15000) {
                            lastTwirl = undefined;
                            let g = (yield client.groups.getAll()).find((g) => { return g.lightIds.includes(l.id); });
                            turnOnHueRoomLights(client, g);
                        }
                        else {
                            console.log(`LIGHT FOCUSSED: ${l.name}`);
                            currentHueClient = client;
                            focussedLight = l;
                        }
                    }
                    else if (current.reachable != l.reachable && !l.reachable) {
                        console.log("NEW UNREACHABLE");
                        if (lastTwirl && (new Date() - lastTwirl) < 30000) {
                            lastTwirl = undefined;
                            let g = (yield client.groups.getAll()).find((g) => { return g.lightIds.includes(l.id); });
                            turnOffHueRoomLights(client, g);
                        }
                    }
                }
                lights = newLights;
            }), Config.lightStateInterval);
        }
    });
}
function updateHueBrightness(client, light, brightness) {
    light.brightness = Math.round(brightness / 100.0 * 255.0);
    client.lights.save(light);
}
function updateHueColorTemp(client, light, ct) {
    let r = 500 - 155;
    light.colorTemp = Math.round(ct / 100.0 * r) + 155;
    client.lights.save(light);
}
function turnOnHueRoomLights(client, group) {
    console.log("HUE: TURNING GROUP ON");
    group.on = true;
    client.groups.save(group);
}
function turnOffHueRoomLights(client, group) {
    console.log("HUE: TURNING GROUP OFF");
    group.on = false;
    client.groups.save(group);
}
startHue();
//# sourceMappingURL=app.js.map
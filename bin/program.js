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
const infrared_1 = require("./infrared");
const sensorConnectionManager_1 = require("./sensorConnectionManager");
const lights_1 = require("./lights");
const expressiveThings_1 = require("./expressiveThings");
const alexa_1 = require("./alexa");
let sensorReady = false;
let irReady = false;
const sensors = new Array();
const sensorManager = new sensorConnectionManager_1.SensorConnectionManager();
sensorManager.on("ready", () => {
    sensorManager.startScan();
});
sensorManager.on("discover", (device) => __awaiter(this, void 0, void 0, function* () {
    yield device.connect();
    sensors.push(device);
    sensorReady = true;
    console.log("WAX9 CONNECTED!");
}));
const ir = new infrared_1.InfraRed();
ir.on("ready", () => {
    irReady = true;
    console.log("IR BLASTER CONNECTED!");
    ir.startListening();
});
const lightManager = new lights_1.HueManager();
const alexaApp = new alexa_1.Alexa();
function checkReady() {
    setTimeout(() => {
        if (sensorReady && irReady) {
            const program = new expressiveThings_1.ExpressiveThings(sensors[0], ir, lightManager, alexaApp);
            program.start();
        }
        else {
            checkReady();
        }
    }, 1000);
}
checkReady();
//# sourceMappingURL=program.js.map
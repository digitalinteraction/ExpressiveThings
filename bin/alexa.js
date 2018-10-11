"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const alexa_app_1 = require("alexa-app");
const events_1 = require("events");
const express_1 = __importDefault(require("express"));
class Alexa extends events_1.EventEmitter {
    constructor() {
        super();
        this.express = express_1.default();
        this._setupApp();
    }
    _setupApp() {
        this.alexaApp = new alexa_app_1.app("ExpressiveThings");
        this.alexaApp.intent("ControlLightBrightness", {
            "slots": { "room": "AMAZON.Room" }
        }, (request, response) => {
            var room = request.slot("room");
            this.emit("lightBrightness", room);
        });
        this.alexaApp.intent("ControlLightColour", {
            "slots": { "room": "AMAZON.Room" }
        }, (request, response) => {
            var room = request.slot("room");
            this.emit("lightColor", room);
        });
        this.alexaApp.intent("ControlTVVolume", {}, (request, response) => {
            this.emit("tvVolume");
        });
        this.alexaApp.intent("ControlMusicVolume", {}, (request, response) => {
            this.emit("musicVolume");
        });
        this.alexaApp.express({ expressApp: this.express });
    }
}
exports.Alexa = Alexa;
//# sourceMappingURL=alexa.js.map
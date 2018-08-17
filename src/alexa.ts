import { app } from "alexa-app";
import { EventEmitter } from "events";
import Express, { Application } from "express";

export class Alexa extends EventEmitter {
    alexaApp: app;
    express: Application;

    constructor() {
        super();
        this._setupApp();

        this.express = Express();
    }

    _setupApp() {
        this.alexaApp = new app("ExpressiveThings");

        this.alexaApp.intent("ControlLightBrightness", {
                "slots": { "room": "AMAZON.Room" }
            },
            function(request, response) {
                var room = request.slot("room");
                this.emit("lightBrightness", room);
            }
        );

        this.alexaApp.intent("ControlLightColour", {
                "slots": { "room": "AMAZON.Room" }
            },
            (request, response) => {
                var room = request.slot("room");
                this.emit("lightColor", room);
            }
        );

        this.alexaApp.intent("ControlTVVolume", {},
            (request, response) => {
                this.emit("tvVolume");
            }
        );

        this.alexaApp.intent("ControlMusicVolume", {},
            (request, response) => {
                this.emit("musicVolume");
            }
        );

        this.alexaApp.express({ expressApp: this.express });
    }
}
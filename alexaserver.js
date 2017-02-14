const alexaAppServer = require("alexa-app-server");

let server = new alexaAppServer({ port: 80, debug: false });
server.start();

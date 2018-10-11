import { InfraRed } from "./infrared";
import { SensorConnectionManager } from "./sensorConnectionManager";
import { Wax9 } from "./wax9";
import { HueManager } from "./lights";
import { ExpressiveThings } from "./expressiveThings";
import { Alexa } from "./alexa";

let sensorReady = false;
let irReady = false;

const sensors = new Array<Wax9>();
const sensorManager = new SensorConnectionManager();

sensorManager.on("ready", () => {
    sensorManager.startScan();
});

sensorManager.on("discover", async (device: Wax9) => {
    await device.connect();
    sensors.push(device);

    sensorReady = true;

    console.log("WAX9 CONNECTED!");
});

const ir = new InfraRed();
ir.on("ready", () => 
{
    irReady = true;
    console.log("IR BLASTER CONNECTED!");
    ir.startListening();
});

const lightManager = new HueManager();
const alexaApp = new Alexa();

function checkReady() {
    setTimeout(() => {
        if (sensorReady && irReady)
        {
            const program = new ExpressiveThings(sensors[0], ir, lightManager, alexaApp);

            program.start();
        } else {
            checkReady();
        }
    }, 1000);
}

checkReady();
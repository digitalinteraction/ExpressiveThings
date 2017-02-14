const noble = require("noble");
const lifx = require("node-lifx");
const hue = require("philips-hue");
const alexa = require("alexa-sdk");

const LifxClient = lifx.Client;

const AccNorm = 1.0 / 4096.0
const GyroNorm = 0.07
const MagNorm = 0.1

const SampleRateCharacUuid = "0000000a0008a8bae311f48c90364d99"
const StreamCharacUuid = "000000010008a8bae311f48c90364d99"
const NotifyCharacUuid = "000000020008a8bae311f48c90364d99"

var lights = [];
var focussedLight;

var currentAngle = 0;

noble.on("stateChange", (state) => {
	console.log(`NOBLE: State - ${state}`);
	if (state === "poweredOn") {
		console.log("NOBLE: Started scanning...");
		noble.startScanning();
	}
});

noble.on("discover", (peripheral) => {
	if (!peripheral || !peripheral.advertisement) return; 
	let name = peripheral.advertisement.localName;
	console.log(`NOBLE: Found - ${name}.`)
	if (name == "WAX9-0983") {
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
	let sampleRateCharac = characteristics.find((charac) =>  { return charac.uuid === SampleRateCharacUuid });
	let notifyCharac = characteristics.find((charac) => { return charac.uuid === NotifyCharacUuid });
	let streamCharac = characteristics.find((charac) => { return charac.uuid === StreamCharacUuid });

	sampleRateCharac.write(Buffer.from([10]), false);
	notifyCharac.subscribe();
	streamCharac.write(Buffer.from([1]));

	notifyCharac.on("data", (data) => {
		processWaxData(data);
	});

	console.log(`NOBLE: ${peripheral.advertisement.localName} - Connected and Streaming!!`);
}

function processWaxData(data) {
	let ax = data.readInt16LE(2) * AccNorm;
	let ay = data.readInt16LE(4) * AccNorm;
	let az = data.readInt16LE(6) * AccNorm;

	let gx = data.readInt16LE( 8) * GyroNorm;
	let gy = data.readInt16LE(10) * GyroNorm;
	let gz = data.readInt16LE(12) * GyroNorm;

	let mx = data.readInt16LE(14) * MagNorm;
	let my = data.readInt16LE(16) * MagNorm;
	let mz = data.readInt16LE(18) * MagNorm;
	
	if (focussedLight) {
		currentAngle += gx / 8.0;

		currentAngle = Math.min(Math.max(currentAngle,0),100)
		focussedLight.color(180, 50, currentAngle, 2500);
	}
}

const lifxClient = new LifxClient();

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

const hueClient = new hue();

console.log("HUE: Starting client...");
hueClient.getBridges();


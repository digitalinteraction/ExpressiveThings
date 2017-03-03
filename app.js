const noble = require("noble");
const lifx = require("node-lifx");
const huejay = require("huejay");
const alexa = require("alexa-sdk");
const fs = require("fs");

const wax9 = require("./wax9.js");

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

const Modes = {
	up: 0,
	neutral: 1,
	down: 2
}

let hueUsername = "9h6bo-KJwgCZ59Huwidt2LDp2S0zGDaFvfxj4YAr";
let currentHueClient;
let focussedLight;
let currentMode = Modes.neutral;

let lightUpdate = (brightness) => {};

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

	let device = new wax9(10);
	let lastAngle = 0;
	let currentBrightness = 50;
	let currentColorTemp = 50;

	notifyCharac.on("data", (data) => {
		device.updateFromBytes(data);

		if (focussedLight) {
			let euler = device.euler;
			let change = lastAngle - euler.z;

			if (currentMode == Modes.neutral) {
				if (euler.y > Config.upModeLowerThreshold) {
					currentMode = Modes.up;
					console.log(`CHANGED MODE: ${currentMode}`);
				} /*else if (euler.y < Config.downModeUpperThreshold) {
					currentMode = Modes.down;
					console.log(`CHANGED MODE: ${currentMode}`);
					focussedLight = undefined;
				}*/ else {
					currentBrightness += change * 20;
					currentBrightness = Math.min(Math.max(currentBrightness,0),100)
					updateHueBrightness(currentHueClient, focussedLight, currentBrightness);
				}
			} else if (currentMode == Modes.up) {
				if (euler.y < Config.neutralModeUpperThreshold) {
					currentMode = Modes.neutral;
					console.log(`CHANGED MODE: ${currentMode}`);
				} else {
					currentColorTemp += change * 20;
					currentColorTemp = Math.min(Math.max(currentColorTemp,0),100)
					updateHueColorTemp(currentHueClient, focussedLight, currentColorTemp);
				}
			}

			lastAngle = euler.z;
		}
	});

	console.log(`NOBLE: ${peripheral.advertisement.localName} - Connected and Streaming!!`);
}

function startLifx() {
	const lifxClient = new LifxClient();

	lightUpdate = (brightness) => {
		focussedLight.color()
	}

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

async function startHue() {
	// Finding Bridges
	console.log("HUE: Starting client...");
	console.log("HUE: Discovering bridges...");
	let bridges = await huejay.discover();
	console.log(`HUE: Discovered ${bridges.length} bridges.`);

	// Auth with all bridges
	for (let b of bridges) {
		console.log(`HUE: Connecting to: ${b}`);
		let client  = new huejay.Client({
			host: b.ip
		});

		if (hueUsername === undefined) {
			let user = new client.users.User;
			user.deviceType = "expressy";

			console.log(`HUE: Auth with: ${b}`);
			user = await client.users.create(user);
			console.log(`HUE: USERNAME '${user.username}' (SAVE FOR LATER)`);
			hueUsername = user.username;
		}

		client.username = hueUsername;

		let lights = await client.lights.getAll();

		// Get all lights
		setInterval(async () => {
			let newLights = await client.lights.getAll();
			for (l of newLights) {
				let current = lights.find((element) => { return element.uniqueId == l.uniqueId });

				if (current.reachable != l.reachable && l.reachable) {
					console.log(`LIGHT FOCUSSED: ${l.name}`);
					currentHueClient = client;
					focussedLight = l;
				}
			}

			lights = newLights;
		}, Config.lightStateInterval);
	}
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

startHue();

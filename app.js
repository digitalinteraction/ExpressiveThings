const noble = require("noble");
const lifx = require("node-lifx");

const LifxClient = lifx.Client;

const AccNorm = 4096.0
const GyroNorm = 0.07
const MagNorm = 0.1

const SampleRateServiceUuid = "00000005-0008-A8BA-E311-F48C90364D99"
const ReadServiceUuid = "00000000-0008-A8BA-E311-F48C90364D99"

const SampleRateCharacUuid = "0000000A-0008-A8BA-E311-F48C90364D99"
const StreamCharacUuid = "00000001-0008-A8BA-E311-F48C90364D99"
const NotifyCharacUuid = "00000002-0008-A8BA-E311-F48C90364D99"

noble.on("stateChange", (state) => {
	console.log(`NOBLE: State - ${state}`);
	if (state === "poweredOn") {
		console.log("NOBLE: Started scanning...");
		noble.startScanning();
	}
});

noble.on("discover", (peripheral) => {
	if (!peripheral || !peripheral.advertisment) return; 
	let name = peripheral.advertisment.localName;
	console.log("NOBLE: Found - ${name}.")
	if (name == "WAX9-0983") {
		console.log(`NOBLE: Connecting to ${name}...`);
		peripheral.connect((error) => {
			console.log(`NOBLE: Connected - ${name}.`);
			console.log(`NOBLE: Discovering Characteristics - ${name}.`);
			peripheral.discoverAllServicesAndCaracteristics((error, services, characteristics) => {
				console.log(`NOBLE: ${name}, Services: ${services.length}, Characteristics: ${characteristics.length}.`);
				setupWaxStream(peripheral, services, characteristics);
			});
		});
	}
});

function setupWaxStream(peripheral, services, characteristics) {
	let sampleRateCharac = characteristic.find((charac) =>  charac.uuid == sampleRateCharacUuid)
	let notifyCharac = characteristic.find((charac) =>  charac.uuid == NotifyCharacUuid)
	let streamCharac = characteristic.find((charac) =>  charac.uuid == StreamCharacUuid)

	sampleRateCharac.write(Buffer.from([50]), false);
	notifyCharac.subscribe();
	streamCharac.write(Buffer.from([1]));

	notifyCharac.on("data", (data) => {
		processWaxData(data);
	});
}

function processWaxData(data) {
	let ax = ((buffer[ 3] << 8) + buffer[ 2]) / AccNorm
	let ay = ((buffer[ 5] << 8) + buffer[ 4]) / AccNorm
	let az = ((buffer[ 7] << 8) + buffer[ 6]) / AccNorm

	let gx = ((buffer[ 9] << 8) + buffer[ 8]) * GyroNorm
	let gy = ((buffer[11] << 8) + buffer[10]) * GyroNorm
	let gz = ((buffer[13] << 8) + buffer[12]) * GyroNorm

	let mx = ((buffer[15] << 8) + buffer[14]) * MagNorm
	let my = ((buffer[17] << 8) + buffer[16]) * MagNorm
	let mz = ((buffer[19] << 8) + buffer[18]) * MagNorm

	console.log(ax, ay, az, gx, gy, gz, mx, my, mz);
}

const lifxClient = new LifxClient();

lifxClient.on("light-new", (light) => {
	light.getState((error, data) => {
		console.log(data);
	});
});

console.log("LIFX: Starting client...");
lifxClient.init();
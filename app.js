const noble = require("noble");

noble.on("stateChange", (state) => {
	if (state == "poweredOn") {
		noble.startScanning();
	}
});

noble.on("discovered", (peripheral) => {
	if (peripheral.advertisment.localName == "WAX9-0983") {
		peripheral.connect((error) => {
			peripheral.discoverAllServicesAndCaracteristics((error, services, characteristics) => {
				setupWaxStream(services, characteristics);
			});
		});
	}
});

function setupWaxStream(

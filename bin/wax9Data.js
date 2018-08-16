"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Wax9Data {
    constructor(sampleNumber, timestamp, acc, gyro, mag, euler, grav, linAcc) {
        this.sampleNumber = sampleNumber;
        this.timestamp = timestamp;
        this.acc = acc;
        this.gyro = gyro;
        this.mag = mag;
        this.euler = euler;
        this.grav = grav;
        this.linAcc = linAcc;
    }
}
exports.Wax9Data = Wax9Data;
//# sourceMappingURL=wax9Data.js.map
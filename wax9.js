class Wax9 {
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

module.exports = Wax9;
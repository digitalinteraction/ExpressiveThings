import { Vector3 } from "./vector";
import { ITimedData } from "./interfaces";

export class Wax9Data implements ITimedData {
    sampleNumber: number;
    timestamp: Date;
    acc: Vector3;
    gyro: Vector3;
    mag: Vector3;
    euler: Vector3;
    grav: Vector3;
    linAcc: Vector3;

    constructor(sampleNumber: number, timestamp: Date, acc: Vector3, gyro: Vector3, mag: Vector3, euler: Vector3, grav: Vector3, linAcc: Vector3) {
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
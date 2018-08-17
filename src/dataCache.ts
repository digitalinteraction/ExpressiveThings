import { EventEmitter } from "events";
import { ITimedData } from "./interfaces";

export class DataCache<T extends ITimedData> extends EventEmitter {
    limit: number;
    cache: T[];

    constructor(limit: number) {
        super();
        this.limit = limit;
        this.cache = new Array<T>(this.limit);
    }

    add(data: T) {
        this.cache.push(data);
        let diff = this.cache.length - this.limit;
        for (let i = 0; i < diff; i++) {
            this.cache.shift();
        }

        this.emit("data", data);
    }

    timeRange(start: Date, end: Date) {
        return this.cache.filter(data => data.timestamp >= start && data.timestamp < end);
    }
}
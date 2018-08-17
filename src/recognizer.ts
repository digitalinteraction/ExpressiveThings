import { EventEmitter } from "events";
import { DataCache } from "./dataCache";
import { ITimedData } from "./interfaces";

export class Recognizer<T extends ITimedData> extends EventEmitter {
    dataCache: DataCache<T>;
    
    constructor(dataCache: DataCache<T>) {
        super();
        this.dataCache = dataCache;
    }
}
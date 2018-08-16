"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const infrared_js_1 = require("./infrared.js");
const state_js_1 = require("./state.js");
const Wax9Processor_js_1 = require("./Wax9Processor.js");
const state = new state_js_1.State();
let ir = new infrared_js_1.InfraRed();
ir.on("ready", () => ir.startListening());
let wax9 = new Wax9Processor_js_1.Wax9Processor();
function setupIRListeners() {
}
//# sourceMappingURL=program.js.map
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TICKS = 16; // ticks per measure
exports.WORKER_URL = '../lib/worker.js';
exports.MEASURE_COUNT = 4;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __webpack_require__(0);
const loop_1 = __webpack_require__(2);
const clock_1 = __webpack_require__(3);
class LoopManager {
    constructor(bpm = 60, measures = 4) {
        this.loops = [];
        this.clock = new clock_1.Clock(bpm, measures);
        this.context = new AudioContext();
        this._bpm = bpm;
        this._measureCount = measures;
    }
    addLoop(name, timing) {
        if (timing <= 0 || timing > this.measureCount * constants_1.TICKS) {
            throw "`timing` is outside the bounds of possible ticks";
        }
        const l = new loop_1.Loop(name, this.context, this.clock, timing);
        this.loops.push(l);
        return l;
    }
    rmLoop(name) {
        this.loops = this.loops.filter(l => l.name !== name);
    }
    set bpm(bpm) {
        this._bpm = bpm;
        this.clock.update(bpm, this.measureCount);
    }
    get bpm() {
        return this._bpm;
    }
    set measureCount(measures) {
        this._measureCount = measures;
        this.clock.update(this.bpm, measures);
    }
    get measureCount() {
        return this._measureCount;
    }
}
exports.LoopManager = LoopManager;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Loop {
    /*
        @param timing The number of ticks of the total MEASURES * 16
    */
    constructor(name, ctx, clk, timing) {
        this.name = name;
        this.context = ctx;
        this.clock = clk;
        this.timing = timing;
    }
}
exports.Loop = Loop;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __webpack_require__(0);
class Clock {
    constructor(bpm, measures) {
        this.worker = new Worker(constants_1.WORKER_URL);
        this.currentTick = 0;
        this.listeners = [];
        this.worker.addEventListener('message', ev => this.tick(ev.data));
        this.bpm = bpm;
        this.measures = measures;
    }
    tick(tickCount) {
        this.currentTick = tickCount;
        const cbs = this.listeners[tickCount];
        if (cbs) {
            cbs.forEach(cb => cb(tickCount));
        }
    }
    update(bpm, measures) {
        if (bpm) {
            this.bpm = bpm;
        }
        if (measures) {
            this.measures = measures;
        }
        this.worker.postMessage({
            bpm: this.bpm,
            measures: this.measures
        });
    }
    start() {
        this.update();
    }
    stop() {
        this.worker.removeEventListener('message');
    }
    /*
        Add the callback for the given tick.
        Returns the index of the the listener;
    */
    addListener(tickCount, callback) {
        if (!this.listeners[tickCount]) {
            this.listeners[tickCount] = [];
        }
        console.log(this.listeners);
        return this.listeners[tickCount].push(callback) - 1;
    }
    /*
        Remove the given index from `listeners`. As returned from `addListener`.
    */
    rmListener(tickCount, index) {
        this.listeners[tickCount].splice(index, 1);
    }
}
exports.Clock = Clock;


/***/ })
/******/ ]);
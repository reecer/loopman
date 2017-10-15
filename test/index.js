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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TICKS = 16; // ticks per measure
exports.WORKER_URL = '../lib/worker.js';


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const loop_1 = __webpack_require__(2);
const clock_1 = __webpack_require__(3);
class LoopManager {
    constructor(bpm = 60) {
        this.loops = [];
        this.clock = new clock_1.Clock(bpm);
        this.context = new AudioContext();
        this._bpm = bpm;
        this.clock.start();
    }
    // TODO: define `timing`
    addLoop(name, counts) {
        const l = new loop_1.Loop(name, this.context, this.clock, counts);
        this.loops.push(l);
        return l;
    }
    rmLoop(name) {
        this.loops = this.loops.filter(l => l.name !== name);
    }
    stop() {
        this.loops.forEach(l => l.stop());
    }
    set bpm(bpm) {
        this._bpm = bpm;
        this.clock.update(bpm);
    }
    get bpm() {
        return this._bpm;
    }
}
exports.LoopManager = LoopManager;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __webpack_require__(0);
const dataChunks_1 = __webpack_require__(5);
class Loop {
    constructor(name, ctx, clk, counts, numChannels = 2) {
        this.isPlaying = false;
        this.isRecording = false;
        this.name = name;
        this.context = ctx;
        this.clock = clk;
        this.duration = counts;
        this.volume = ctx.createGain();
        this.processor = ctx.createScriptProcessor();
        this.data = new dataChunks_1.DataChunks(numChannels);
        this.volume.connect(ctx.destination);
        this.processor.addEventListener('audioprocess', this.recv.bind(this));
    }
    // Pre-recorded audio
    createBuffer(srcPath) {
        throw "TODO";
    }
    // Live input
    createStream() {
        // TODO: polyfill
        return navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
            const source = this.context.createMediaStreamSource(stream);
            source.connect(this.processor);
            return source;
        });
    }
    record(play = true) {
        const START = 1;
        const END = START + this.duration;
        return new Promise((good, bad) => {
            // Start recording at beginning of first measure
            this.clock.listenOnce(START, () => {
                this.isRecording = true;
                this.processor.connect(this.volume);
                // Stop recording at end
                this.clock.listenOnce(END, () => {
                    if (!this.isRecording) {
                        // Stopped while recording
                        return bad();
                    }
                    this.isRecording = false;
                    this.processor.disconnect(this.volume);
                    this.playback = this.data.asPlayback(this.context);
                    if (play) {
                        this.play(END + 1).then(() => good(this.playback));
                    }
                    else {
                        good(this.playback);
                    }
                });
            });
        });
    }
    play(atTick = 1) {
        this.playback.connect(this.context.destination);
        this.playback.loop = true;
        return new Promise(good => {
            this.clock.listenOnce(atTick % constants_1.TICKS, () => {
                this.playback.start();
                this.isPlaying = true;
                good();
            });
        });
    }
    stop() {
        this.isRecording = false;
        if (!this.playback) {
            return;
        }
        this.playback.stop();
        this.playback.disconnect(this.context.destination);
        this.isPlaying = false;
        console.log('Stopped playback');
    }
    recv(ev) {
        if (!this.isRecording) {
            return;
        }
        this.data.process(ev);
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
    constructor(bpm) {
        this.worker = new Worker(constants_1.WORKER_URL);
        this.currentTick = 1;
        this.listeners = [];
        this.worker.addEventListener('message', ev => this.tick(ev.data));
        this.bpm = bpm;
    }
    tick(tickCount) {
        this.currentTick = tickCount;
        const cbs = this.listeners[tickCount];
        if (cbs) {
            cbs.forEach(cb => cb(tickCount));
        }
    }
    update(bpm) {
        if (bpm) {
            this.bpm = bpm;
        }
        this.worker.postMessage(this.bpm);
    }
    start() {
        this.update();
    }
    stop() {
        this.worker.removeEventListener('message');
    }
    listenOnce(tickCount, callback) {
        let idx = -1;
        idx = this.addListener(tickCount, (t) => {
            this.rmListener(tickCount, idx);
            callback(t);
        });
    }
    /*
        Add the callback for the given tick.
        Returns the index of the the listener;
    */
    addListener(tickCount, callback) {
        if (!this.listeners[tickCount]) {
            this.listeners[tickCount] = [];
        }
        const idx = this.listeners[tickCount].push(callback) - 1;
        if (this.currentTick === tickCount) {
            callback(this.currentTick);
        }
        return idx;
    }
    addListeners(tickCount, callback) {
        return tickCount.map(tc => this.addListener(tc, callback));
    }
    /*
        Remove the given index from `listeners`. As returned from `addListener`.
    */
    rmListener(tickCount, index) {
        if (index < 0 || index >= this.listeners[tickCount].length) {
            return;
        }
        this.listeners[tickCount].splice(index, 1);
    }
    rmListeners(tickCount, index) {
        index.forEach(i => this.rmListener(tickCount, i));
    }
}
exports.Clock = Clock;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const loopManager_1 = __webpack_require__(1);
const lman = new loopManager_1.LoopManager(240);
const loop1 = lman.addLoop('test loop', 1);
// loop1.createBuffer(); // pre-record
let d = Date.now();
lman.clock.addListener(1, () => {
    console.log(Date.now() - d);
    d = Date.now();
});
// loop1.createStream()
// 	.then(input => {
// 		input.connect(lman.context.destination); // echo out
// 		loop1.record()
// 			.then(playback => {
// 				// loop1.stop();
// 			});
// 	})
lman.clock.addListeners([1, 5, 9, 13], (tick) => {
    const osc = lman.context.createOscillator();
    osc.connect(lman.context.destination);
    osc.frequency.value = 110;
    if (tick === 13) {
        osc.frequency.value += 20;
    }
    console.log(tick);
    osc.start();
    osc.stop(lman.context.currentTime + 0.1);
});
// let a = lman.clock.addListener(1, () => {
// 	console.log('tick 1');
// });
// let b = lman.clock.addListener(8, () => {
// 	console.log('tick 8');
// });
// lman.clock.start(); 


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class DataChunks {
    constructor(numChannels) {
        this.numChannels = numChannels;
        this.chunksLength = 0;
        this.chunks = [];
        for (var i = 0; i < numChannels; i++) {
            this.chunks.push(new Float32Array(0));
        }
    }
    process(ev) {
        for (var i = 0; i < this.numChannels; i++) {
            let newChunks = ev.inputBuffer.getChannelData(i);
            let oldChunks = this.chunks[i].slice();
            this.chunks[i] = mergeBuffers([oldChunks, newChunks], oldChunks.length + newChunks.length);
            console.log('processed channel', i, 'with length', newChunks.length);
        }
    }
    asPlayback(ctx) {
        let buf = ctx.createBuffer(this.numChannels, this.chunks[0].length, ctx.sampleRate);
        for (var i = 0; i < this.numChannels; i++) {
            buf.copyToChannel(this.chunks[i], i);
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        return src;
    }
}
exports.DataChunks = DataChunks;
function mergeBuffers(recBuffers, recLength) {
    let result = new Float32Array(recLength);
    let offset = 0;
    for (let i = 0; i < recBuffers.length; i++) {
        result.set(recBuffers[i], offset);
        offset += recBuffers[i].length;
    }
    return result;
}


/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map
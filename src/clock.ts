import {WORKER_URL, TICKS} from './constants';

export class Clock {
	currentTick: number;

	private listeners: {[t: number]: Function[]};
	private worker: Worker;
	private bpm: number;

	constructor(bpm: number) {
		this.worker = new Worker(WORKER_URL);
		this.currentTick = 1;
		this.listeners = [];


		this.worker.addEventListener('message', ev => this.tick(ev.data));
		this.bpm = bpm;
	}

	private tick(tickCount: number) {
		this.currentTick = tickCount;
		const cbs = this.listeners[tickCount];

		if (cbs) {
			cbs.forEach(cb => cb(tickCount));
		}
	}

	update(bpm?: number) {
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

	listenOnce(tickCount: number, callback: Function) {
		let idx = -1;
		idx = this.addListener(tickCount, (t: number) => {
			this.rmListener(tickCount, idx);
			callback(t);
		});
	}

	/*
		Add the callback for the given tick. 
		Returns the index of the the listener;
	*/
	addListener(tickCount: number, callback: Function): number {
		if (!this.listeners[tickCount]) {
			this.listeners[tickCount] = [];
		}

		const idx = this.listeners[tickCount].push(callback) - 1;
		if (this.currentTick === tickCount) {
			callback(this.currentTick);
		}

		return idx;
	}

	addListeners(tickCount: number[], callback: Function): number[] {
		return tickCount.map(tc => this.addListener(tc, callback));
	}

	/*
		Remove the given index from `listeners`. As returned from `addListener`.
	*/
	rmListener(tickCount: number, index: number) {
		if (index < 0 || index >= this.listeners[tickCount].length) {
			return;
		}
		this.listeners[tickCount].splice(index, 1);
	}

	rmListeners(tickCount: number, index: number[]) {
		index.forEach(i => this.rmListener(tickCount, i));
	}
}
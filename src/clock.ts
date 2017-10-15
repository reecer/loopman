import {WORKER_URL} from './constants';

interface ClockListener {
	tickCount: number
	callback: Function
}

export class Clock {
	currentTick: number;

	private listeners: {[t: number]: Function[]};
	private worker: Worker;
	private bpm: number;
	private measures: number;

	constructor(bpm: number, measures: number) {
		this.worker = new Worker(WORKER_URL);
		this.currentTick = 0;
		this.listeners = [];

		this.worker.addEventListener('message', ev => this.tick(ev.data));
		this.bpm = bpm;
		this.measures = measures;
	}

	private tick(tickCount: number) {
		this.currentTick = tickCount;
		const cbs = this.listeners[tickCount];

		if (cbs) {
			cbs.forEach(cb => cb(tickCount));
		}
	}

	public update(bpm?: number, measures?: number) {
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

	public start() {
		this.update();
	}

	public stop() {
		this.worker.removeEventListener('message');
	}

	/*
		Add the callback for the given tick. 
		Returns the index of the the listener;
	*/
	public addListener(tickCount: number, callback: Function): number {
		if (!this.listeners[tickCount]) {
			this.listeners[tickCount] = [];
		}

		console.log(this.listeners);

		return this.listeners[tickCount].push(callback) - 1;
	}

	/*
		Remove the given index from `listeners`. As returned from `addListener`.
	*/
	public rmListener(tickCount: number, index: number) {
		this.listeners[tickCount].splice(index, 1);
	}
}
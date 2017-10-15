import {ILoop} from './constants';
import {Loop} from './loop';
import {Clock} from './clock';

export class LoopManager {
	clock: Clock;
	context: AudioContext;
	private loops: Loop[];
	private _bpm: number;

	constructor(bpm = 60) {
		this.loops = [];
		this.clock = new Clock(bpm);
		this.context = new AudioContext();
		this._bpm = bpm;
		this.clock.start();
	}

	// TODO: define `timing`
	addLoop(name: string, counts: number): Loop {
		const l = new Loop(name, this.context, this.clock, counts);
		this.loops.push(l);
		return l;
	}

	rmLoop(name: string) {
		this.loops = this.loops.filter(l => l.name !== name);
	}

	stop() {
		this.loops.forEach(l => l.stop());
	}


	set bpm(bpm: number) {
		this._bpm = bpm;
		this.clock.update(bpm);
	}

	get bpm(): number {
		return this._bpm;
	}
}
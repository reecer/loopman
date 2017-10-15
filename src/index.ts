import {ILoop, TICKS} from './constants';
import {Loop} from './loop';
import {Clock} from './clock';

export class LoopManager {
	clock: Clock;
	private loops: Loop[];
	private context: AudioContext;
	private _measureCount: number;
	private _bpm: number;

	constructor(bpm = 60, measures = 4) {
		this.loops = [];
		this.clock = new Clock(bpm, measures);
		this.context = new AudioContext();
		this._bpm = bpm;
		this._measureCount = measures;
	}

	addLoop(name: string, timing: number): Loop {
		if (timing <= 0 || timing > this.measureCount * TICKS) {
			throw "`timing` is outside the bounds of possible ticks";
		}

		const l = new Loop(name, this.context, this.clock, timing);
		this.loops.push(l);
		return l;
	}

	rmLoop(name: string) {
		this.loops = this.loops.filter(l => l.name !== name);
	}


	set bpm(bpm: number) {
		this._bpm = bpm;
		this.clock.update(bpm, this.measureCount);
	}

	get bpm(): number {
		return this._bpm;
	}

	set measureCount(measures: number) {
		this._measureCount = measures;
		this.clock.update(this.bpm, measures);
	}

	get measureCount(): number {
		return this._measureCount;
	}
}
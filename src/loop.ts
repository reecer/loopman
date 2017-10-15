import {ILoop, InputBuffer} from './constants';
import {DataChunks} from './dataChunks';
import {Clock} from './clock';

export class Loop implements ILoop {
	name: string
	context: AudioContext
	input: InputBuffer
	volume: GainNode
	processor: ScriptProcessorNode
	clock: Clock
	playback: AudioBuffer
	data: DataChunks
	timing: number // Number of ticks in the (16 * measureCount) total
	isPlaying: boolean
	isRecoding: boolean

	/*
		@param timing The number of ticks of the total MEASURES * 16
	*/
	constructor(name: string, ctx: AudioContext, clk: Clock, timing: number) {
		this.name = name;
		this.context = ctx;
		this.clock = clk;
		this.timing = timing;
	}
}
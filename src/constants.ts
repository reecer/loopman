import {Clock} from './clock';
import {DataChunks} from './dataChunks';

export const TICKS = 16; // ticks per measure
export const WORKER_URL = '../lib/worker.js';

// Some union types
export type SourceNode = AudioBufferSourceNode | MediaStreamAudioSourceNode;

// We accept either default .wav's, or WebAudioAPI input (AudioBuffer)
export type InputSource = AudioBuffer | string;

// Depending on our InputSource, we either have a buffer || a stream
export type InputBuffer = AudioBuffer | MediaStream;

export interface ILoop {
	name: string
	context: AudioContext
	// input: InputBuffer
	input: SourceNode
	volume: GainNode
	processor: ScriptProcessorNode
	clock: Clock
	playback: AudioBufferSourceNode
	data: DataChunks
	duration: number // Number of ticks this loop is
	isPlaying: boolean
	isRecording: boolean
}
import {Clock} from './clock';
import {DataChunks} from './dataChunks';
import * as path from 'path';

export const TICKS = 16; // ticks per measure
export const WORKER_URL = '../lib/worker.js';
export const MEASURE_COUNT = 4;

// Some union types
export type SourceNode = AudioBufferSourceNode | MediaStreamAudioSourceNode;

// We accept either default .wav's, or WebAudioAPI input (AudioBuffer)
export type InputSource = AudioBuffer | string;

// Depending on our InputSource, we either have a buffer || a stream
export type InputBuffer = AudioBuffer | MediaStream;

export interface ILoop {
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
}
import {ILoop, SourceNode, TICKS} from './constants';
import {DataChunks} from './dataChunks';
import {Clock} from './clock';

export class Loop implements ILoop {
	name: string
	context: AudioContext
	input: SourceNode
	volume: GainNode
	processor: ScriptProcessorNode
	clock: Clock
	playback: AudioBufferSourceNode
	data: DataChunks
	duration: number // Number of ticks this loop is
	isPlaying: boolean = false;
	isRecording: boolean = false;

	constructor(name: string, ctx: AudioContext, clk: Clock, counts: number, numChannels = 2) {
		this.name = name;
		this.context = ctx;
		this.clock = clk;
		this.duration = counts;
		this.volume = ctx.createGain();
		this.processor = ctx.createScriptProcessor();
		this.data = new DataChunks(numChannels);

		this.volume.connect(ctx.destination);
		this.processor.addEventListener('audioprocess', this.recv.bind(this));
	}

	// Pre-recorded audio
	createBuffer(srcPath: string) {
		throw "TODO";
	}

	// Live input
	createStream(): Promise<SourceNode> {
        // TODO: polyfill
        return navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
            	const source = this.context.createMediaStreamSource(stream);
            	source.connect(this.processor);
            	return source;
            });
	}

	record(play = true): Promise<AudioBufferSourceNode> {
		const START = 1;
		const END = START + this.duration;

		return new Promise<AudioBufferSourceNode>((good, bad) => {
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
					} else {
						good(this.playback);
					}
				})
			});

		});
	}

	play(atTick = 1): Promise<null> {
		this.playback.connect(this.context.destination);
		this.playback.loop = true;
		return new Promise(good => {
			this.clock.listenOnce(atTick % TICKS, () => {
				this.playback.start();
				this.isPlaying = true;
				good();
			});
		})
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

	private recv(ev: AudioProcessingEvent) {
		if (!this.isRecording) {
			return;
		}

		this.data.process(ev);
	}
}

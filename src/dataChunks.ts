
export class DataChunks {
	numChannels: number;
	chunks: Float32Array[];
	chunksLength: number;

	constructor(numChannels: number) {
		this.numChannels = numChannels;
		this.chunksLength = 0;
		this.chunks = [];

		for (var i = 0; i < numChannels; i++) {
			this.chunks.push(new Float32Array(0)); 
		}
	}

	process(ev: AudioProcessingEvent) {
		for (var i = 0; i < this.numChannels; i++) {
			let newChunks = ev.inputBuffer.getChannelData(i);
			let oldChunks = this.chunks[i].slice();
			this.chunks[i] = mergeBuffers([oldChunks, newChunks], oldChunks.length + newChunks.length);
			console.log('processed channel', i, 'with length', newChunks.length);
		}
	}

	asPlayback(ctx: AudioContext): AudioBufferSourceNode {
		let buf = ctx.createBuffer(this.numChannels, this.chunks[0].length, ctx.sampleRate);
		for (var i = 0; i < this.numChannels; i++) {
			buf.copyToChannel(this.chunks[i], i);
		}

		const src = ctx.createBufferSource();
		src.buffer = buf;

		return src;
	}
}

function mergeBuffers(recBuffers: Float32Array[], recLength: number) {
  let result = new Float32Array(recLength);
  let offset = 0;
  for (let i = 0; i < recBuffers.length; i++) {
      result.set(recBuffers[i], offset);
      offset += recBuffers[i].length;
  }
  return result;
}
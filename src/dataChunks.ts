
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

	// TODO: receive chunks
}
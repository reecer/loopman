const path = require('path');

module.exports = {
	entry: {
		lib: './src/index.ts',
		test: './test/test.ts'
	},
	output: {
		filename: '[name]/index.js',
		// library: 'LoopMan',
		// libraryTarget: 'var',
	},   
	resolve: {
    	extensions: ['.ts', '.tsx', '.js'] // if using webpack1, add '' too
  	},

    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader", exclude: ['node_modules'] },
            // { test: /worker\.ts$/, loader: "file-loader" }
        ]
    }
};
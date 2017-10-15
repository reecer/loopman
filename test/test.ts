import {LoopManager} from '../src/loopManager';

const lman = new LoopManager(240);
const loop1 = lman.addLoop('test loop', 1);
// loop1.createBuffer(); // pre-record


let d = Date.now();
lman.clock.addListener(1, () => {
	console.log(Date.now() - d);
	d = Date.now();
});


// loop1.createStream()
// 	.then(input => {
// 		input.connect(lman.context.destination); // echo out


// 		loop1.record()
// 			.then(playback => {
// 				// loop1.stop();
// 			});
// 	})

lman.clock.addListeners([1,5,9,13], (tick: number) => {
	const osc = lman.context.createOscillator();
	osc.connect(lman.context.destination);
	osc.frequency.value = 110;
	if (tick === 13) {
		osc.frequency.value += 20;
	}

	console.log(tick);

	osc.start();
	osc.stop(lman.context.currentTime + 0.1);
})
// let a = lman.clock.addListener(1, () => {
// 	console.log('tick 1');
// });

// let b = lman.clock.addListener(8, () => {
// 	console.log('tick 8');
// });

// lman.clock.start();
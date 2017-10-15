import {LoopManager} from '../src';
import {MEASURE_COUNT} from '../src/constants';

const lman = new LoopManager(60, MEASURE_COUNT);
// const loop1 = lman.addLoop('test loop', 4);

let a = lman.clock.addListener(1, () => {
	console.log('tick 1');
});

let b = lman.clock.addListener(8, () => {
	console.log('tick 8');
});

console.log(a, b);

lman.clock.start();
/*
  Using a web worker's `setInterval` to acheive precise timing. 
*/

const MS_PER_MIN = 60 * 1000; // ms in a minute
const TICKS = 16; // Must be synced with constants

var intvl;

// Given bpm, emit every `TICKS`-th beat
self.onmessage = (ev) => {
  if (intvl) {
    clearInterval(intvl);
  }

  // Type check just in case
  let bpm = parseInt(ev.data);
  if (isNaN(bpm)) return;

  console.log('Starting worker with bpm', bpm);

  var tick = 0;
  let tickRate = MS_PER_MIN / bpm;

  // tick every 16th beat
  intvl = setInterval(() => {
    tick = (tick % TICKS) + 1
    self.postMessage(tick);
  }, tickRate)
};

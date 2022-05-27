let totalSeconds = performance.now() * 0.001;
let deltaSeconds = 0;
// let datetime = new Date();

function __onEnterFrameGlobal() {
  const now = performance.now() * 0.001;
  deltaSeconds = now - totalSeconds;
  totalSeconds = now;
  requestAnimationFrame(__onEnterFrameGlobal);
}

__onEnterFrameGlobal();

export const globalTime = {
  // get datetime() { return datetime; },
  get totalSeconds() {
    return totalSeconds;
  },
  get deltaSeconds() {
    return deltaSeconds;
  },
};

export default globalTime;

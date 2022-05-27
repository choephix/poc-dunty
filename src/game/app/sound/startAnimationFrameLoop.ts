export function startAnimationFrameLoop(callback: FrameRequestCallback) {
  let lastTime = 0;
  let frameId: number;

  function loop(time: number) {
    frameId = requestAnimationFrame(loop);
    const delta = time - lastTime;
    lastTime = time;

    callback(delta);
  }

  loop(performance.now());

  return () => cancelAnimationFrame(frameId);
}

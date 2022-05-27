export function onEnterFrame(fn: Function) {
  function loop() {
    fn();
    requestAnimationFrame(loop);
  }
  loop();
}

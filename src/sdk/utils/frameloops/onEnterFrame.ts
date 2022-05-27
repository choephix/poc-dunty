export function onEnterFrame(onEnterFrameFunc: Function) {
  let cancelled: boolean = false;
  let handle: number = -1;
  const animate = () => {
    if (!cancelled) {
      onEnterFrameFunc();
      handle = requestAnimationFrame(animate);
    }
  };
  animate();
  return () => {
    cancelAnimationFrame(handle);
    cancelled = true;
  };
}

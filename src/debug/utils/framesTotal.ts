export const __framesTotal = {
  currentCount: 0,
};

function onEnterFrame() {
  __framesTotal.currentCount++;
  requestAnimationFrame(onEnterFrame);
}

onEnterFrame();

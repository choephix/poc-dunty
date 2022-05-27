type TweenOnProgressCallback = (progress: number) => unknown;

interface TweenTask {
  startTime: number;
  endTime: number;
  duration: number;
  onProgressChange: TweenOnProgressCallback;
}

export function createTimeline() {
  const tweens: TweenTask[] = [];

  let timelineLength = 0;
  let timelineProgress = 0;

  function addTween(
    cb: TweenOnProgressCallback,
    duration: number = 1,
    startTime: number = timelineLength
  ) {
    const endTime = startTime + duration;
    tweens.push({
      onProgressChange: cb,
      duration,
      startTime,
      endTime: endTime,
    });

    if (timelineLength < endTime) {
      timelineLength = endTime;
    }
  }

  function updateTweens() {
    for (const tween of tweens) {
      if (tween.startTime > timelineProgress) continue;
      if (tween.endTime < timelineProgress) continue;
      const tweenProgress =
        (timelineProgress - tween.startTime) / tween.duration;
      tween.onProgressChange(tweenProgress);
    }
  }

  function progress(deltaTime: number) {
    timelineProgress += deltaTime;
    if (timelineProgress > timelineLength) timelineProgress = timelineLength;
    if (timelineProgress < 0) timelineProgress = 0;
    updateTweens();
  }

  return {
    addTween,
    progress,
    isAtTheStart() {
      return timelineProgress <= 0;
    },
    isAtTheEnd() {
      return timelineProgress >= timelineLength;
    },
    get timelineLength() {
      return timelineLength;
    },
    get timelineProgress() {
      return timelineProgress;
    },
    get tweens() {
      return tweens;
    },
  };
}

export function playTimeline(tl: any, ticker: any) {
  return new Promise<void>((resolve) => {
    function onEnterFrame(dt: number) {
      tl.progress(dt / 60);
      if (tl.isAtTheEnd()) {
        ticker.remove(onEnterFrame);
        resolve();
      }
    }
    ticker.add(onEnterFrame);
    tl.progress(0);
  });
}

export function playTimelineInReverse(tl: any, ticker: any) {
  return new Promise<void>((resolve) => {
    function onEnterFrame(dt: number) {
      tl.progress(-dt / 60);
      if (tl.isAtTheStart()) {
        ticker.remove(onEnterFrame);
        resolve();
      }
    }
    ticker.add(onEnterFrame);
    tl.progress(0);
  });
}

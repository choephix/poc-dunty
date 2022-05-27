type TweenOnProgressCallback = (progress: number) => unknown;

interface TweenTask {
  startTime: number;
  endTime: number | null;
  duration: number | null;
  onProgressChange: TweenOnProgressCallback;
}

export class SimpleTimeline {
  readonly tweens: TweenTask[] = [];

  private timelineLength = 0;
  private timelineProgress = 0;

  constructor() {}

  addTween(cb: TweenOnProgressCallback, duration: number = 1, startTime: number = this.timelineLength) {
    const endTime = startTime + duration;
    this.tweens.push({
      onProgressChange: cb,
      duration,
      startTime,
      endTime: endTime,
    });

    if (this.timelineLength < endTime) {
      this.timelineLength = endTime;
    }
  }

  addIndefiniteTween(cb: TweenOnProgressCallback, startTime: number = this.timelineLength) {
    this.tweens.push({
      onProgressChange: cb,
      startTime,
      endTime: null,
      duration: null,
    });
  }

  progress(deltaTime: number) {
    this.timelineProgress += deltaTime;
    if (this.timelineProgress > this.timelineLength) this.timelineProgress = this.timelineLength;
    if (this.timelineProgress < 0) this.timelineProgress = 0;
    this.updateTweens();
  }

  isAtTheStart() {
    return this.timelineProgress <= 0;
  }

  isAtTheEnd() {
    return this.timelineProgress >= this.timelineLength;
  }

  private updateTweens() {
    for (const tween of this.tweens) {
      if (tween.startTime > this.timelineProgress) continue;
      if (tween.endTime != null && tween.endTime < this.timelineProgress) continue;

      if (tween.duration) {
        const tweenProgress = (this.timelineProgress - tween.startTime) / tween.duration;
        tween.onProgressChange(tweenProgress);
      } else {
        tween.onProgressChange(0);
      }
    }
  }

  reset() {
    this.timelineProgress = 0;
  }

  clear() {
    this.tweens.length = 0;
    this.timelineLength = 0;
    this.timelineProgress = 0;
  }
}

export function playTimeline(tl: any, ticker: any) {
  return new Promise<void>(resolve => {
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
  return new Promise<void>(resolve => {
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

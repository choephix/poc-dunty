type IAnimation = Readonly<{
  // then: (resolve: (...args: any[]) => unknown, reject: (reason: any) => unknown) => unknown;
  // play?: () => unknown;
  // cancel?: () => unknown;
  onStart?: () => unknown;
  onEnterFrame?: (dt: number) => unknown | boolean;
  onComplete?: () => unknown | boolean;
  duration?: number;
  ended?: boolean;
}>;

type ITimelineAnimationTask = Readonly<{
  startTime: number;
  animation: IAnimation;
}>;

type CleanUpFunction = () => unknown;
type ITicker = {
  add: (callback: (deltaTime: number) => unknown) => CleanUpFunction;
};

export function createTimelineAnimation(ticker: ITicker) {
  let totalTimelineLength = 0;

  const tasks: ITimelineAnimationTask[] = [];

  let currentAnimation = null as { cancel(): void } | null;

  function add(animation: IAnimation, startTime: number = totalTimelineLength) {
    tasks.push({ startTime, animation });
    totalTimelineLength = startTime + (animation.duration || 0);
  }

  function addTween({
    startTime = totalTimelineLength,
    duration = 1.0,
    onEnterFrame,
    ease = (n) => n,
  }: {
    onEnterFrame: (progress: number) => unknown;
    duration?: number;
    startTime?: number;
    ease?: (t: number) => number;
  }) {
    let timeElapsed = 0;
    add(
      {
        onStart() {
          timeElapsed = 0;
        },
        onEnterFrame(dt) {
          timeElapsed += dt;
          onEnterFrame(ease(timeElapsed / duration));
        },
        duration,
        get ended() {
          return timeElapsed >= duration;
        },
      },
      startTime
    );
  }

  function addCallback(
    cb: () => unknown,
    startTime: number = totalTimelineLength
  ) {
    add(
      {
        onStart: cb,
        ended: true,
      },
      startTime
    );
  }

  function play() {
    stop();

    const timeTotal = totalTimelineLength;
    let timePlayed = 0;
    let isRunning = true;

    const tasksInQueue: ITimelineAnimationTask[] = [...tasks];
    const tasksInProgress: ITimelineAnimationTask[] = [];

    function onEnterFrame(dt: number) {
      timePlayed += dt;

      for (const { animation } of tasksInProgress) {
        animation.onEnterFrame?.(dt);
      }

      for (let i = tasksInQueue.length - 1; i >= 0; i--) {
        const { animation, startTime } = tasksInQueue[i];
        if (timePlayed >= startTime) {
          tasksInProgress.push(...tasksInQueue.splice(i, 1));
          animation.onStart?.();
          animation.onEnterFrame?.(0);
        }
      }

      for (let i = tasksInProgress.length - 1; i >= 0; i--) {
        const { animation, startTime } = tasksInProgress[i];
        const ended =
          animation.ended || startTime + animation.duration < timePlayed;
        if (!ended) continue;

        animation.onComplete?.();
        tasksInProgress.splice(i, 1);
      }

      if (tasksInQueue.length == 0 && tasksInProgress.length == 0) {
        removeFromTicker();
      }
    }

    const removeFromTicker = ticker.add(onEnterFrame);

    const animationInstance = {
      get tasksInQueueCount() {
        return tasksInQueue.length;
      },
      get tasksInProgressCount() {
        return tasksInProgress.length;
      },
      get isRunning() {
        return isRunning;
      },
      get timeTotal() {
        return timeTotal;
      },
      get timePlayed() {
        return timePlayed;
      },
      get timeRemaining() {
        return timeTotal - timePlayed;
      },
      get progress() {
        return timePlayed / timeTotal;
      },
      cancel() {
        isRunning = false;
        removeFromTicker();
      },
    };

    __window__.ani = animationInstance;
    currentAnimation = animationInstance;

    return animationInstance;
  }

  function stop() {
    if (currentAnimation) {
      currentAnimation.cancel();
      currentAnimation = null;
    }
  }

  return {
    add,
    addTween,
    addCallback,
    play,
    stop,
    get currentAnimation() {
      return currentAnimation;
    },
  };
}

import { createSimpleTicker, SimpleTicker } from "./SimpleTicker";

const $defaultTicker = createSimpleTicker();

export type SimpleTweenUpdateCallback = (deltaSeconds: number) => unknown;

export type SimpleTweenOptions = {
  duration: number;
  easeFunc?: (progress: number) => number;
};

const DefaultSimpleTweenOptions: Required<SimpleTweenOptions> = {
  duration: 1,
  easeFunc: x => x,
};

export function createSimpleTweener(ticker: SimpleTicker = $defaultTicker) {
  const updateOptions: Required<SimpleTweenOptions> = {
    ...DefaultSimpleTweenOptions,
  };
  let updateCallback: null | SimpleTweenUpdateCallback = null;
  let updateTimeFactor = 1;
  let progress: number = 0;
  let running = false;

  const advance = (dt: number) => {
    progress += dt * updateTimeFactor;

    if (progress >= 1) {
      progress = 1;
    }

    if (updateCallback) {
      updateCallback(updateOptions.easeFunc(progress));
    }

    if (progress >= 1) {
      updateCallback = null;
      monkeysResolve.forEach(resolve => resolve());
      monkeysResolve.length = 0;
      stopPlaying();
    }
  };

  const stopPlaying = () => {
    ticker.remove(advance);
    running = false;

    monkeysFinally.forEach(fin => fin());
    monkeysFinally.length = 0;
    monkeysResolve.length = 0;
    monkeysResolve.length = 0;
  };

  const start = () => {
    ticker.add(advance);
    running = true;
  };

  /**
   * [ resolve, reject ] []
   */
  const monkeysResolve: Function[] = [];
  const monkeysReject: Function[] = [];
  const monkeysFinally: Function[] = [];

  return {
    tween(cb: SimpleTweenUpdateCallback, options: number | Partial<SimpleTweenOptions>) {
      Object.assign(
        updateOptions,
        DefaultSimpleTweenOptions,
        typeof options === "number" ? { duration: options } : options
      );

      if (running) {
        stopPlaying();
        monkeysReject.forEach(reject => reject());
        monkeysReject.length = 0;
      }

      monkeysResolve.length = 0;
      monkeysResolve.length = 0;
      monkeysFinally.length = 0;

      let isRunning = true;
      monkeysFinally.push(() => (isRunning = false));

      updateCallback = cb;
      updateTimeFactor = 1 / updateOptions.duration;
      progress = 0;
      start();
      advance(0);

      return {
        get isRunning() {
          return running;
        },
        then(cb: () => unknown) {
          monkeysResolve.push(cb);
        },
        catch(cb: () => unknown) {
          monkeysReject.push(cb);
        },
        finally(cb: () => unknown) {
          monkeysFinally.push(cb);
        },
        cancel(reject: boolean = false) {
          if (reject) {
            monkeysReject.forEach(reject => reject());
          } else {
            monkeysResolve.forEach(resolve => resolve());
          }
          stopPlaying();
        },
      };
    },
    fromTo(from: number, to: number, cb: SimpleTweenUpdateCallback, options: number | Partial<SimpleTweenOptions>) {
      const delta = to - from;
      return this.tween(progress => cb(from + delta * progress), options);
    },
    stopPlaying,
  };
}

export type SimpleTweener = ReturnType<typeof createSimpleTweener>;

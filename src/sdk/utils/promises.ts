/**
 * @returns A promise, which resolve on the next render frame.
 */
export function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

export function delay(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

//// ///// ///// /////

export type CancellablePromiseLike<T> = PromiseLike<T> & { cancel: () => any };

export function delayCancellable(seconds: number) {
  let handle: any | undefined = undefined;
  const promise: Promise<void> & { cancel?: () => any } = new Promise<void>(
    done => (handle = setTimeout(done, seconds * 1000))
  );
  promise.cancel = () => handle && clearTimeout(handle);
  return promise as Promise<void> & { cancel: () => any };
}

//// ///// ///// /////

/**
 * Repeat a call to an asynchronous function endlessly, with specified time interval between calls.
 *
 * This is close to analogous to `setInterval()`, with the main difference being,
 * that the custom function will be awaited before starting the countdown till the next call.
 *
 * For example, if you provide a function with exectution time around 500 milliseconds,
 * and specify an interval of 3 seconds, the function will be called roughly every ~3.5 seconds.
 *
 * This ensures, that multiple calls to this function will never overlap with each other,
 * even if the calls taking longer than the interval to resolve.
 *
 * Useful when you need to handle regular api requests or other communication methods in a loop.
 *
 * @param update The function to be called every {interval} seconds
 * @param interval
 * @returns A function. When called, the loop will be cancelled
 * and there will be no next call to the update() function.
 */
export function runLogicLoop(update: () => PromiseLike<any>, interval: number) {
  let cancel = false;

  async function loop() {
    while (!cancel) {
      try {
        await update();
      } catch (e) {
        console.error(e);
      } finally {
        await delay(interval);
      }
    }
  }

  /** Run asynchronously in the background */
  loop();

  /** Return a way for us to cancel the loop at some point */
  return () => (cancel = true);
}

//// ///// ///// /////
//// ///// ///// /////
//// ///// ///// /////
//// ///// ///// /////
//// ///// ///// /////

/**
 * @param promise primise to await
 * @param timeout in seconds
 */
export const orTimeout = <T>(promise: PromiseLike<T>, timeout: number = 1.0) => {
  return Promise.race([promise, delay(timeout)]);
};

//// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// ////

export type PossiblePromiseLike<T> = T | PromiseLike<T>;

export function resolveValueOrError<T>(value: PossiblePromiseLike<T>) {
  return new Promise<T | Error>(resolve => {
    Promise.resolve(value)
      .then(result => resolve(result))
      .catch(error => resolve(error as Error));
  });
}

export async function runSequentially(...promises: (() => PromiseLike<unknown>)[]) {
  for (const promise of promises) {
    await promise();
  }
}

//// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// //// ////

export async function executeAndMeasureTime<T>(promise: Promise<T>): Promise<[T, number]> {
  const start = performance.now();
  const result = await promise;
  return [result, performance.now() - start];
}

export function deferredPromise<T = void>() {
  let resolve: (value: T) => void;
  const promise = new Promise<T>(r => (resolve = r));
  return {
    promise,
    resolve(arg: T) {
      resolve(arg);
    },
  };
}

export function throttle<TArgs extends any[]>(
  fn: (...args: TArgs) => unknown,
  threshhold: number = 0.5,
  scope?: any
): (...args: TArgs) => void {
  threshhold *= 1000; // Convert to milliseconds
  let last: number;
  let timeoutHandle: any;
  return function (this: any, ...args: TArgs) {
    const context = scope || this;
    const now = +performance.now();
    if (last && now < last + threshhold) {
      clearTimeout(timeoutHandle);
      timeoutHandle = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

export module throttle {
  export function hardcore<TArgs extends any[]>(
    fn: (...args: TArgs) => unknown,
    threshhold: number = 0.5,
    scope?: any
  ): (...args: TArgs) => void {
    threshhold *= 1000; // Convert to milliseconds
    let ignoreInvokes: boolean;
    const reset = function () {
      ignoreInvokes = false;
    };
    return function (this: any, ...args: TArgs) {
      if (ignoreInvokes) {
        return;
      }
      ignoreInvokes = true;
      setTimeout(reset, threshhold);
      return fn.apply(scope || this, args);
    };
  }
}

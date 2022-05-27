type Falsy = false | 0 | '' | null | undefined;
type Truthy<T> = T extends Falsy ? never : NonNullable<T>;

type CallbackWithCallerName = (() => void) & { __caller?: string };

export class CallbacksTicker {
  private readonly funcs: CallbackWithCallerName[] = [];
  constructor(public readonly debug: boolean = false) {
    this.startLoop();
  }
  private startLoop() {
    const funcs = this.funcs;
    function tick() {
      for (const func of funcs) {
        try {
          func();
        } catch (e) {
          console.error(func, e);
        }
      }
      requestAnimationFrame(tick);
    }
    tick();
  }
  public add(func: () => void) {
    const funcs = this.funcs;
    if (!func || !func.call) {
      console.error(`Tried add ${func} to functions ticker for some reasone... `);
      return () => {};
    }
    if (this.debug) {
      const __caller = new Error().stack?.split('\n    at ')[3] ?? 'idk';
      func = Object.assign(func, { __caller });
    }
    funcs.push(func);
    return function () {
      const i = funcs.indexOf(func);
      i > -1 && funcs.splice(i, 1);
    };
  }
}

const ticker = new CallbacksTicker(false);

/**
 * @param condition primise will resolve the first time this returns true
 */
export const waitUntil = Object.assign(
  function waitUntil<T = boolean>(condition: () => T) {
    return new Promise<Truthy<T>>(resolve => {
      const cleanup = ticker.add(function onWaitUntilEnterFrame() {
        const result = condition();
        if (!!result) {
          resolve(result as Truthy<T>);
          cleanup();
        }
      });
    });
  },
  {
    ticker,
    cancellable<T>(condition: () => T, onTruthy: (value: Truthy<T>) => unknown) {
      let cancel = null as null | Function;
      new Promise<Truthy<T>>(resolve => {
        cancel = ticker.add(function onWaitUntilEnterFrame() {
          const result = condition();
          if (!!result) {
            resolve(result as Truthy<T>);
            cancel!();
          }
        });
      }).then(onTruthy);
      return cancel as () => void;
    },
  }
);

/**
 * @param condition primise will resolve the first time this returns a truthy value
 * Additionally, if it returns an error object, it will immediaely be thrown
 */
export function waitUntilOrThrowError<T = boolean>(condition: () => T | Error) {
  return new Promise<Truthy<T>>((resolve, reject) => {
    const cleanup = ticker.add(function onWaitUntilOrThrowErrorEnterFrame() {
      const result = condition();
      if (!!result) {
        if (result instanceof Error) {
          // console.warn(`will throw error!!!!`)
          reject(result);
        } else {
          resolve(result as Truthy<T>);
        }
        cleanup();
      }
    });
  });
};
